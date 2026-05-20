'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, RefreshCw, Check, Ban } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Dish, PREDEFINED_TAGS } from '@/types'
import ExcludeTagModal from './ExcludeTagModal'
import ForagingPrompt from './ForagingPrompt'

// 备选按钮组件
function BackupButton() {
  const { backupList, dishes, removeFromBackup, pickFromBackup } = useAppStore()
  const [showBackup, setShowBackup] = useState(false)
  
  const backupDishes = backupList.map(b => dishes.find(d => d.id === b.dishId)).filter(Boolean) as Dish[]
  
  return (
    <>
      <button
        onClick={() => setShowBackup(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-100 transition-colors relative"
      >
        <Star size={18} />
        备选
        {backupDishes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
            {backupDishes.length}
          </span>
        )}
      </button>
      
      {/* 备选弹窗 */}
      <AnimatePresence>
        {showBackup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBackup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">备选列表</h2>
                <button onClick={() => setShowBackup(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
                {backupDishes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>还没有备选菜品</p>
                    <p className="text-sm mt-1">点击卡片上的 ⭐ 添加备选</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backupDishes.map(dish => {
                      const backupRecord = backupList.find(b => b.dishId === dish.id)
                      return (
                        <div key={dish.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <h3 className="font-medium">{dish.name}</h3>
                            <p className="text-sm text-gray-500">
                              {PREDEFINED_TAGS.find(t => t.id === dish.tags.find(tag => tag.startsWith('cuisine-')))?.name || '其他'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (backupRecord) removeFromBackup(backupRecord.id)
                              }}
                              className="px-3 py-2 rounded-full bg-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-300"
                            >
                              删除
                            </button>
                            <button
                              onClick={() => {
                                if (backupRecord) {
                                  pickFromBackup(backupRecord.id)
                                  setShowBackup(false)
                                }
                              }}
                              className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                            >
                              就吃这个
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function RecommendPage() {
  const {
    dishes,
    hasCompletedPick,
    lastPickedDish,
    refreshCount,
    consecutiveRejects,
    handleFeedback,
    refreshRecommendation,
    startNewSession,
    getCurrentRecommendations,
    rejectedInSession,
    updateLastRecommendedIds,  // 新增：用于更新 lastRecommendedIds
  } = useAppStore()
  
  const [displayDishes, setDisplayDishes] = useState<Dish[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [showExcludeModal, setShowExcludeModal] = useState(false)
  
  // 初始化推荐
  useEffect(() => {
    if (dishes.length > 0 && !isInitialized) {
      const recommendations = getCurrentRecommendations().slice(0, 3)
      setDisplayDishes(recommendations)
      updateLastRecommendedIds(recommendations.map(d => d.id))  // ✅ 在 useEffect 中更新，安全
      setIsInitialized(true)
    }
  }, [dishes, isInitialized, getCurrentRecommendations, updateLastRecommendedIds])
  
  // 监听refreshCount变化，刷新推荐
  useEffect(() => {
    if (refreshCount > 0) {
      const recommendations = getCurrentRecommendations().slice(0, 3)
      setDisplayDishes(recommendations)
      updateLastRecommendedIds(recommendations.map(d => d.id))  // ✅ 在 useEffect 中更新，安全
    }
  }, [refreshCount, getCurrentRecommendations, updateLastRecommendedIds])
  
  // 监听hasCompletedPick变化，重置显示
  useEffect(() => {
    if (!hasCompletedPick && isInitialized) {
      const recommendations = getCurrentRecommendations().slice(0, 3)
      setDisplayDishes(recommendations)
      updateLastRecommendedIds(recommendations.map(d => d.id))  // ✅ 在 useEffect 中更新，安全
    }
  }, [hasCompletedPick, isInitialized, getCurrentRecommendations, updateLastRecommendedIds])
  
  // 获取下一个推荐（不在当前显示列表中的）
  const getNextRecommendation = (): Dish | undefined => {
    const allRecommendations = getCurrentRecommendations()
    const currentIds = new Set(displayDishes.map(d => d.id))
    return allRecommendations.find(d => !currentIds.has(d.id))
  }
  
  const handleReject = (dishId: string) => {
    handleFeedback(dishId, 'reject')
    // 只替换这一张卡片
    setTimeout(() => {
      const nextDish = getNextRecommendation()
      if (nextDish) {
        setDisplayDishes(prev => prev.map(d => d.id === dishId ? nextDish : d))
      } else {
        setDisplayDishes(prev => prev.filter(d => d.id !== dishId))
      }
    }, 300)
  }
  
  const handleBackup = (dishId: string) => {
    handleFeedback(dishId, 'backup')
    // 只替换这一张卡片
    setTimeout(() => {
      const nextDish = getNextRecommendation()
      if (nextDish) {
        setDisplayDishes(prev => prev.map(d => d.id === dishId ? nextDish : d))
      } else {
        setDisplayDishes(prev => prev.filter(d => d.id !== dishId))
      }
    }, 300)
  }
  
  const handlePick = (dishId: string) => {
    handleFeedback(dishId, 'pick')
  }
  
  const handleRefresh = () => {
    // 把当前显示的 3 个都标记为 reject
    displayDishes.forEach(dish => {
      handleFeedback(dish.id, 'reject')
    })
    // 然后刷新推荐
    refreshRecommendation()
  }
  
  const handlePickAgain = () => {
    startNewSession()
    setIsInitialized(false)
    setDisplayDishes([])
  }
  
  // 获取当前推荐的 3 个菜品
  const recommendations = displayDishes.length > 0 ? displayDishes : (dishes.length > 0 ? getCurrentRecommendations().slice(0, 3) : [])
  
  // 空状态
  if (dishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">还没有菜单</h2>
        <p className="text-gray-500 mb-6">
          去菜单管理页添加一些菜品吧！
        </p>
        <p className="text-sm text-gray-400">
          支持手动添加、CSV导入、图片识别
        </p>
      </div>
    )
  }
  
  // 选择完成状态
  if (hasCompletedPick && lastPickedDish) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
        >
          <Check className="text-green-500" size={48} />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          今天中午吃
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-orange-500 mb-8"
        >
          {lastPickedDish.name}
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handlePickAgain}
          className="px-8 py-3 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
        >
          再选一次
        </motion.button>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">今天到底想吃啥？</h1>
        <p className="text-gray-500 text-sm mt-1">
          点击卡片选择，点击 ⭐ 备选
        </p>
      </div>
      
      {/* 排除标签按钮 */}
      <div className="flex justify-center gap-3 mb-2">
        <button
          onClick={() => setShowExcludeModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
        >
          <Ban size={16} />
          不想吃
        </button>
      </div>
      
      {/* 三卡片区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <AnimatePresence mode="popLayout">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {recommendations.map((dish, index) => (
                <DishCard3
                  key={dish.id}
                  dish={dish}
                  index={index}
                  onBackup={() => handleBackup(dish.id)}
                  onPick={() => handlePick(dish.id)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="text-6xl mb-4">😅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">选择已用尽</h3>
              <p className="text-gray-500 mb-4">
                要不看看备选列表？或者重置偏好重新开始
              </p>
              <button
                onClick={handlePickAgain}
                className="px-6 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                重新开始
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 换一批按钮 + 备选入口 */}
      {recommendations.length > 0 && (
        <div className="flex flex-col items-center gap-3 pb-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} />
              换一批
            </button>
            
            <BackupButton />
          </div>
        </div>
      )}
      
      {/* 连续换批提示 */}
      {refreshCount >= 10 && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm">
            要不要试试备选列表？
          </div>
        </div>
      )}
      
      {/* 排除标签模态框 */}
      {showExcludeModal && (
        <ExcludeTagModal onClose={() => setShowExcludeModal(false)} />
      )}
      
      {/* Information Foraging 提示 */}
      <ForagingPrompt onSuggestChange={handleRefresh} />
    </div>
  )
}

// 单个卡片组件（3卡片布局）
function DishCard3({ dish, index, onBackup, onPick }: {
  dish: Dish
  index: number
  onBackup: () => void
  onPick: () => void
}) {
  // 获取主要标签 - 显示更多标签
  const getDisplayTags = () => {
    const tags = []
    // 菜系
    const cuisineTag = PREDEFINED_TAGS.find(t => t.id === dish.tags.find(tag => tag.startsWith('cuisine-')))
    if (cuisineTag) tags.push(cuisineTag)
    // 口味（最多2个）
    const tasteTags = dish.tags
      .filter(tag => tag.startsWith('taste-'))
      .slice(0, 2)
      .map(tag => PREDEFINED_TAGS.find(t => t.id === tag))
      .filter(Boolean)
    tags.push(...tasteTags)
    // 价格
    const priceTag = PREDEFINED_TAGS.find(t => t.id === dish.tags.find(tag => tag.startsWith('price-')))
    if (priceTag) tags.push(priceTag)
    // 类型
    const typeTag = PREDEFINED_TAGS.find(t => t.id === dish.tags.find(tag => tag.startsWith('type-')))
    if (typeTag && tags.length < 5) tags.push(typeTag)
    
    return tags.slice(0, 5) // 最多显示5个标签
  }
  
  const displayTags = getDisplayTags()
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        delay: index * 0.05 
      }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onPick}
    >
      {/* 菜品图片 */}
      <div className="h-24 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center relative">
        {dish.imageUrl ? (
          <img 
            src={dish.imageUrl} 
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🍽️</span>
        )}
      </div>
      
      {/* 菜品名称 */}
      <div className="p-2 flex-1">
        <h3 className="text-sm font-bold text-gray-900 text-center line-clamp-2">
          {dish.name}
        </h3>
        
        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {displayTags.map(tag => (
              <span
                key={tag!.id}
                className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {tag!.name}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* 操作按钮 - 只保留备选按钮 */}
      <div className="flex justify-center p-2 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBackup()
          }}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-yellow-100 flex items-center justify-center transition-colors active:scale-90"
          title="备选"
        >
          <Star className="text-gray-500" size={18} />
        </button>
      </div>
    </motion.div>
  )
}
