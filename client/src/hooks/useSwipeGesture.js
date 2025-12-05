import { useRef, useEffect } from 'react'

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e) => {
      touchStartRef.current = e.targetTouches[0].clientX
    }

    const handleTouchMove = (e) => {
      touchEndRef.current = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
      if (!touchStartRef.current || !touchEndRef.current) return

      const distance = touchStartRef.current - touchEndRef.current
      const isLeftSwipe = distance > threshold
      const isRightSwipe = distance < -threshold

      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }

      // Reset
      touchStartRef.current = null
      touchEndRef.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return elementRef
}

export default useSwipeGesture