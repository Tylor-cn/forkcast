'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '@/components/BottomNav'
import { RecommendPage } from '@/components/RecommendPage'
import { MenuPage } from '@/components/MenuPage'
import { CollectionPage } from '@/components/CollectionPage'
import { SettingsPage } from '@/components/SettingsPage'
import ExcludeIntro from '@/components/ExcludeIntro'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isClient, setIsClient] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const { startNewSession, initialExcludedTags, dishes } = useAppStore()

  useEffect(() => {
    setIsClient(true)
    startNewSession()

    const hasDoneIntro = localStorage.getItem('lunch-picker-intro-done')
    setShowIntro(!hasDoneIntro)
  }, [startNewSession])

  const handleIntroComplete = () => {
    localStorage.setItem('lunch-picker-intro-done', 'true')
    setShowIntro(false)
  }

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
          {isClient && (
            <AnimatePresence mode="wait">
              {showIntro && dishes.length > 0 ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full overflow-y-auto"
                >
                  <ExcludeIntro onComplete={handleIntroComplete} />
                </motion.div>
              ) : (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full overflow-y-auto"
                >
                  {renderPage()}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        {!showIntro && <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />}
      </div>
    </main>
  )
}
