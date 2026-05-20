'use client'

import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { RecommendPage } from '@/components/RecommendPage'
import { MenuPage } from '@/components/MenuPage'
import { CollectionPage } from '@/components/CollectionPage'
import { SettingsPage } from '@/components/SettingsPage'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isClient, setIsClient] = useState(false)
  const { startNewSession } = useAppStore()
  
  // 确保只在客户端渲染，避免 hydration mismatch
  useEffect(() => {
    setIsClient(true)
    startNewSession()
  }, [startNewSession])
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <RecommendPage />
      case 'menu':
        return <MenuPage />
      case 'collection':
        return <CollectionPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <RecommendPage />
    }
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-lg mx-auto h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          {isClient ? renderPage() : null}
        </div>
        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </main>
  )
}
