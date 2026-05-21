import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Dish,
  FeedbackType,
  SessionMode,
  TagWeight,
  CuisineWeight,
  PickRecord,
  BackupRecord,
  SessionRecord,
  UserPreferences,
  PREDEFINED_TAGS,
  TAG_ASSOCIATIONS,
} from '@/types'
import { DEMO_DISHES } from '@/utils/demoData'

interface AppStore {
  dishes: Dish[]
  tagWeights: Record<string, TagWeight>
  cuisineWeights: Record<string, CuisineWeight>
  excludedTags: string[]
  consecutiveRejects: number
  pickHistory: PickRecord[]
  backupList: BackupRecord[]
  sessions: SessionRecord[]
  currentSession?: SessionRecord
  shownInSession: Record<string, FeedbackType | 'shown'>
  rejectedInSession: string[]
  initialExcludedTags: string[]
  preferences: UserPreferences
  hasCompletedPick: boolean
  lastPickedDish?: Dish
  refreshCount: number
  lastRecommendedIds: string[]

  addDish: (dish: Dish) => void
  updateDish: (id: string, updates: Partial<Dish>) => void
  deleteDish: (id: string) => void
  setDishes: (dishes: Dish[]) => void
  handleFeedback: (dishId: string, feedbackType: FeedbackType) => void
  refreshRecommendation: () => void
  startNewSession: () => void
  excludeTag: (tagId: string) => void
  removeExcludedTag: (tagId: string) => void
  addToBackup: (dishId: string) => void
  removeFromBackup: (id: string) => void
  pickFromBackup: (id: string) => void
  resetPreferences: () => void
  setSessionMode: (mode: SessionMode) => void
  setMixedRatio: (ratio: number) => void
  setInitialExclusion: (tags: string[]) => void
  getCurrentRecommendations: () => Dish[]
  updateLastRecommendedIds: (ids: string[]) => void
}

const WEIGHT_MIN = 0.2
const WEIGHT_MAX = 3.0
const clamp = (value: number): number => Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, value))

const REJECT_SHORT_PENALTY = 0.35
const REJECT_LONG_PENALTY = 0.75
const REJECT_ASSOCIATION_PENALTY = 0.35
const PICK_SHORT_BOOST = 1.5
const PICK_LONG_BOOST = 1.1
const BACKUP_SHORT_BOOST = 1.2
const BACKUP_LONG_BOOST = 1.05
const CONSECUTIVE_REJECT_FACTOR = 0.12
const MAX_CONSECUTIVE_PENALTY = 0.6
const PICK_IMMUNITY_MS = 24 * 60 * 60 * 1000

const CUISINE_REJECT_SHORT_PENALTY = 0.5
const CUISINE_REJECT_LONG_PENALTY = 0.75
const CUISINE_PICK_SHORT_BOOST = 1.3
const CUISINE_PICK_LONG_BOOST = 1.05
const CUISINE_BACKUP_SHORT_BOOST = 1.15
const CUISINE_BACKUP_LONG_BOOST = 1.03

const DISH_DECAY_TAU = 2 * 24 * 60 * 60 * 1000
const CUISINE_DECAY_TAU = 7 * 24 * 60 * 60 * 1000

const CONTEXT_BONUS_TIME = 1.3
const CONTEXT_BONUS_SEASON = 1.15

type ShownResult = 'shown' | 'backup' | 'reject' | 'pick'

const SHOWN_PENALTY_VALUES: Record<ShownResult, number> = {
  pick: 1.0,
  backup: 0.85,
  reject: 0.3,
  shown: 0.5,
}

const timeDecay = (timestamp: number, tau: number): number => {
  const elapsed = Date.now() - timestamp
  return Math.exp(-elapsed / tau)
}

const getShownPenalty = (dishId: string, shownMap: Record<string, ShownResult>): number => {
  const result = shownMap[dishId]
  if (result === undefined) return 1.0
  return SHOWN_PENALTY_VALUES[result]
}

const initializeTagWeights = (): Record<string, TagWeight> => {
  const weights: Record<string, TagWeight> = {}
  PREDEFINED_TAGS.forEach(tag => {
    weights[tag.id] = { tagId: tag.id, shortTermWeight: 1.0, longTermWeight: 1.0 }
  })
  return weights
}

const initializeCuisineWeights = (): Record<string, CuisineWeight> => {
  const weights: Record<string, CuisineWeight> = {}
  PREDEFINED_TAGS.filter(t => t.category === 'cuisine').forEach(cuisine => {
    weights[cuisine.id] = { cuisineId: cuisine.id, shortTermWeight: 1.0, longTermWeight: 1.0 }
  })
  return weights
}

const calculateScore = (
  dish: Dish,
  tagWeights: Record<string, TagWeight>,
  cuisineWeights: Record<string, CuisineWeight>,
  preferences: UserPreferences,
  shownInSession: Record<string, ShownResult>
): number => {
  let tagScoreSum = 0
  let tagCount = 0
  dish.tags.forEach(tagId => {
    const weight = tagWeights[tagId]
    if (weight) {
      const mixedWeight = preferences.sessionMode === 'short'
        ? weight.shortTermWeight
        : preferences.sessionMode === 'long'
        ? weight.longTermWeight
        : weight.shortTermWeight * preferences.mixedRatio + weight.longTermWeight * (1 - preferences.mixedRatio)
      tagScoreSum += mixedWeight
      tagCount++
    }
  })
  const tagScore = tagCount > 0 ? tagScoreSum / tagCount : 1.0

  let cuisineScoreSum = 0
  let cuisineCount = 0
  dish.tags.filter(t => t.startsWith('cuisine-')).forEach(cuisineId => {
    const weight = cuisineWeights[cuisineId]
    if (weight) {
      const mixedWeight = preferences.sessionMode === 'short'
        ? weight.shortTermWeight
        : preferences.sessionMode === 'long'
        ? weight.longTermWeight
        : weight.shortTermWeight * preferences.mixedRatio + weight.longTermWeight * (1 - preferences.mixedRatio)
      cuisineScoreSum += mixedWeight
      cuisineCount++
    }
  })
  const cuisineScore = cuisineCount > 0 ? cuisineScoreSum / cuisineCount : 1.0

  let timeBonus = 1.0
  if (dish.stats.lastPickTimestamp) {
    const dishDecay = timeDecay(dish.stats.lastPickTimestamp, DISH_DECAY_TAU)
    timeBonus = 0.5 + 0.5 * dishDecay
  }

  let contextBonus = 1.0
  const hour = new Date().getHours()
  const month = new Date().getMonth() + 1

  if (hour >= 6 && hour <= 9 && dish.tags.includes('period-breakfast')) contextBonus *= CONTEXT_BONUS_TIME
  else if (hour >= 11 && hour <= 13 && dish.tags.includes('period-lunch')) contextBonus *= CONTEXT_BONUS_TIME
  else if (hour >= 14 && hour <= 17 && dish.tags.includes('period-snack')) contextBonus *= CONTEXT_BONUS_TIME
  else if (hour >= 18 && hour <= 21 && dish.tags.includes('period-dinner')) contextBonus *= CONTEXT_BONUS_TIME
  else if (hour >= 22 || hour <= 1 && dish.tags.includes('period-midnight')) contextBonus *= CONTEXT_BONUS_TIME

  if (month >= 3 && month <= 5 && dish.tags.includes('season-spring')) contextBonus *= CONTEXT_BONUS_SEASON
  else if (month >= 6 && month <= 8 && dish.tags.includes('season-summer')) contextBonus *= CONTEXT_BONUS_SEASON
  else if (month >= 9 && month <= 11 && dish.tags.includes('season-autumn')) contextBonus *= CONTEXT_BONUS_SEASON
  else if (month === 12 || month <= 2 && dish.tags.includes('season-winter')) contextBonus *= CONTEXT_BONUS_SEASON

  const shownPenalty = getShownPenalty(dish.id, shownInSession)

  return tagScore * cuisineScore * timeBonus * contextBonus * shownPenalty
}

const calculateDiversityScore = (
  candidate: { dish: Dish; cuisines: string[]; tastes: string[] },
  selected: { dish: Dish; cuisines: string[]; tastes: string[] }[]
): number => {
  if (selected.length === 0) return 1.0

  let totalDiversity = 0

  selected.forEach(s => {
    const cuisineOverlap = candidate.cuisines.filter(c => s.cuisines.includes(c)).length
    const cuisineDiversity = 1 - (cuisineOverlap / Math.max(candidate.cuisines.length, 1))

    const tasteOverlap = candidate.tastes.filter(t => s.tastes.includes(t)).length
    const tasteDiversity = 1 - (tasteOverlap / Math.max(candidate.tastes.length, 1))

    const tagOverlap = candidate.dish.tags.filter(t => s.dish.tags.includes(t)).length
    const tagDiversity = 1 - (tagOverlap / Math.max(candidate.dish.tags.length, 1))

    totalDiversity += cuisineDiversity * 0.5 + tasteDiversity * 0.3 + tagDiversity * 0.2
  })

  return totalDiversity / selected.length
}

export const computeCuisineYieldRate = (
  cuisineId: string,
  pickHistory: PickRecord[],
  dishes: Dish[]
): number => {
  const picks = pickHistory.filter(p => p.tags.includes(cuisineId)).length
  const rejects = dishes
    .filter(d => d.tags.includes(cuisineId))
    .reduce((sum, d) => sum + d.stats.rejectCount, 0)
  const total = picks + rejects
  return total > 0 ? picks / total : 0.5
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      dishes: [],
      tagWeights: initializeTagWeights(),
      cuisineWeights: initializeCuisineWeights(),
      excludedTags: [],
      initialExcludedTags: [],
      consecutiveRejects: 0,
      pickHistory: [],
      backupList: [],
      sessions: [],
      currentSession: undefined,
      shownInSession: {},
      rejectedInSession: [],
      preferences: {
        sessionMode: 'mixed',
        mixedRatio: 0.6,
      },
      hasCompletedPick: false,
      lastPickedDish: undefined,
      refreshCount: 0,
      lastRecommendedIds: [],

      addDish: (dish) => {
        set(state => ({ dishes: [...state.dishes, dish] }))
      },

      updateDish: (id, updates) => {
        set(state => ({
          dishes: state.dishes.map(d => d.id === id ? { ...d, ...updates } : d)
        }))
      },

      deleteDish: (id) => {
        set(state => ({
          dishes: state.dishes.filter(d => d.id !== id)
        }))
      },

      setDishes: (dishes) => {
        set({ dishes })
      },

      handleFeedback: (dishId, feedbackType) => {
        const state = get()
        const dish = state.dishes.find(d => d.id === dishId)
        if (!dish) return

        const newTagWeights = { ...state.tagWeights }
        const newCuisineWeights = { ...state.cuisineWeights }

        const isPickImmune = dish.stats.lastPickTimestamp != null &&
          (Date.now() - dish.stats.lastPickTimestamp) < PICK_IMMUNITY_MS

        dish.tags.forEach(tagId => {
          const weight = newTagWeights[tagId]
          if (!weight) return

          if (feedbackType === 'reject') {
            const escalation = 1 + Math.min(state.consecutiveRejects * CONSECUTIVE_REJECT_FACTOR, MAX_CONSECUTIVE_PENALTY)
            weight.shortTermWeight = clamp(weight.shortTermWeight * REJECT_SHORT_PENALTY * escalation)
            weight.longTermWeight = clamp(weight.longTermWeight * REJECT_LONG_PENALTY * (1 + escalation * 0.3))

            if (!isPickImmune) {
              const associations = TAG_ASSOCIATIONS[tagId]
              if (associations) {
                associations.forEach(relatedTag => {
                  const relatedWeight = newTagWeights[relatedTag]
                  if (relatedWeight) {
                    relatedWeight.shortTermWeight = clamp(relatedWeight.shortTermWeight * REJECT_ASSOCIATION_PENALTY)
                  }
                })
              }
            }
          } else if (feedbackType === 'backup') {
            weight.shortTermWeight = clamp(weight.shortTermWeight * BACKUP_SHORT_BOOST)
            weight.longTermWeight = clamp(weight.longTermWeight * BACKUP_LONG_BOOST)
          } else if (feedbackType === 'pick') {
            weight.shortTermWeight = clamp(weight.shortTermWeight * PICK_SHORT_BOOST)
            weight.longTermWeight = clamp(weight.longTermWeight * PICK_LONG_BOOST)
          }
        })

        const cuisineTags = dish.tags.filter(t => t.startsWith('cuisine-'))
        cuisineTags.forEach(cuisineId => {
          const weight = newCuisineWeights[cuisineId]
          if (!weight) return

          if (feedbackType === 'reject') {
            const escalation = 1 + Math.min(state.consecutiveRejects * CONSECUTIVE_REJECT_FACTOR, MAX_CONSECUTIVE_PENALTY)
            weight.shortTermWeight = clamp(weight.shortTermWeight * CUISINE_REJECT_SHORT_PENALTY * escalation)
            weight.longTermWeight = clamp(weight.longTermWeight * CUISINE_REJECT_LONG_PENALTY * (1 + escalation * 0.3))
          } else if (feedbackType === 'backup') {
            weight.shortTermWeight = clamp(weight.shortTermWeight * CUISINE_BACKUP_SHORT_BOOST)
            weight.longTermWeight = clamp(weight.longTermWeight * CUISINE_BACKUP_LONG_BOOST)
          } else if (feedbackType === 'pick') {
            weight.shortTermWeight = clamp(weight.shortTermWeight * CUISINE_PICK_SHORT_BOOST)
            weight.longTermWeight = clamp(weight.longTermWeight * CUISINE_PICK_LONG_BOOST)
          }
        })

        const newConsecutiveRejects = feedbackType === 'reject'
          ? state.consecutiveRejects + 1
          : 0

        const updatedDishes = state.dishes.map(d => {
          if (d.id === dishId) {
            return {
              ...d,
              stats: {
                ...d.stats,
                rejectCount: feedbackType === 'reject' ? d.stats.rejectCount + 1 : d.stats.rejectCount,
                pickCount: feedbackType === 'pick' ? d.stats.pickCount + 1 : d.stats.pickCount,
                lastPickTimestamp: feedbackType === 'pick' ? Date.now() : d.stats.lastPickTimestamp,
              }
            }
          }
          return d
        })

        const newShownInSession = { ...state.shownInSession, [dishId]: feedbackType as ShownResult }
        const newRejectedInSession = feedbackType === 'reject'
          ? [...state.rejectedInSession, dishId]
          : state.rejectedInSession

        if (feedbackType === 'backup') {
          const backupRecord: BackupRecord = {
            id: `backup-${Date.now()}`,
            dishId,
            addedAt: Date.now(),
          }
          set({
            dishes: updatedDishes,
            tagWeights: newTagWeights,
            cuisineWeights: newCuisineWeights,
            consecutiveRejects: newConsecutiveRejects,
            shownInSession: newShownInSession,
            backupList: [...state.backupList, backupRecord],
          })
        } else if (feedbackType === 'pick') {
          const pickRecord: PickRecord = {
            id: `pick-${Date.now()}`,
            dishId,
            dishName: dish.name,
            tags: dish.tags,
            timestamp: Date.now(),
          }
          set({
            dishes: updatedDishes,
            tagWeights: newTagWeights,
            cuisineWeights: newCuisineWeights,
            shownInSession: newShownInSession,
            pickHistory: [pickRecord, ...state.pickHistory],
            hasCompletedPick: true,
            lastPickedDish: dish,
          })
        } else {
          set({
            dishes: updatedDishes,
            tagWeights: newTagWeights,
            cuisineWeights: newCuisineWeights,
            shownInSession: newShownInSession,
            rejectedInSession: newRejectedInSession,
          })
        }
      },

      refreshRecommendation: () => {
        set(state => ({ refreshCount: state.refreshCount + 1 }))
      },

      startNewSession: () => {
        const state = get()
        const newSession: SessionRecord = {
          id: `session-${Date.now()}`,
          startTime: Date.now(),
          feedbackCount: 0,
          mode: state.preferences.sessionMode,
        }

        const newTagWeights = { ...state.tagWeights }
        Object.keys(newTagWeights).forEach(tagId => {
          newTagWeights[tagId] = { ...newTagWeights[tagId], shortTermWeight: 1.0 }
        })

        const newCuisineWeights = { ...state.cuisineWeights }
        Object.keys(newCuisineWeights).forEach(cuisineId => {
          newCuisineWeights[cuisineId] = { ...newCuisineWeights[cuisineId], shortTermWeight: 1.0 }
        })

        set({
          currentSession: newSession,
          shownInSession: {},
          rejectedInSession: [],
          hasCompletedPick: false,
          lastPickedDish: undefined,
          refreshCount: 0,
          tagWeights: newTagWeights,
          cuisineWeights: newCuisineWeights,
        })
      },

      addToBackup: (dishId) => {
        const state = get()
        if (!state.backupList.some(b => b.dishId === dishId)) {
          set({ backupList: [...state.backupList, { id: `backup-${Date.now()}`, dishId, addedAt: Date.now() }] })
        }
      },

      removeFromBackup: (id) => {
        set(state => ({ backupList: state.backupList.filter(b => b.id !== id) }))
      },

      pickFromBackup: (id) => {
        const state = get()
        const backup = state.backupList.find(b => b.id === id)
        if (backup) {
          const dish = state.dishes.find(d => d.id === backup.dishId)
          if (dish) {
            state.handleFeedback(dish.id, 'pick')
            set(state => ({ backupList: state.backupList.filter(b => b.id !== id) }))
          }
        }
      },

      resetPreferences: () => {
        set(state => ({
          tagWeights: initializeTagWeights(),
          cuisineWeights: initializeCuisineWeights(),
          pickHistory: [],
          backupList: [],
          excludedTags: [],
          initialExcludedTags: [],
          consecutiveRejects: 0,
          shownInSession: {},
          rejectedInSession: [],
          refreshCount: 0,
          dishes: state.dishes.map(d => ({
            ...d,
            stats: { pickCount: 0, rejectCount: 0, lastPickTimestamp: undefined }
          }))
        }))
      },

      excludeTag: (tagId) => {
        set(state => ({ excludedTags: [...state.excludedTags, tagId] }))
      },

      removeExcludedTag: (tagId) => {
        set(state => ({ excludedTags: state.excludedTags.filter(t => t !== tagId) }))
      },

      setSessionMode: (mode) => {
        set(state => ({ preferences: { ...state.preferences, sessionMode: mode } }))
      },

      setMixedRatio: (ratio) => {
        set(state => ({ preferences: { ...state.preferences, mixedRatio: ratio } }))
      },

      setInitialExclusion: (tags: string[]) => {
        set({
          initialExcludedTags: tags,
          excludedTags: [...tags, ...get().excludedTags.filter(t => !tags.includes(t))],
        })
      },

      getCurrentRecommendations: () => {
        const state = get()
        if (state.dishes.length === 0) return []

        const allExcluded = [...state.initialExcludedTags, ...state.excludedTags]

        const backupIds = new Set(state.backupList.map(b => b.dishId))
        const survivors = state.dishes.filter(d =>
          !state.rejectedInSession.includes(d.id) &&
          !backupIds.has(d.id) &&
          !d.tags.some(tag => allExcluded.includes(tag))
        )

        const scored = survivors
          .map(dish => ({
            dish,
            score: calculateScore(dish, state.tagWeights, state.cuisineWeights, state.preferences, state.shownInSession),
            cuisines: dish.tags.filter(t => t.startsWith('cuisine-')),
            tastes: dish.tags.filter(t => t.startsWith('taste-')),
          }))
          .filter(c => c.score > 0)
          .sort((a, b) => b.score - a.score)

        if (scored.length === 0) return []
        if (scored.length <= 3) return scored.map(c => c.dish)

        const pickCuisineSet = new Set(
          state.pickHistory.flatMap(p => p.tags.filter(t => t.startsWith('cuisine-')))
        )

        const cuisineCount: Record<string, number> = {}
        state.pickHistory.forEach(p => {
          p.tags.filter(t => t.startsWith('cuisine-')).forEach(c => {
            cuisineCount[c] = (cuisineCount[c] || 0) + 1
          })
        })
        const topCuisines = Object.entries(cuisineCount)
          .sort(([, a], [, b]) => b - a)
          .map(([c]) => c)

        const pickBestByDiversity = (
          candidates: typeof scored,
          alreadySelected: typeof scored
        ): typeof scored[0] | undefined => {
          if (candidates.length === 0) return undefined
          if (candidates.length === 1) return candidates[0]
          return candidates
            .map(c => ({
              ...c,
              compositeScore: c.score * 0.5 + calculateDiversityScore(c, alreadySelected) * 0.5,
            }))
            .sort((a, b) => b.compositeScore - a.compositeScore)[0]
        }

        let safety = scored.find(c => c.cuisines.some(cu => topCuisines.includes(cu))) || scored[0]

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const recentBackupCuisines = new Set(
          state.backupList
            .filter(b => b.addedAt > weekAgo)
            .map(b => state.dishes.find(d => d.id === b.dishId)?.tags.filter(t => t.startsWith('cuisine-')) || [])
            .flat()
        )

        const familiarCandidates = scored.filter(c =>
          c.cuisines.some(cu => recentBackupCuisines.has(cu)) &&
          c.dish.id !== safety.dish.id
        )
        let familiar = familiarCandidates.length > 0
          ? pickBestByDiversity(familiarCandidates, [safety])
          : scored.find(c => c.dish.id !== safety.dish.id)
        if (!familiar) familiar = scored[Math.min(1, scored.length - 1)]

        const neverPickedCuisines = new Set(
          [...new Set(state.dishes.flatMap(d => d.tags.filter(t => t.startsWith('cuisine-'))))]
            .filter(cu => !pickCuisineSet.has(cu))
        )

        const selectedIds = new Set([safety.dish.id, familiar.dish.id])
        const novelCandidates = scored.filter(c =>
          c.cuisines.some(cu => neverPickedCuisines.has(cu)) &&
          !selectedIds.has(c.dish.id)
        )
        let novel = novelCandidates.length > 0
          ? pickBestByDiversity(novelCandidates, [safety, familiar])
          : scored.find(c => !selectedIds.has(c.dish.id))
        if (!novel) novel = scored.find(c =>
          c.dish.id !== safety.dish.id && c.dish.id !== familiar.dish.id
        ) || scored[Math.min(2, scored.length - 1)]

        const dedupSet = new Set<string>()
        const result: Dish[] = []
        for (const c of [safety, familiar, novel]) {
          if (c && !dedupSet.has(c.dish.id)) {
            dedupSet.add(c.dish.id)
            result.push(c.dish)
          }
        }

        const lastTags = state.lastRecommendedIds
          .flatMap(id => state.dishes.find(d => d.id === id)?.tags || [])

        if (lastTags.length > 0) {
          const overlapIdx = result.findIndex(d => {
            const overlap = d.tags.filter(t => lastTags.includes(t)).length
            return overlap / d.tags.length > 0.5
          })
          if (overlapIdx >= 0 && scored.length > 3) {
            const replacement = scored.find(c =>
              !result.some(r => r.id === c.dish.id) &&
              !c.cuisines.some(cu => result.some(r => r.tags.includes(cu)))
            )
            if (replacement) result[overlapIdx] = replacement.dish
          }
        }

        return result
      },

      updateLastRecommendedIds: (ids: string[]) => {
        set({ lastRecommendedIds: ids })
      },
    }),
    {
      name: 'lunch-picker-storage',
      partialize: (state) => ({
        dishes: state.dishes,
        tagWeights: state.tagWeights,
        cuisineWeights: state.cuisineWeights,
        pickHistory: state.pickHistory,
        backupList: state.backupList,
        sessions: state.sessions,
        preferences: state.preferences,
        lastRecommendedIds: state.lastRecommendedIds,
        initialExcludedTags: state.initialExcludedTags,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (Array.isArray(state.shownInSession)) {
          state.shownInSession = {}
        }
        if (state.dishes && state.dishes.length > 0) {
          state.dishes.forEach(d => {
            if (d.stats && !('lastPickTimestamp' in d.stats)) {
              d.stats.lastPickTimestamp = undefined
            }
          })
        } else if (state.dishes && state.dishes.length === 0) {
          state.dishes = DEMO_DISHES
        }
      },
    }
  )
)
