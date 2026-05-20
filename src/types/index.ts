// Tag 分类
export type TagCategory = 'cuisine' | 'taste' | 'type' | 'price' | 'time' | 'period' | 'season' | 'temperature' | 'status'

// Tag 定义
export interface Tag {
  id: string
  name: string
  category: TagCategory
}

// 菜品定义
export interface Dish {
  id: string
  name: string
  imageUrl?: string
  tags: string[] // Tag ID 数组
  stats: {
    recommendedCount: number
    pickCount: number
    rejectCount: number
  }
  createdAt: number
}

// 用户反馈类型
export type FeedbackType = 'reject' | 'backup' | 'pick'

// Session 模式
export type SessionMode = 'short' | 'long' | 'mixed'

// Tag 权重记录
export interface TagWeight {
  tagId: string
  shortTermWeight: number
  longTermWeight: number
}

// 菜系权重记录
export interface CuisineWeight {
  cuisineId: string
  shortTermWeight: number
  longTermWeight: number
}

// Pick 历史记录
export interface PickRecord {
  id: string
  dishId: string
  dishName: string
  tags: string[]
  timestamp: number
}

// 备选记录
export interface BackupRecord {
  id: string
  dishId: string
  addedAt: number
}

// Session 记录
export interface SessionRecord {
  id: string
  startTime: number
  endTime?: number
  feedbackCount: number
  mode: SessionMode
}

// 推荐状态
export interface RecommendationState {
  currentDishes: Dish[]
  shownInSession: Set<string>
  rejectedInSession: Set<string>
}

// 用户偏好设置
export interface UserPreferences {
  sessionMode: SessionMode
  mixedRatio: number // 短期权重占比 (0-1)
}

// 应用状态
export interface AppState {
  // 菜单库
  dishes: Dish[]
  
  // Tag 权重
  tagWeights: Record<string, TagWeight>
  
  // 菜系权重
  cuisineWeights: Record<string, CuisineWeight>
  
  // Pick 历史
  pickHistory: PickRecord[]
  
  // 备选列表
  backupList: BackupRecord[]
  
  // Session 记录
  sessions: SessionRecord[]
  currentSession?: SessionRecord
  
  // 推荐状态
  recommendation: RecommendationState
  
  // 用户偏好
  preferences: UserPreferences
  
  // UI 状态
  isLoading: boolean
  hasCompletedPick: boolean
  lastPickedDish?: Dish
}

// Tag 分类配置
export const TAG_CATEGORIES: Record<TagCategory, { label: string; icon: string }> = {
  cuisine: { label: '菜系', icon: '🍜' },
  taste: { label: '口味', icon: '👅' },
  type: { label: '类型', icon: '🍽️' },
  price: { label: '价格', icon: '💰' },
  time: { label: '配送时间', icon: '⏱️' },
  period: { label: '时段', icon: '🕐' },
  season: { label: '季节', icon: '🌸' },
  temperature: { label: '温度', icon: '🌡️' },
  status: { label: '状态', icon: '⚡' },
}

// 预定义 Tag
export const PREDEFINED_TAGS: Tag[] = [
  // 菜系
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
  
  // 口味
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
  
  // 类型
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
  
  // 价格区间
  { id: 'price-budget', name: '人均20以下', category: 'price' },
  { id: 'price-moderate', name: '人均20-50', category: 'price' },
  { id: 'price-premium', name: '人均50-100', category: 'price' },
  { id: 'price-luxury', name: '人均100以上', category: 'price' },
  
  // 配送时间
  { id: 'time-fast', name: '20分钟内', category: 'time' },
  { id: 'time-normal', name: '20-40分钟', category: 'time' },
  { id: 'time-slow', name: '40分钟以上', category: 'time' },
  
  // 时段
  { id: 'period-breakfast', name: '早餐', category: 'period' },
  { id: 'period-lunch', name: '午餐', category: 'period' },
  { id: 'period-dinner', name: '晚餐', category: 'period' },
  { id: 'period-midnight', name: '夜宵', category: 'period' },
  { id: 'period-snack', name: '下午茶', category: 'period' },
  
  // 季节
  { id: 'season-spring', name: '春季限定', category: 'season' },
  { id: 'season-summer', name: '夏季限定', category: 'season' },
  { id: 'season-autumn', name: '秋季限定', category: 'season' },
  { id: 'season-winter', name: '冬季限定', category: 'season' },
  { id: 'season-all', name: '四季皆宜', category: 'season' },
  
  // 温度
  { id: 'temp-hot', name: '热食', category: 'temperature' },
  { id: 'temp-cold', name: '冷食', category: 'temperature' },
  { id: 'temp-room', name: '常温', category: 'temperature' },
  
  // 状态
  { id: 'status-healthy', name: '健康', category: 'status' },
  { id: 'status-high-calorie', name: '高热量', category: 'status' },
  { id: 'status-vegetarian', name: '素食', category: 'status' },
  { id: 'status-spicy-caution', name: '慎辣', category: 'status' },
]

// Tag 关联规则
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
