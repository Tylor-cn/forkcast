import { StateCreator } from 'zustand'
import {
  Dish,
  FeedbackType,
  TagWeight,
  CuisineWeight,
  PickRecord,
  BackupRecord,
  TAG_ASSOCIATIONS,
} from '@/types'
import { AppStore } from '../useAppStore'
import { clamp } from '../utils'
import {
  REJECT_SHORT_PENALTY,
  REJECT_LONG_PENALTY,
  REJECT_ASSOCIATION_PENALTY,
  PICK_SHORT_BOOST,
  PICK_LONG_BOOST,
  BACKUP_SHORT_BOOST,
  BACKUP_LONG_BOOST,
  CONSECUTIVE_REJECT_FACTOR,
  MAX_CONSECUTIVE_PENALTY,
  PICK_IMMUNITY_MS,
  CUISINE_REJECT_SHORT_PENALTY,
  CUISINE_REJECT_LONG_PENALTY,
  CUISINE_PICK_SHORT_BOOST,
  CUISINE_PICK_LONG_BOOST,
  CUISINE_BACKUP_SHORT_BOOST,
  CUISINE_BACKUP_LONG_BOOST,
} from '../constants'

export interface FeedbackSlice {
  tagWeights: Record<string, TagWeight>
  cuisineWeights: Record<string, CuisineWeight>
  consecutiveRejects: number
  pickHistory: PickRecord[]
  shownInSession: Record<string, FeedbackType>
  rejectedInSession: string[]
  hasCompletedPick: boolean
  lastPickedDish?: Dish
  handleFeedback: (dishId: string, feedbackType: FeedbackType) => void
}

export const createFeedbackSlice: StateCreator<AppStore, [], [], FeedbackSlice> = (set, get) => ({
  tagWeights: {},
  cuisineWeights: {},
  consecutiveRejects: 0,
  pickHistory: [],
  shownInSession: {},
  rejectedInSession: [],
  hasCompletedPick: false,
  lastPickedDish: undefined,

  handleFeedback: (dishId, feedbackType) => {
    const state = get()
    const dish = state.dishes.find(d => d.id === dishId)
    if (!dish) return

    const newTagWeights = { ...state.tagWeights }
    const newCuisineWeights = { ...state.cuisineWeights }

    const isPickImmune = dish.stats.lastPickTimestamp != null &&
      (Date.now() - dish.stats.lastPickTimestamp) < PICK_IMMUNITY_MS

    const escalation = feedbackType === 'reject'
      ? 1 + Math.min(state.consecutiveRejects * CONSECUTIVE_REJECT_FACTOR, MAX_CONSECUTIVE_PENALTY)
      : 1
    const longTermEscalation = 1 + (escalation - 1) * 0.3

    dish.tags.forEach(tagId => {
      const weight = newTagWeights[tagId]
      if (!weight) return

      if (feedbackType === 'reject') {
        weight.shortTermWeight = clamp(weight.shortTermWeight * REJECT_SHORT_PENALTY / escalation)
        weight.longTermWeight = clamp(weight.longTermWeight * REJECT_LONG_PENALTY / longTermEscalation)

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
        weight.shortTermWeight = clamp(weight.shortTermWeight * CUISINE_REJECT_SHORT_PENALTY / escalation)
        weight.longTermWeight = clamp(weight.longTermWeight * CUISINE_REJECT_LONG_PENALTY / longTermEscalation)
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

    const newShownInSession = { ...state.shownInSession, [dishId]: feedbackType }
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
        consecutiveRejects: newConsecutiveRejects,
        shownInSession: newShownInSession,
        rejectedInSession: newRejectedInSession,
      })
    }
  },
})
