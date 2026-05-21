'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Upload, Image, FileText, Edit2, Trash2, X, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Dish, PREDEFINED_TAGS, TAG_CATEGORIES, TagCategory } from '@/types'
import { DEMO_DISHES } from '@/utils/demoData'

export function MenuPage() {
  const { dishes, addDish, updateDish, deleteDish, setDishes } = useAppStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [newDishName, setNewDishName] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const handleAddDish = () => {
    if (!newDishName.trim()) return

    const newDish: Dish = {
      id: `dish-${Date.now()}`,
      name: newDishName.trim(),
      tags: selectedTags,
      stats: {
        pickCount: 0,
        rejectCount: 0,
      },
      createdAt: Date.now(),
    }

    addDish(newDish)
    setNewDishName('')
    setSelectedTags([])
    setShowAddModal(false)
  }

  const handleUpdateDish = () => {
    if (!editingDish || !newDishName.trim()) return

    updateDish(editingDish.id, {
      name: newDishName.trim(),
      tags: selectedTags,
    })

    setEditingDish(null)
    setNewDishName('')
    setSelectedTags([])
  }

  const handleDeleteDish = (id: string) => {
    if (confirm('确定要删除这个菜品吗？')) {
      deleteDish(id)
    }
  }

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish)
    setNewDishName(dish.name)
    setSelectedTags(dish.tags)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')

      if (lines.length < 2) {
        alert('CSV文件格式错误')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const nameIndex = headers.findIndex(h => h.includes('名称') || h.toLowerCase() === 'name')
      const cuisineIndex = headers.findIndex(h => h.includes('菜系') || h.toLowerCase() === 'cuisine')
      const tasteIndex = headers.findIndex(h => h.includes('口味') || h.toLowerCase() === 'taste')
      const typeIndex = headers.findIndex(h => h.includes('类型') || h.toLowerCase() === 'type')

      if (nameIndex === -1) {
        alert('CSV文件必须包含"菜品名称"列')
        return
      }

      const newDishes: Dish[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values[nameIndex]) {
          const tags: string[] = []

          if (cuisineIndex !== -1 && values[cuisineIndex]) {
            const cuisineTag = PREDEFINED_TAGS.find(
              t => t.category === 'cuisine' && t.name === values[cuisineIndex]
            )
            if (cuisineTag) tags.push(cuisineTag.id)
          }

          if (tasteIndex !== -1 && values[tasteIndex]) {
            const tasteTag = PREDEFINED_TAGS.find(
              t => t.category === 'taste' && t.name === values[tasteIndex]
            )
            if (tasteTag) tags.push(tasteTag.id)
          }

          if (typeIndex !== -1 && values[typeIndex]) {
            const typeTag = PREDEFINED_TAGS.find(
              t => t.category === 'type' && t.name === values[typeIndex]
            )
            if (typeTag) tags.push(typeTag.id)
          }

          newDishes.push({
            id: `dish-${Date.now()}-${i}`,
            name: values[nameIndex],
            tags,
            stats: { pickCount: 0, rejectCount: 0 },
            createdAt: Date.now(),
          })
        }
      }

      if (newDishes.length > 0) {
        setDishes([...dishes, ...newDishes])
        alert(`成功导入 ${newDishes.length} 个菜品`)
        setShowUploadModal(false)
      }
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    alert('图片OCR功能需要接入OCR服务（如腾讯云OCR），当前暂未实现。\n请使用CSV导入或手动添加。')
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pt-8 pb-4 px-6">
        <h1 className="text-2xl font-bold text-gray-900">菜单管理</h1>
        <p className="text-gray-500 text-sm mt-1">
          共 {dishes.length} 个菜品
        </p>
      </div>

      <div className="flex gap-3 px-6 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors btn-press"
        >
          <Plus size={20} />
          手动添加
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors btn-press"
        >
          <Upload size={20} />
          导入
        </button>
      </div>

      {dishes.length === 0 && (
        <div className="px-6 mb-4">
          <button
            onClick={() => setDishes(DEMO_DISHES)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-colors btn-press"
          >
            <Sparkles size={20} />
            加载示例数据快速体验
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto px-6 pb-24">
        {dishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">还没有菜品</h3>
            <p className="text-gray-500">
              点击上方按钮添加菜品
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dishes.map(dish => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 card-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{dish.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dish.tags.map(tagId => {
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
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Pick: {dish.stats.pickCount}</span>
                      <span>跳过: {dish.stats.rejectCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(dish)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(showAddModal || editingDish) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => {
              setShowAddModal(false)
              setEditingDish(null)
              setNewDishName('')
              setSelectedTags([])
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingDish ? '编辑菜品' : '添加菜品'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingDish(null)
                    setNewDishName('')
                    setSelectedTags([])
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  菜品名称
                </label>
                <input
                  type="text"
                  value={newDishName}
                  onChange={e => setNewDishName(e.target.value)}
                  placeholder="输入菜品名称"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>

                {(Object.keys(TAG_CATEGORIES) as TagCategory[]).map(category => {
                  const categoryTags = PREDEFINED_TAGS.filter(t => t.category === category)
                  const categoryInfo = TAG_CATEGORIES[category]

                  return (
                    <div key={category} className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {categoryInfo.icon} {categoryInfo.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categoryTags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              selectedTags.includes(tag.id)
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={editingDish ? handleUpdateDish : handleAddDish}
                disabled={!newDishName.trim()}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
              >
                {editingDish ? '保存修改' : '添加菜品'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">导入菜单</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image className="text-blue-500" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">图片识别</p>
                    <p className="text-sm text-gray-500">上传菜单图片，自动识别菜品</p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={() => csvInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="text-green-500" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">CSV文件</p>
                    <p className="text-sm text-gray-500">上传CSV格式的菜单文件</p>
                  </div>
                </button>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">CSV格式示例：</p>
                <code className="text-xs text-gray-600 block overflow-x-auto">
                  菜品名称,菜系,口味,类型<br/>
                  宫保鸡丁,川菜,辣,热菜<br/>
                  糖醋里脊,中餐,甜,热菜
                </code>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
