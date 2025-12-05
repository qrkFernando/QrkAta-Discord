import React, { useState } from 'react'
import { Box, Drawer } from '@mui/material'
import { useMobile } from '../context/MobileContext'
import useSwipeGesture from '../hooks/useSwipeGesture'
import MobileHeader from './MobileHeader'
import MainContent from './MainContent'
import MembersList from './MembersList'
import SwipeIndicator from './SwipeIndicator'

const MobileChatView = ({ currentServer, currentChannel, currentDM, viewMode, user }) => {
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
  const { showMobileMain } = useMobile()
  
  const toggleMembersDrawer = () => {
    setMembersDrawerOpen(!membersDrawerOpen)
  }

  // Gestos de swipe: deslizar hacia la derecha para volver
  const swipeRef = useSwipeGesture(
    null, // onSwipeLeft
    () => showMobileMain(), // onSwipeRight - volver al menú principal
    80 // threshold más alto para evitar activaciones accidentales
  )

  return (
    <Box 
      ref={swipeRef}
      className="mobile-chat-view mobile-view-transition"
    >
      {/* Header móvil */}
      <MobileHeader
        currentServer={currentServer}
        currentChannel={currentChannel}
        currentDM={currentDM}
        viewMode={viewMode}
        user={user}
        onMembersToggle={viewMode === 'servers' ? toggleMembersDrawer : null}
      />

      {/* Contenido del chat */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <MainContent
          currentServer={currentServer}
          currentChannel={currentChannel}
          currentDM={currentDM}
          viewMode={viewMode}
          user={user}
        />
      </Box>

      {/* Drawer de miembros para móvil */}
      {viewMode === 'servers' && currentServer && (
        <Drawer
          anchor="right"
          open={membersDrawerOpen}
          onClose={() => setMembersDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: '80%',
              maxWidth: 320,
              bgcolor: '#2f3136',
              borderLeft: '1px solid #40444b'
            }
          }}
        >
          <MembersList
            server={currentServer}
            currentUser={user}
          />
        </Drawer>
      )}

      {/* Indicador de swipe para primera vez */}
      <SwipeIndicator />
    </Box>
  )
}

export default MobileChatView