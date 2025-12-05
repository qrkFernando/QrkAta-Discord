import { useEffect } from 'react'
import { useMobile } from '../context/MobileContext'

export const useMobileNavigation = () => {
  const { isMobile, mobileView, showMobileMain } = useMobile()

  // Manejar botón atrás del navegador en móvil
  useEffect(() => {
    if (!isMobile) return

    const handlePopState = (event) => {
      if (mobileView === 'chat') {
        event.preventDefault()
        showMobileMain()
        // Agregar entrada al historial para mantener consistencia
        window.history.pushState({ view: 'main' }, '', window.location.pathname)
      }
    }

    // Agregar estado inicial
    if (mobileView === 'main') {
      window.history.replaceState({ view: 'main' }, '', window.location.pathname)
    } else if (mobileView === 'chat') {
      window.history.pushState({ view: 'chat' }, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isMobile, mobileView, showMobileMain])

  // Prevenir zoom en doble tap en móvil
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }

    let lastTouchEnd = 0
    const handleTouchEnd = (event) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile])
}

export default useMobileNavigation