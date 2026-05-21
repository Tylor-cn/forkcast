export type TagCategory = 'cuisine' | 'taste' | 'type' | 'price' | 'time' | 'period' | 'season' | 'temperature'

export interface Tag {
  id: string
  name: string
  category: TagCategory
}

export interface Dish {
  id: string
  name: string
  imageUrl?: string
  tags: string[]
  stats: {
    pickCount: number
    rejectCount: number
    lastPickTimestamp?: number
  }
  createdAt: number
}

export type FeedbackType = 'reject' | 'backup' | 'pick'

export type SessionMode = 'short' | 'long' | 'mixed'

export interface TagWeight {
  tagId: string
  shortTermWeight: number
  longTermWeight: number
}

export interface CuisineWeight {
  cuisineId: string
  shortTermWeight: number
  longTermWeight: number
}

export interface PickRecord {
  id: string
  dishId: string
  dishName: string
  tags: string[]
  timestamp: number
}

export interface BackupRecord {
  id: string
  dishId: string
  addedAt: number
}

export interface SessionRecord {
  id: string
  startTime: number
  endTime?: number
  feedbackCount: number
  mode: SessionMode
}

export interface RecommendationState {
  currentDishes: Dish[]
  shownInSession: Record<string, FeedbackType | 'shown'>
  rejectedInSession: string[]
}

export interface UserPreferences {
  sessionMode: SessionMode
  mixedRatio: number
}

export interface AppState {
  dishes: Dish[]
  tagWeights: Record<string, TagWeight>
  cuisineWeights: Record<string, CuisineWeight>
  pickHistory: PickRecord[]
  backupList: BackupRecord[]
  sessions: SessionRecord[]
  currentSession?: SessionRecord
  recommendation: RecommendationState
  preferences: UserPreferences
  isLoading: boolean
  hasCompletedPick: boolean
  lastPickedDish?: Dish
}

export const TAG_CATEGORIES: Record<TagCategory, { label: string; icon: string }> = {
  cuisine: { label: '菜系', icon: '🍜' },
  taste: { label: '口味', icon: '👅' },
  type: { label: '类型', icon: '🍽️' },
  price: { label: '价格', icon: '💰' },
  time: { label: '配送时间', icon: '⏱️' },
  period: { label: '时段', icon: '🕐' },
  season: { label: '季节', icon: '🌸' },
  temperature: { label: '温度', icon: '🌡️' },

}

export const PREDEFINED_TAGS: Tag[] = [
  { id: 'cuisine-sichuan', name: '川菜', category: 'cuisine' },
  { id: 'cuisine-cantonese', name: '粤菜', category: 'cuisine' },
  { id: 'cuisine-hunan', name: '湘菜', category: 'cuisine' },
  { id: 'cuisine-shandong', name: '鲁菜', category: 'cuisine' },
  { id: 'cuisine-jiangsu', name: '苏菜', category: 'cuisine' },
  { id: 'cuisine-zhejiang', name: '浙菜', category: 'cuisine' },
  { id: 'cuisine-fujian', name: '闽菜', category: 'cuisine' },
  { id: 'cuisine-anhui', name: '徽菜', category: 'cuisine' },
  { id: 'cuisine-northeast', name: '东北菜', category: 'cuisine' },
  { id: 'cuisine-northwest', name: '西北菜', category: 'cuisine' },
  { id: 'cuisine-yunnan', name: '云贵菜', category: 'cuisine' },
  { id: 'cuisine-japanese', name: '日料', category: 'cuisine' },
  { id: 'cuisine-korean', name: '韩料', category: 'cuisine' },
  { id: 'cuisine-western', name: '西餐', category: 'cuisine' },
  { id: 'cuisine-southeast', name: '东南亚菜', category: 'cuisine' },
  { id: 'cuisine-indian', name: '印度菜', category: 'cuisine' },
  { id: 'cuisine-hotpot', name: '火锅', category: 'cuisine' },
  { id: 'cuisine-bbq', name: '烧烤', category: 'cuisine' },
  { id: 'cuisine-crayfish', name: '小龙虾', category: 'cuisine' },
  { id: 'cuisine-fastfood', name: '快餐', category: 'cuisine' },
  { id: 'cuisine-chinese', name: '家常菜', category: 'cuisine' },
  { id: 'cuisine-dessert', name: '甜品饮品', category: 'cuisine' },

  { id: 'taste-mild-spicy', name: '微辣', category: 'taste' },
  { id: 'taste-medium-spicy', name: '中辣', category: 'taste' },
  { id: 'taste-extra-spicy', name: '特辣', category: 'taste' },
  { id: 'taste-mala', name: '麻辣', category: 'taste' },
  { id: 'taste-sweet', name: '甜', category: 'taste' },
  { id: 'taste-sour', name: '酸', category: 'taste' },
  { id: 'taste-sour-sweet', name: '糖醋', category: 'taste' },
  { id: 'taste-salty', name: '咸', category: 'taste' },
  { id: 'taste-light', name: '清淡', category: 'taste' },
  { id: 'taste-heavy', name: '重口', category: 'taste' },
  { id: 'taste-umami', name: '鲜', category: 'taste' },
  { id: 'taste-fragrant', name: '香', category: 'taste' },
  { id: 'taste-crispy', name: '酥脆', category: 'taste' },
  { id: 'taste-soft', name: '软糯', category: 'taste' },
  { id: 'taste-tender', name: '嫩滑', category: 'taste' },
  { id: 'taste-chewy', name: '劲道', category: 'taste' },
  { id: 'taste-fresh', name: '清爽', category: 'taste' },
  { id: 'taste-slurpy', name: '爽滑', category: 'taste' },
  { id: 'taste-cold-dish', name: '凉菜味', category: 'taste' },

  { id: 'type-staple', name: '主食', category: 'type' },
  { id: 'type-snack', name: '小吃', category: 'type' },
  { id: 'type-soup', name: '汤品', category: 'type' },
  { id: 'type-cold', name: '凉菜', category: 'type' },
  { id: 'type-hot', name: '热菜', category: 'type' },
  { id: 'type-noodles', name: '面食', category: 'type' },
  { id: 'type-rice', name: '米饭', category: 'type' },
  { id: 'type-dimsum', name: '点心', category: 'type' },
  { id: 'type-dessert', name: '甜品', category: 'type' },
  { id: 'type-drink', name: '饮品', category: 'type' },

  { id: 'price-budget', name: '人均20以下', category: 'price' },
  { id: 'price-moderate', name: '人均20-50', category: 'price' },
  { id: 'price-premium', name: '人均50-100', category: 'price' },
  { id: 'price-luxury', name: '人均100以上', category: 'price' },

  { id: 'time-fast', name: '20分钟内', category: 'time' },
  { id: 'time-normal', name: '20-40分钟', category: 'time' },
  { id: 'time-slow', name: '40分钟以上', category: 'time' },

  { id: 'period-breakfast', name: '早餐', category: 'period' },
  { id: 'period-lunch', name: '午餐', category: 'period' },
  { id: 'period-dinner', name: '晚餐', category: 'period' },
  { id: 'period-midnight', name: '夜宵', category: 'period' },
  { id: 'period-snack', name: '下午茶', category: 'period' },

  { id: 'season-spring', name: '春季限定', category: 'season' },
  { id: 'season-summer', name: '夏季限定', category: 'season' },
  { id: 'season-autumn', name: '秋季限定', category: 'season' },
  { id: 'season-winter', name: '冬季限定', category: 'season' },
  { id: 'season-all', name: '四季皆宜', category: 'season' },

  { id: 'temp-hot', name: '热食', category: 'temperature' },
  { id: 'temp-cold', name: '冷食', category: 'temperature' },
  { id: 'temp-room', name: '常温', category: 'temperature' },


]

export const TAG_ASSOCIATIONS: Record<string, string[]> = {
  'cuisine-sichuan': ['taste-mala', 'taste-heavy'],
  'cuisine-hunan': ['taste-medium-spicy', 'taste-heavy'],
  'cuisine-cantonese': ['taste-light', 'taste-umami'],
  'cuisine-japanese': ['taste-light', 'taste-umami'],
  'cuisine-korean': ['taste-medium-spicy'],
  'cuisine-hotpot': ['taste-mala', 'temp-hot'],
  'cuisine-bbq': ['taste-fragrant', 'temp-hot'],
  'cuisine-southeast': ['taste-sour', 'taste-medium-spicy'],
  'cuisine-indian': ['taste-medium-spicy', 'taste-fragrant'],
}
