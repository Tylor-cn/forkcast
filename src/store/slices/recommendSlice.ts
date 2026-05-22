import { StateCreator } from 'zustand'
import { Dish, TagWeight, CuisineWeight, UserPreferences, PickRecord } from '@/types'
import { AppStore } from '../useAppStore'
import { timeDecay, getShownPenalty } from '../utils'
import {
  ShownResult,
  DISH_DECAY_TAU,
  CONTEXT_BONUS_TIME,
  CONTEXT_BONUS_SEASON,
} from '../constants'

export interface RecommendSlice {
  refreshCount: number
  lastRecommendedIds: string[]
  refreshRecommendation: () => void
  getCurrentRecommendations: () => Dish[]
  updateLastRecommendedIds: (ids: string[]) => void
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
  else if ((hour >= 22 || hour <= 1) && dish.tags.includes('period-midnight')) contextBonus *= CONTEXT_BONUS_TIME

  if (month >= 3 && month <= 5 && dish.tags.includes('season-spring')) contextBonus *= CONTEXT_BONUS_SEASON
  else if (month >= 6 && month <= 8 && dish.tags.includes('season-summer')) contextBonus *= CONTEXT_BONUS_SEASON
  else if (month >= 9 && month <= 11 && dish.tags.includes('season-autumn')) contextBonus *= CONTEXT_BONUS_SEASON
  else if ((month === 12 || month <= 2) && dish.tags.includes('season-winter')) contextBonus *= CONTEXT_BONUS_SEASON

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

export const createRecommendSlice: StateCreator<AppStore, [], [], RecommendSlice> = (set, get) => ({
  refreshCount: 0,
  lastRecommendedIds: [],

  refreshRecommendation: () => {
    set(state => ({ refreshCount: state.refreshCount + 1 }))
  },

  updateLastRecommendedIds: (ids: string[]) => {
    set({ lastRecommendedIds: ids })
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
        score: calculateScore(dish, state.tagWeights, state.cuisineWeights, state.preferences, state.shownInSession as Record<string, ShownResult>),
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
})
