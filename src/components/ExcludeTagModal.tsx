'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { PREDEFINED_TAGS, TAG_CATEGORIES, TagCategory } from '@/types'

interface Props {
  onClose: () => void
  onExclusionChange?: () => void
}

export default function ExcludeTagModal({ onClose, onExclusionChange }: Props) {
  const { excludedTags, excludeTag, removeExcludedTag } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<TagCategory>('cuisine')

  const categories = Object.keys(TAG_CATEGORIES) as TagCategory[]
  const tagsInCategory = PREDEFINED_TAGS.filter(t => t.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
          <span className="text-lg">🗑️</span>
          <h2 className="text-xl font-bold">不想吃什么？</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          👇 点掉的类型不会再出现在推荐里
        </p>

        {excludedTags.length > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-2">已划掉 · 不再推荐</p>
            <div className="flex flex-wrap gap-2">
              {excludedTags.map(tagId => {
                const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
                return tag ? (
                  <button
                    key={tagId}
                    onClick={() => {
                      removeExcludedTag(tagId)
                      onExclusionChange?.()
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-sm flex items-center gap-1 line-through hover:bg-gray-300 hover:text-gray-700 transition-colors"
                  >
                    {tag.name}
                    <span className="text-xs">↩</span>
                  </button>
                ) : null
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TAG_CATEGORIES[cat].icon} {TAG_CATEGORIES[cat].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {tagsInCategory.map(tag => {
            const isExcluded = excludedTags.includes(tag.id)
            return (
              <motion.button
                key={tag.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isExcluded) {
                    removeExcludedTag(tag.id)
                  } else {
                    excludeTag(tag.id)
                  }
                  onExclusionChange?.()
                }}
                className={`p-3 rounded-lg text-left transition-colors ${
                  isExcluded
                    ? 'bg-gray-100 text-gray-400 line-through opacity-50'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {tag.name}
                {isExcluded && <span className="float-right text-xs opacity-50">已划掉</span>}
              </motion.button>
            )
          })}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            {excludedTags.length > 0 ? `完成 · 已划掉 ${excludedTags.length} 个标签` : '完成'}
          </button>
        </div>
      </div>
    </div>
  )
}
