'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Trash2, Clock, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { PREDEFINED_TAGS } from '@/types'

export function CollectionPage() {
  const { pickHistory, backupList, dishes, removeFromBackup, pickFromBackup } = useAppStore()
  const [activeTab, setActiveTab] = useState<'backup' | 'history'>('backup')
  
  // 获取备选菜品详情
  const backupDishes = backupList.map(backup => ({
    ...backup,
    dish: dishes.find(d => d.id === backup.dishId),
  })).filter(b => b.dish)
  
  // 统计最常Pick的Tag
  const tagPickCount: Record<string, number> = {}
  pickHistory.forEach(record => {
    record.tags.forEach(tagId => {
      tagPickCount[tagId] = (tagPickCount[tagId] || 0) + 1
    })
  })
  
  const topTags = Object.entries(tagPickCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tagId, count]) => {
      const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
      return { tag, count }
    })
    .filter(t => t.tag)
  
  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="pt-8 pb-4 px-6">
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
      </div>
      
      {/* Tab 切换 */}
      <div className="flex gap-2 px-6 mb-4">
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'backup'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Star size={18} />
          备选 ({backupList.length})
        </button>
        
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart size={18} />
          Pick历史 ({pickHistory.length})
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-auto px-6 pb-24">
        {activeTab === 'backup' ? (
          // 备选列表
          backupDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">备选列表为空</h3>
              <p className="text-gray-500">
                在推荐页点击⭐按钮添加备选
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backupDishes.map(backup => (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl p-4 card-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{backup.dish!.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {backup.dish!.tags.slice(0, 3).map(tagId => {
                          const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
                          return tag ? (
                            <span
                              key={tagId}
                              className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                            >
                              {tag.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => pickFromBackup(backup.id)}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                        title="Pick"
                      >
                        <Heart size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => removeFromBackup(backup.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="移除"
                      >
                        <Trash2 size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // Pick历史
          <>
            {pickHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">还没有Pick记录</h3>
                <p className="text-gray-500">
                  在推荐页选择一个菜品开始吧
                </p>
              </div>
            ) : (
              <>
                {/* 统计卡片 */}
                {topTags.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={18} className="text-orange-500" />
                      <h3 className="font-medium text-gray-900">口味偏好</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topTags.map(({ tag, count }) => (
                        <span
                          key={tag!.id}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700"
                        >
                          {tag!.name} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 历史列表 */}
                <div className="space-y-3">
                  {pickHistory.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-4 card-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{record.dishName}</h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {record.tags.slice(0, 3).map(tagId => {
                              const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
                              return tag ? (
                                <span
                                  key={tagId}
                                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                                >
                                  {tag.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={12} />
                          {new Date(record.timestamp).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
