'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { PREDEFINED_TAGS, TAG_CATEGORIES, TagCategory } from '@/types'

interface Props {
  onClose: () => void
}

export default function ExcludeTagModal({ onClose }: Props) {
  const { excludedTags, excludeTag, removeExcludedTag } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<TagCategory>('cuisine')
  
  const categories = Object.keys(TAG_CATEGORIES) as TagCategory[]
  const tagsInCategory = PREDEFINED_TAGS.filter(t => t.category === selectedCategory)
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">不想吃什么？</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
          排除后，这些类型的菜品将不会出现在推荐中
        </p>
        
        {/* 当前排除条件 */}
        {excludedTags.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-700 mb-2">已排除：</p>
            <div className="flex flex-wrap gap-2">
              {excludedTags.map(tagId => {
                const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
                return tag ? (
                  <button
                    key={tagId}
                    onClick={() => removeExcludedTag(tagId)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1 hover:bg-red-200"
                  >
                    {tag.name}
                    <span className="text-xs">✕</span>
                  </button>
                ) : null
              })}
            </div>
          </div>
        )}
        
        {/* 分类选择 */}
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
        
        {/* 标签列表 */}
        <div className="grid grid-cols-2 gap-2">
          {tagsInCategory.map(tag => {
            const isExcluded = excludedTags.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isExcluded) {
                    removeExcludedTag(tag.id)
                  } else {
                    excludeTag(tag.id)
                  }
                }}
                className={`p-3 rounded-lg text-left transition ${
                  isExcluded
                    ? 'bg-red-100 text-red-700 line-through'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
        
        {/* 底部按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
