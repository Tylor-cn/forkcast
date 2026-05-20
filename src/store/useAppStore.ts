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

interface AppStore {
  // 菜单库
  dishes: Dish[]
  
  // Tag 权重
  tagWeights: Record<string, TagWeight>
  
  // 菜系权重
  cuisineWeights: Record<string, CuisineWeight>
  
  // 排除的标签（Elimination by Aspects）
  excludedTags: string[]
  
  // 连续拒绝次数（Information Foraging）
  consecutiveRejects: number
  
  // Pick 历史
  pickHistory: PickRecord[]
  
  // 备选列表
  backupList: BackupRecord[]
  
  // Session 记录
  sessions: SessionRecord[]
  currentSession?: SessionRecord
  
  // Session 内状态
  shownInSession: string[]
  rejectedInSession: string[]
  
  // 上一批次的标签（用于多样性保障）
  lastBatchTags: string[][]
  
  // 用户偏好
  preferences: UserPreferences
  
  // UI 状态
  hasCompletedPick: boolean
  lastPickedDish?: Dish
  refreshCount: number
  
  // 上次推荐的菜品ID（用于批次间多样性）
  lastRecommendedIds: string[]
  
  // Actions
  addDish: (dish: Dish) => void
  updateDish: (id: string, updates: Partial<Dish>) => void
  deleteDish: (id: string) => void
  setDishes: (dishes: Dish[]) => void
  
  handleFeedback: (dishId: string, feedbackType: FeedbackType) => void
  refreshRecommendation: () => void
  startNewSession: () => void
  
  // 排除标签操作
  excludeTag: (tagId: string) => void
  removeExcludedTag: (tagId: string) => void
  
  addToBackup: (dishId: string) => void
  removeFromBackup: (id: string) => void
  pickFromBackup: (id: string) => void
  
  resetPreferences: () => void
  setSessionMode: (mode: SessionMode) => void
  setMixedRatio: (ratio: number) => void
  
  getCurrentRecommendations: () => Dish[]
  updateLastRecommendedIds: (ids: string[]) => void
}

// 初始化 Tag 权重
const initializeTagWeights = (): Record<string, TagWeight> => {
  const weights: Record<string, TagWeight> = {}
  PREDEFINED_TAGS.forEach(tag => {
    weights[tag.id] = {
      tagId: tag.id,
      shortTermWeight: 1.0,
      longTermWeight: 1.0,
    }
  })
  return weights
}

// 初始化菜系权重
const initializeCuisineWeights = (): Record<string, CuisineWeight> => {
  const weights: Record<string, CuisineWeight> = {}
  const cuisines = PREDEFINED_TAGS.filter(t => t.category === 'cuisine')
  cuisines.forEach(cuisine => {
    weights[cuisine.id] = {
      cuisineId: cuisine.id,
      shortTermWeight: 1.0,
      longTermWeight: 1.0,
    }
  })
  return weights
}

// 计算推荐分数
const calculateScore = (
  dish: Dish,
  tagWeights: Record<string, TagWeight>,
  cuisineWeights: Record<string, CuisineWeight>,
  preferences: UserPreferences,
  shownInSession: string[],
  rejectedInSession: string[],
  excludedTags: string[]  // 新增：排除的标签
): number => {
  // Elimination by Aspects：排除的标签直接返回0
  if (dish.tags.some(tag => excludedTags.includes(tag))) {
    return 0
  }
  
  // 已拒绝的不推荐
  if (rejectedInSession.includes(dish.id)) {
    return 0
  }
  
  // 计算Tag权重得分
  let tagScore = 0
  dish.tags.forEach(tagId => {
    const weight = tagWeights[tagId]
    if (weight) {
      const mixedWeight = preferences.sessionMode === 'short'
        ? weight.shortTermWeight
        : preferences.sessionMode === 'long'
        ? weight.longTermWeight
        : weight.shortTermWeight * preferences.mixedRatio + weight.longTermWeight * (1 - preferences.mixedRatio)
      tagScore += mixedWeight
    }
  })
  
  // 计算菜系权重得分
  let cuisineScore = 1.0
  const cuisineTags = dish.tags.filter(t => t.startsWith('cuisine-'))
  cuisineTags.forEach(cuisineId => {
    const weight = cuisineWeights[cuisineId]
    if (weight) {
      const mixedWeight = preferences.sessionMode === 'short'
        ? weight.shortTermWeight
        : preferences.sessionMode === 'long'
        ? weight.longTermWeight
        : weight.shortTermWeight * preferences.mixedRatio + weight.longTermWeight * (1 - preferences.mixedRatio)
      cuisineScore *= mixedWeight
    }
  })
  
  // 随机因子（增加多样性）
  const randomFactor = 0.8 + Math.random() * 0.4 // 0.8-1.2
  
  // 已展示过的降低分数
  const shownPenalty = shownInSession.includes(dish.id) ? 0.5 : 1.0
  
  // 最终得分
  return tagScore * cuisineScore * randomFactor * shownPenalty
}

// 计算多样性分数（用于批次内多样性选择）
// 分数越高 = 与已选菜品差异越大 = 多样性越好
const calculateDiversityScore = (
  candidate: { dish: Dish; cuisines: string[]; tastes: string[] },
  selected: { dish: Dish; cuisines: string[]; tastes: string[] }[]
): number => {
  if (selected.length === 0) return 1.0
  
  let totalDiversity = 0
  
  selected.forEach(s => {
    // 菜系多样性（不同菜系 = 高分）
    const cuisineOverlap = candidate.cuisines.filter(c => s.cuisines.includes(c)).length
    const cuisineDiversity = 1 - (cuisineOverlap / Math.max(candidate.cuisines.length, 1))
    
    // 口味多样性
    const tasteOverlap = candidate.tastes.filter(t => s.tastes.includes(t)).length
    const tasteDiversity = 1 - (tasteOverlap / Math.max(candidate.tastes.length, 1))
    
    // 标签多样性
    const tagOverlap = candidate.dish.tags.filter(t => s.dish.tags.includes(t)).length
    const tagDiversity = 1 - (tagOverlap / Math.max(candidate.dish.tags.length, 1))
    
    // 加权：菜系 > 口味 > 其他标签
    totalDiversity += cuisineDiversity * 0.5 + tasteDiversity * 0.3 + tagDiversity * 0.2
  })
  
  return totalDiversity / selected.length  // 返回平均多样性分数
}

// Multi-Armed Bandit 探索概率（已内联到 getCurrentRecommendations，保留用于兼容）
const shouldExplore = (refreshCount: number): boolean => {
  const exploreProbability = Math.max(0.1, 0.1 * Math.pow(0.9, refreshCount))
  return Math.random() < exploreProbability
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      dishes: [],
      tagWeights: initializeTagWeights(),
      cuisineWeights: initializeCuisineWeights(),
      excludedTags: [],  // 新增：排除的标签
      consecutiveRejects: 0,  // 新增：连续拒绝次数
      pickHistory: [],
      backupList: [],
      sessions: [],
      currentSession: undefined,
      shownInSession: [],
      rejectedInSession: [],
      preferences: {
        sessionMode: 'mixed',
        mixedRatio: 0.6,
      },
      hasCompletedPick: false,
      lastPickedDish: undefined,
      refreshCount: 0,
      lastRecommendedIds: [],
      lastBatchTags: [],
      
      addDish: (dish) => {
        set(state => ({
          dishes: [...state.dishes, dish]
        }))
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
        
        // 更新权重
        const newTagWeights = { ...state.tagWeights }
        const newCuisineWeights = { ...state.cuisineWeights }
        
        dish.tags.forEach(tagId => {
          const weight = newTagWeights[tagId]
          if (weight) {
            if (feedbackType === 'reject') {
              // Negativity Bias：负反馈权重温和降低（避免过激）
              weight.shortTermWeight *= 0.5  // 温和降低（原0.3太激进了）
              weight.longTermWeight *= 0.8   // 长期温和降低（原0.7）
              
              // 同时影响关联标签
              const associations = TAG_ASSOCIATIONS[tagId]
              if (associations) {
                associations.forEach(relatedTag => {
                  const relatedWeight = newTagWeights[relatedTag]
                  if (relatedWeight) {
                    relatedWeight.shortTermWeight *= 0.5
                  }
                })
              }
            } else if (feedbackType === 'backup') {
              // 备选：中等提升
              weight.shortTermWeight *= 1.2
              weight.longTermWeight *= 1.05
            } else if (feedbackType === 'pick') {
              // Pick：显著提升
              weight.shortTermWeight *= 1.5
              weight.longTermWeight *= 1.1
            }
          }
        })
        
        // 更新菜系权重
        const cuisineTags = dish.tags.filter(t => t.startsWith('cuisine-'))
        cuisineTags.forEach(cuisineId => {
          const weight = newCuisineWeights[cuisineId]
          if (weight) {
            if (feedbackType === 'reject') {
              // Negativity Bias：更激进
              weight.shortTermWeight *= 0.5  // 更激进（原0.8）
              weight.longTermWeight *= 0.8   // 长期也降低（原0.95）
            } else if (feedbackType === 'backup') {
              weight.shortTermWeight *= 1.15
              weight.longTermWeight *= 1.03
            } else if (feedbackType === 'pick') {
              weight.shortTermWeight *= 1.3
              weight.longTermWeight *= 1.05
            }
          }
        })
        
        // Information Foraging：追踪连续拒绝次数
        const newConsecutiveRejects = feedbackType === 'reject' 
          ? state.consecutiveRejects + 1 
          : 0
        
        // 更新菜品统计
        const updatedDishes = state.dishes.map(d => {
          if (d.id === dishId) {
            return {
              ...d,
              stats: {
                ...d.stats,
                rejectCount: feedbackType === 'reject' ? d.stats.rejectCount + 1 : d.stats.rejectCount,
                pickCount: feedbackType === 'pick' ? d.stats.pickCount + 1 : d.stats.pickCount,
              }
            }
          }
          return d
        })
        
        // 更新Session
        const newShownInSession = [...state.shownInSession, dishId]
        const newRejectedInSession = feedbackType === 'reject'
          ? [...state.rejectedInSession, dishId]
          : state.rejectedInSession
        
        // 处理不同反馈类型
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
        set(state => ({
          refreshCount: state.refreshCount + 1,
        }))
      },
      
      startNewSession: () => {
        const state = get()
        const newSession: SessionRecord = {
          id: `session-${Date.now()}`,
          startTime: Date.now(),
          feedbackCount: 0,
          mode: state.preferences.sessionMode,
        }
        
        // 重置短期权重
        const newTagWeights = { ...state.tagWeights }
        Object.keys(newTagWeights).forEach(tagId => {
          newTagWeights[tagId] = {
            ...newTagWeights[tagId],
            shortTermWeight: 1.0,
          }
        })
        
        const newCuisineWeights = { ...state.cuisineWeights }
        Object.keys(newCuisineWeights).forEach(cuisineId => {
          newCuisineWeights[cuisineId] = {
            ...newCuisineWeights[cuisineId],
            shortTermWeight: 1.0,
          }
        })
        
        set({
          currentSession: newSession,
          shownInSession: [],
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
        const exists = state.backupList.some(b => b.dishId === dishId)
        if (!exists) {
          const backupRecord: BackupRecord = {
            id: `backup-${Date.now()}`,
            dishId,
            addedAt: Date.now(),
          }
          set({ backupList: [...state.backupList, backupRecord] })
        }
      },
      
      removeFromBackup: (id) => {
        set(state => ({
          backupList: state.backupList.filter(b => b.id !== id)
        }))
      },
      
      pickFromBackup: (id) => {
        const state = get()
        const backup = state.backupList.find(b => b.id === id)
        if (backup) {
          const dish = state.dishes.find(d => d.id === backup.dishId)
          if (dish) {
            state.handleFeedback(dish.id, 'pick')
            set(state => ({
              backupList: state.backupList.filter(b => b.id !== id)
            }))
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
          consecutiveRejects: 0,
          shownInSession: [],
          rejectedInSession: [],
          refreshCount: 0,
          // 清空菜品的统计数据
          dishes: state.dishes.map(d => ({
            ...d,
            stats: { recommendedCount: 0, pickCount: 0, rejectCount: 0 }
          }))
        }))
      },
      
      // 排除标签操作（Elimination by Aspects）
      excludeTag: (tagId) => {
        set(state => ({
          excludedTags: [...state.excludedTags, tagId]
        }))
      },
      
      removeExcludedTag: (tagId) => {
        set(state => ({
          excludedTags: state.excludedTags.filter(t => t !== tagId)
        }))
      },
      
      setSessionMode: (mode) => {
        set(state => ({
          preferences: { ...state.preferences, sessionMode: mode }
        }))
      },
      
      setMixedRatio: (ratio) => {
        set(state => ({
          preferences: { ...state.preferences, mixedRatio: ratio }
        }))
      },
      
      getCurrentRecommendations: () => {
        const state = get()
        
        if (state.dishes.length === 0) return []
        
        // 计算上次推荐的菜品的标签（用于多样性对比）
        const lastTags = state.lastRecommendedIds
          .map(id => state.dishes.find(d => d.id === id)?.tags || [])
          .flat()
        
        // Multi-Armed Bandit: 前3次换批保持20%探索率，之后逐步衰减
        const exploreRate = state.refreshCount <= 3 
          ? 0.2 
          : Math.max(0.1, 0.2 * Math.pow(0.85, state.refreshCount - 3))
        const exploring = Math.random() < exploreRate
        
        // 计算所有菜品分数（含多样性惩罚）
        const scoredDishes = state.dishes
          .filter(d => !state.rejectedInSession.includes(d.id))
          .filter(d => !d.tags.some(tag => state.excludedTags.includes(tag)))  // Elimination by Aspects
          .map(dish => {
            const baseScore = calculateScore(
              dish,
                state.tagWeights,
                state.cuisineWeights,
                state.preferences,
                state.shownInSession,
                state.rejectedInSession,
                state.excludedTags
            )
            
            // 多样性惩罚：如果与上次推荐的菜品标签重叠过多，降低分数
            let diversityPenalty = 1.0
            if (lastTags.length > 0) {
              const overlapCount = dish.tags.filter(t => lastTags.includes(t)).length
              const overlapRatio = overlapCount / dish.tags.length
              if (overlapRatio > 0.5) {
                diversityPenalty = 0.6  // 重叠超过50%时，分数打6折
              }
            }
            
            return {
              dish,
              score: baseScore * diversityPenalty,
              // 记录菜系和口味，用于本批次内多样性
              cuisines: dish.tags.filter(t => t.startsWith('cuisine-')),
              tastes: dish.tags.filter(t => t.startsWith('taste-')),
            }
          })
          .sort((a, b) => b.score - a.score)
        
        // 确保本批次3个菜品有足够多样性
        const selectDiverseBatch = (scored: typeof scoredDishes) => {
          if (scored.length <= 3) return scored.slice(0, 3).map(s => s.dish)
          
          const selected = [scored[0]]  // 第一个选最高分
          
          // 第二个：分数前30%中，选与已选多样性最高的
          const top30 = scored.slice(0, Math.max(3, Math.floor(scored.length * 0.3)))
          const second = top30
            .filter(s => !selected.includes(s))
            .reduce((best, current) => {
              const diversityScore = calculateDiversityScore(best, selected)
              const currentDiversity = calculateDiversityScore(current, selected)
              return currentDiversity > diversityScore ? current : best
            })
          if (second) selected.push(second)
          
          // 第三个：分数前50%中，选与已选多样性最高的
          const top50 = scored.slice(0, Math.max(3, Math.floor(scored.length * 0.5)))
          const third = top50
            .filter(s => !selected.includes(s))
            .reduce((best, current) => {
              const diversityScore = calculateDiversityScore(best, selected)
              const currentDiversity = calculateDiversityScore(current, selected)
              return currentDiversity > diversityScore ? current : best
            })
          if (third) selected.push(third)
          
          return selected.map(s => s.dish)
        }
        
        const result = exploring && scoredDishes.length > 3
          ? (() => {
              // 探索模式：从后30%随机选1个，其余2个用多样性选择
              const explorePool = scoredDishes.slice(Math.floor(scoredDishes.length * 0.7))
              const randomExplore = explorePool[Math.floor(Math.random() * explorePool.length)]
              // 临时把探索菜品加入selected，确保多样性
              const tempSelected = [randomExplore]
              const topForRest = scoredDishes
                .filter(s => s.dish.id !== randomExplore.dish.id)
                .slice(0, Math.floor(scoredDishes.length * 0.3))
              const second = topForRest
                .reduce((best, current) => {
                  const diversityScore = calculateDiversityScore(best, tempSelected)
                  const currentDiversity = calculateDiversityScore(current, tempSelected)
                  return currentDiversity > diversityScore ? current : best
                })
              if (second) tempSelected.push(second)
              const topForThird = scoredDishes
                .filter(s => !tempSelected.includes(s))
                .slice(0, Math.floor(scoredDishes.length * 0.5))
              const third = topForThird
                .reduce((best, current) => {
                  const diversityScore = calculateDiversityScore(best, tempSelected)
                  const currentDiversity = calculateDiversityScore(current, tempSelected)
                  return currentDiversity > diversityScore ? current : best
                })
              if (third) tempSelected.push(third)
              return tempSelected.map(s => s.dish)
            })()
          : selectDiverseBatch(scoredDishes)
        // 更新 lastRecommendedIds（移到外部，避免 render 期间 setState）
        // set({ lastRecommendedIds: result.map(d => d.id) })  // ❌ 导致 render 期间 setState
        
        return result
      },
      // 新增：更新上次推荐的菜品ID（在 useEffect 中调用，避免 render 期间 setState）
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
      }),
    }
  )
)
