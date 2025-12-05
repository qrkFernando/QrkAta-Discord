import React from 'react'
import { Box } from '@mui/material'
import ServerIconsColumn from './ServerIconsColumn'
import ServerPanel from './ServerPanel'
import DirectMessagesList from './DirectMessagesList'
import { useMobile } from '../context/MobileContext'

const MobileMainView = ({
  servers,
  currentServer,
  currentChannel,
  currentDM,
  onServerSelect,
  onChannelSelect,
  onServerCreated,
  onChannelCreated,
  onDMViewOpen,
  onDMSelect,
  viewMode
}) => {
  const { showMobileChat } = useMobile()

  // Wrapper para manejar selección de canal en móvil
  const handleChannelSelectMobile = (channel) => {
    onChannelSelect(channel)
    showMobileChat(channel)
  }

  // Wrapper para manejar selección de DM en móvil
  const handleDMSelectMobile = (dm) => {
    onDMSelect(dm)
    showMobileChat(dm)
  }

  return (
    <Box className="mobile-main-view mobile-view-transition">
      {/* Columna de iconos de servidores */}
      <ServerIconsColumn
        servers={servers}
        currentServer={currentServer}
        onServerSelect={onServerSelect}
        onServerCreated={onServerCreated}
        onDMViewOpen={onDMViewOpen}
        viewMode={viewMode}
      />
      
      {/* Panel principal - canales o DMs */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'servers' ? (
          <ServerPanel
            currentServer={currentServer}
            currentChannel={currentChannel}
            onChannelSelect={handleChannelSelectMobile}
            onChannelCreated={onChannelCreated}
            onServerCreated={onServerCreated}
          />
        ) : (
          <DirectMessagesList
            onDMSelect={handleDMSelectMobile}
            currentDM={currentDM}
          />
        )}
      </Box>
    </Box>
  )
}

export default MobileMainView