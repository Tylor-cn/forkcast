'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, AlertTriangle, Check, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SessionMode } from '@/types'
import { DEMO_DISHES } from '@/utils/demoData'

export function SettingsPage() {
  const { preferences, resetPreferences, setSessionMode, setMixedRatio, pickHistory, dishes, setDishes } = useAppStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  const sessionModes: { id: SessionMode; label: string; desc: string }[] = [
    { 
      id: 'short', 
      label: '短期偏好', 
      desc: '仅基于当前Session的反馈推荐，适合临时心情' 
    },
    { 
      id: 'long', 
      label: '长期偏好', 
      desc: '基于历史累积数据推荐，适合稳定饮食习惯' 
    },
    { 
      id: 'mixed', 
      label: '混合模式', 
      desc: '综合短期和长期偏好，平衡实时性和稳定性' 
    },
  ]
  
  const handleReset = () => {
    resetPreferences()
    setShowResetConfirm(false)
  }
  
  const handleClearAndReload = () => {
    // 清除 localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lunch-picker-storage')
    }
    // 重新加载 demo 数据
    setDishes(DEMO_DISHES)
    // 重置偏好
    resetPreferences()
    setShowClearConfirm(false)
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="pt-8 pb-4 px-6">
        <h1 className="text-2xl font-bold text-gray-900">偏好设置</h1>
      </div>
      
      <div className="flex-1 overflow-auto px-6 pb-24">
        {/* Session 模式选择 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">推荐模式</h2>
          
          <div className="space-y-2">
            {sessionModes.map(mode => (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSessionMode(mode.id)}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  preferences.sessionMode === mode.id
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    preferences.sessionMode === mode.id
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {preferences.sessionMode === mode.id && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{mode.label}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{mode.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* 混合模式比例调整 */}
        {preferences.sessionMode === 'mixed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3">偏好比例</h2>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>短期偏好 {Math.round(preferences.mixedRatio * 100)}%</span>
                <span>长期偏好 {Math.round((1 - preferences.mixedRatio) * 100)}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={preferences.mixedRatio}
                onChange={e => setMixedRatio(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>完全长期</span>
                <span>完全短期</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 数据统计 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">数据统计</h2>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-orange-500">{dishes.length}</p>
                <p className="text-sm text-gray-500">菜品总数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{pickHistory.length}</p>
                <p className="text-sm text-gray-500">Pick次数</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 偏好重置 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">数据管理</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors btn-press"
            >
              <RefreshCw size={18} />
              重置偏好数据
            </button>
            
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors btn-press"
            >
              <Trash2 size={18} />
              清除本地存储并重新加载菜单
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2 text-center">
            重置偏好：清空偏好学习数据、Pick历史和备选列表<br />
            清除存储：删除所有本地数据，重新加载100道菜品
          </p>
        </div>
        
        {/* 关于 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">关于</h3>
          <p className="text-sm text-gray-600">
            今天到底想吃啥？是一个基于心理学理论的智能推荐系统。<br />
            通过记录你的负反馈和正反馈，系统会动态调整推荐权重，
            提供个性化的菜品推荐。
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Version 1.0.0
          </p>
        </div>
      </div>
      
      {/* 重置确认弹窗 */}
      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <h2 className="text-lg font-bold">确认重置？</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              这将清空所有偏好学习数据、Pick历史和备选列表，此操作不可撤销。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认重置
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* 清除存储确认弹窗 */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Trash2 className="text-orange-500" size={20} />
              </div>
              <h2 className="text-lg font-bold">清除并重新加载？</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              这将删除所有本地存储数据，并重新加载100道示例菜品。此操作不可撤销。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAndReload}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                确认清除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
