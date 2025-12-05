import React, { createContext, useContext, useState, useEffect } from 'react'

const MobileContext = createContext()

export const useMobile = () => {
  const context = useContext(MobileContext)
  if (!context) {
    throw new Error('useMobile debe ser usado dentro de MobileProvider')
  }
  return context
}

export const MobileProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState('main') // 'main' | 'chat'
  const [selectedChannelForMobile, setSelectedChannelForMobile] = useState(null)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const newIsMobile = width <= 768
      setIsMobile(newIsMobile)
      
      // Manejar clase del body para prevenir scroll en móvil
      if (newIsMobile) {
        document.body.classList.add('mobile-view')
      } else {
        document.body.classList.remove('mobile-view')
        // Si cambia a desktop, resetear vista móvil
        setMobileView('main')
        setSelectedChannelForMobile(null)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.body.classList.remove('mobile-view')
    }
  }, [])

  const showMobileChat = (channel) => {
    if (isMobile) {
      setSelectedChannelForMobile(channel)
      setMobileView('chat')
      // Agregar al historial para navegación con botón atrás
      window.history.pushState({ view: 'chat' }, '', window.location.pathname)
    }
  }

  const showMobileMain = () => {
    if (isMobile) {
      setMobileView('main')
      setSelectedChannelForMobile(null)
      // No necesitamos pushState aquí ya que se maneja en el hook
    }
  }

  const value = {
    isMobile,
    mobileView,
    selectedChannelForMobile,
    showMobileChat,
    showMobileMain
  }

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}