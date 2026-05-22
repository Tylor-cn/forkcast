import { StateCreator } from 'zustand'
import { Dish } from '@/types'
import { AppStore } from '../useAppStore'

export interface DishSlice {
  dishes: Dish[]
  addDish: (dish: Dish) => void
  updateDish: (id: string, updates: Partial<Dish>) => void
  deleteDish: (id: string) => void
  setDishes: (dishes: Dish[]) => void
}

export const createDishSlice: StateCreator<AppStore, [], [], DishSlice> = (set) => ({
  dishes: [],

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
})
