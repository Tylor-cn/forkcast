import { StateCreator } from 'zustand'
import { SessionMode, SessionRecord } from '@/types'
import { AppStore } from '../useAppStore'
import { initializeTagWeights, initializeCuisineWeights } from '../utils'

export interface SessionSlice {
  excludedTags: string[]
  initialExcludedTags: string[]
  sessions: SessionRecord[]
  currentSession?: SessionRecord
  preferences: { sessionMode: SessionMode; mixedRatio: number }
  startNewSession: () => void
  excludeTag: (tagId: string) => void
  removeExcludedTag: (tagId: string) => void
  resetPreferences: () => void
  setSessionMode: (mode: SessionMode) => void
  setMixedRatio: (ratio: number) => void
  setInitialExclusion: (tags: string[]) => void
}

export const createSessionSlice: StateCreator<AppStore, [], [], SessionSlice> = (set, get) => ({
  excludedTags: [],
  initialExcludedTags: [],
  sessions: [],
  currentSession: undefined,
  preferences: {
    sessionMode: 'mixed',
    mixedRatio: 0.6,
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

  excludeTag: (tagId) => {
    set(state => ({ excludedTags: [...state.excludedTags, tagId] }))
  },

  removeExcludedTag: (tagId) => {
    set(state => ({ excludedTags: state.excludedTags.filter(t => t !== tagId) }))
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
})
