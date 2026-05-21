'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronDown, ChevronUp, Coffee, Sparkles, Filter } from 'lucide-react'
import { PREDEFINED_TAGS, TAG_CATEGORIES, Tag, TagCategory } from '@/types'
import { useAppStore } from '@/store/useAppStore'

const HIGH_FREQUENCY_TAGS = [
  'taste-mala', 'taste-extra-spicy', 'taste-medium-spicy',
  'price-luxury', 'price-premium',
  'time-slow',
  'status-high-calorie',
  'taste-heavy',
  'temp-cold',
  'cuisine-fastfood',
]

interface ExcludeIntroProps {
  onComplete: () => void
}

export default function ExcludeIntro({ onComplete }: ExcludeIntroProps) {
  const { initialExcludedTags, setInitialExclusion, dishes } = useAppStore()
  const [selectedTags, setSelectedTags] = useState<string[]>(initialExcludedTags)
  const [showAll, setShowAll] = useState(false)

  const getEliminationCount = (tagId: string): number => {
    return dishes.filter(d => d.tags.includes(tagId)).length
  }

  const highFreqTags = useMemo(() => {
    return HIGH_FREQUENCY_TAGS
      .map(id => PREDEFINED_TAGS.find(t => t.id === id))
      .filter(Boolean) as Tag[]
  }, [])

  const groupedTags = useMemo(() => {
    const groups: Record<TagCategory, Tag[]> = {} as any
    PREDEFINED_TAGS.forEach(tag => {
      if (!groups[tag.category]) groups[tag.category] = []
      groups[tag.category].push(tag)
    })
    return groups
  }, [])

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSkip = () => {
    setInitialExclusion([])
    onComplete()
  }

  const handleConfirm = () => {
    setInitialExclusion(selectedTags)
    onComplete()
  }

  const excludedCount = selectedTags.length
  const eliminatedDishes = dishes.filter(d =>
    d.tags.some(t => selectedTags.includes(t))
  ).length
  const remainingCount = dishes.length - eliminatedDishes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-8"
    >
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-3">
          <Coffee className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          猜你想吃
        </h1>
        <p className="text-gray-500 text-sm">
          👇 点掉不想吃的，剩下的我们帮你挑
        </p>
      </div>

      {/* 实时统计：贴顶 sticky，强化"排除=缩减池子"的感知 */}
      <div className={`sticky top-0 z-10 mb-5 rounded-xl p-3 text-center transition-colors ${
        excludedCount > 0 ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-gray-100'
      }`}>
        <div className="flex items-center justify-center gap-2 text-sm">
          <Filter className={`w-4 h-4 ${excludedCount > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="text-gray-700 font-medium">备选池</span>
          <span className={`font-bold text-lg ${remainingCount > 3 ? 'text-green-600' : remainingCount > 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {Math.max(remainingCount, 0)}
          </span>
          <span className="text-gray-400">道菜可选</span>
        </div>
        {excludedCount > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-orange-500 mt-1"
          >
            已划掉 {excludedCount} 个标签，淘汰 {eliminatedDishes} 道菜
          </motion.p>
        )}
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 font-medium mb-3 flex items-center gap-1">
          ⚡ 快速排除 · <span className="text-gray-300">点一个少一个</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {highFreqTags.map(tag => {
            const isExcluded = selectedTags.includes(tag.id)
            const elimCount = getEliminationCount(tag.id)
            return (
              <motion.button
                key={tag.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => toggleTag(tag.id)}
                animate={
                  isExcluded
                    ? { scale: 0.95, y: 2, opacity: 0.45 }
                    : { scale: 1, y: 0, opacity: 1 }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isExcluded
                    ? 'bg-gray-100 text-gray-400 line-through shadow-none'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                }`}
              >
                <span className="mr-1">{TAG_CATEGORIES[tag.category]?.icon || ''}</span>
                {tag.name}
                <span className={`ml-1 text-xs ${isExcluded ? 'opacity-40' : 'opacity-50'}`}>{elimCount}</span>
                {isExcluded && <X className="inline w-3 h-3 ml-1" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAll ? '收起' : '更多标签'}
        </button>

        {showAll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-4 max-h-64 overflow-y-auto"
          >
            {Object.entries(groupedTags).map(([category, tags]) => {
              const cat = category as TagCategory
              const catConfig = TAG_CATEGORIES[cat]
              const selectedCount = tags.filter(t => selectedTags.includes(t.id)).length

              return (
                <div key={cat}>
                  <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
                    {catConfig?.icon || '📌'} {catConfig?.label || cat}
                    {selectedCount > 0 && (
                      <span className="text-gray-400">· 已划掉{selectedCount}个</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => {
                      const isExcluded = selectedTags.includes(tag.id)
                      const elimCount = getEliminationCount(tag.id)
                      return (
                        <motion.button
                          key={tag.id}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => toggleTag(tag.id)}
                          animate={
                            isExcluded
                              ? { scale: 0.95, y: 1, opacity: 0.45 }
                              : { scale: 1, y: 0, opacity: 1 }
                          }
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isExcluded
                              ? 'bg-gray-100 text-gray-400 line-through shadow-none'
                              : 'bg-white border border-gray-150 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {tag.name}
                          <span className={`ml-0.5 ${isExcluded ? 'opacity-40' : 'opacity-50'}`}>{elimCount}</span>
                          {isExcluded && <X className="inline w-2.5 h-2.5 ml-0.5" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-semibold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {excludedCount > 0 ? `从 ${Math.max(remainingCount, 0)} 道菜中推荐` : '全部都要，开始推荐'}
        </button>

        <button
          onClick={handleSkip}
          className="w-full py-2 text-sm text-gray-300 hover:text-gray-400 transition-colors"
        >
          不排除，直接开始
        </button>
      </div>
    </motion.div>
  )
}
