import { TagWeight, CuisineWeight, PREDEFINED_TAGS } from '@/types'
import { WEIGHT_MIN, WEIGHT_MAX, SHOWN_PENALTY_VALUES, ShownResult } from './constants'

export const clamp = (value: number): number =>
  Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, value))

export const timeDecay = (timestamp: number, tau: number): number => {
  const elapsed = Date.now() - timestamp
  return Math.exp(-elapsed / tau)
}

export const getShownPenalty = (dishId: string, shownMap: Record<string, ShownResult>): number => {
  const result = shownMap[dishId]
  if (result === undefined) return 1.0
  return SHOWN_PENALTY_VALUES[result]
}

export const initializeTagWeights = (): Record<string, TagWeight> => {
  const weights: Record<string, TagWeight> = {}
  PREDEFINED_TAGS.forEach(tag => {
    weights[tag.id] = { tagId: tag.id, shortTermWeight: 1.0, longTermWeight: 1.0 }
  })
  return weights
}

export const initializeCuisineWeights = (): Record<string, CuisineWeight> => {
  const weights: Record<string, CuisineWeight> = {}
  PREDEFINED_TAGS.filter(t => t.category === 'cuisine').forEach(cuisine => {
    weights[cuisine.id] = { cuisineId: cuisine.id, shortTermWeight: 1.0, longTermWeight: 1.0 }
  })
  return weights
}
