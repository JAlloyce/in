import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false)
  const location = useLocation()

  // Close all modals when location changes
  useEffect(() => {
    setIsSettingsOpen(false)
    setIsAnyModalOpen(false)
  }, [location.pathname])

  // Update any modal open state
  useEffect(() => {
    setIsAnyModalOpen(isSettingsOpen)
  }, [isSettingsOpen])

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)

  const value = {
    isSettingsOpen,
    isAnyModalOpen,
    openSettings,
    closeSettings
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
} 