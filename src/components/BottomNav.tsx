'use client'

import { Home, UtensilsCrossed, Heart, Settings } from 'lucide-react'

interface BottomNavProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: '推荐', icon: Home },
    { id: 'menu', label: '菜单', icon: UtensilsCrossed },
    { id: 'collection', label: '收藏', icon: Heart },
    { id: 'settings', label: '设置', icon: Settings },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 bottom-nav">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
