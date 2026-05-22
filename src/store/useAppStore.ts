import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_DISHES } from '@/utils/demoData'
import { initializeTagWeights, initializeCuisineWeights } from './utils'
import { DishSlice, createDishSlice } from './slices/dishSlice'
import { FeedbackSlice, createFeedbackSlice } from './slices/feedbackSlice'
import { RecommendSlice, createRecommendSlice } from './slices/recommendSlice'
import { SessionSlice, createSessionSlice } from './slices/sessionSlice'
import { BackupSlice, createBackupSlice } from './slices/backupSlice'

export type AppStore = DishSlice & FeedbackSlice & RecommendSlice & SessionSlice & BackupSlice

export { computeCuisineYieldRate } from './slices/recommendSlice'

export const useAppStore = create<AppStore>()(
  persist(
    (set, get, store) => ({
      ...createDishSlice(set, get, store),
      ...createFeedbackSlice(set, get, store),
      ...createRecommendSlice(set, get, store),
      ...createSessionSlice(set, get, store),
      ...createBackupSlice(set, get, store),
      tagWeights: initializeTagWeights(),
      cuisineWeights: initializeCuisineWeights(),
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
