'use client'

import { useAppStore } from '@/store/useAppStore'
import { PREDEFINED_TAGS } from '@/types'

interface Props {
  onSuggestChange: () => void
}

export default function ForagingPrompt({ onSuggestChange }: Props) {
  const { consecutiveRejects, excludedTags, backupList } = useAppStore()
  
  // Information Foraging Theory: 不同阈值触发不同提示
  if (consecutiveRejects < 2) return null
  
  // 连续2次：建议换个口味
  if (consecutiveRejects === 2) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg max-w-sm">
        <p className="text-amber-800 text-sm">
          💡 连续跳过了 2 次，要不要换个口味试试？
        </p>
        <button
          onClick={onSuggestChange}
          className="mt-2 w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
        >
          换个口味
        </button>
      </div>
    )
  }
  
  // 连续3次：推荐不同类型
  if (consecutiveRejects === 3) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-lg max-w-sm">
        <p className="text-orange-800 text-sm mb-2">
          🤔 看起来这些都不太合胃口，试试完全不同的类型？
        </p>
        <div className="flex gap-2">
          <button
            onClick={onSuggestChange}
            className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            随机推荐
          </button>
          {backupList.length > 0 && (
            <button
              onClick={() => {/* 打开备选列表 */}}
              className="flex-1 py-2 bg-white text-orange-600 border border-orange-300 rounded-lg text-sm font-medium hover:bg-orange-50"
            >
              看看备选 ({backupList.length})
            </button>
          )}
        </div>
      </div>
    )
  }
  
  // 连续5次：强制干预
  if (consecutiveRejects >= 5) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold mb-2">🤷 都不太满意？</h3>
          <p className="text-gray-600 text-sm mb-4">
            已经跳过 {consecutiveRejects} 次了，也许：
          </p>
          <div className="space-y-2">
            {backupList.length > 0 && (
              <button
                onClick={() => {/* 打开备选列表 */}}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
              >
                从备选中选一个 ({backupList.length} 个)
              </button>
            )}
            <button
              onClick={() => {/* 打开排除标签 */}}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
            >
              排除不喜欢的类型
            </button>
            <button
              onClick={() => {/* 重置偏好 */}}
              className="w-full py-3 text-gray-500 text-sm hover:text-gray-700"
            >
              重置所有偏好
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}
