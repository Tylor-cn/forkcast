'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { X, Star, Heart } from 'lucide-react'
import { Dish, PREDEFINED_TAGS } from '@/types'

interface DishCardProps {
  dish: Dish
  onReject: () => void
  onBackup: () => void
  onPick: () => void
  index: number
}

export function DishCard({ dish, onReject, onBackup, onPick, index }: DishCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0])

  const rejectOpacity = useTransform(x, [-150, -50], [1, 0])
  const pickOpacity = useTransform(x, [50, 150], [0, 1])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x < -threshold) {
      onReject()
    } else if (info.offset.x > threshold) {
      onPick()
    }
  }

  const groupedTags = dish.tags.reduce((acc, tagId) => {
    const tag = PREDEFINED_TAGS.find(t => t.id === tagId)
    if (tag) {
      if (!acc[tag.category]) acc[tag.category] = []
      acc[tag.category].push(tag.name)
    }
    return acc
  }, {} as Record<string, string[]>)

  return (
    <motion.div
      className="absolute w-full"
      style={{
        x,
        rotate,
        opacity,
        zIndex: 3 - index,
        scale: 1 - index * 0.05,
        y: index * 10,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, opacity: 1 }}
      exit={{ x: 300, opacity: 0, rotate: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: rejectOpacity }}
        >
          <div className="bg-red-500 text-white rounded-full p-3">
            <X size={24} />
          </div>
        </motion.div>

        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: pickOpacity }}
        >
          <div className="bg-green-500 text-white rounded-full p-3">
            <Heart size={24} />
          </div>
        </motion.div>

        {dish.imageUrl ? (
          <div className="h-40 bg-gray-100 relative">
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{dish.name}</h3>

          <div className="flex flex-wrap gap-2">
            {Object.entries(groupedTags).map(([category, tags]) =>
              tags.map(tag => (
                <span
                  key={`${category}-${tag}`}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 p-4 pt-0">
          <button
            onClick={onReject}
            className="w-14 h-14 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors btn-press"
          >
            <X className="text-gray-600 hover:text-red-500" size={24} />
          </button>

          <button
            onClick={onBackup}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 flex items-center justify-center transition-colors btn-press"
          >
            <Star className="text-gray-600 hover:text-yellow-500" size={20} />
          </button>

          <button
            onClick={onPick}
            className="w-14 h-14 rounded-full bg-gray-100 hover:bg-green-100 flex items-center justify-center transition-colors btn-press"
          >
            <Heart className="text-gray-600 hover:text-green-500" size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
