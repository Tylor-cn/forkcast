import { StateCreator } from 'zustand'
import { BackupRecord } from '@/types'
import { AppStore } from '../useAppStore'

export interface BackupSlice {
  backupList: BackupRecord[]
  addToBackup: (dishId: string) => void
  removeFromBackup: (id: string) => void
  pickFromBackup: (id: string) => void
}

export const createBackupSlice: StateCreator<AppStore, [], [], BackupSlice> = (set, get) => ({
  backupList: [],

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
})
