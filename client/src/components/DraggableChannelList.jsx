import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography
} from '@mui/material'
import {
  Tag,
  VolumeUp,
  DragIndicator
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const SortableChannel = ({ channel, currentChannel, onChannelSelect, canManage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ListItem 
      ref={setNodeRef} 
      style={style} 
      sx={{ 
        py: 0,
        ...style
      }}
    >
      <ListItemButton
        sx={{
          py: 1,
          px: 2,
          borderRadius: 1,
          mx: 1,
          bgcolor: currentChannel?._id === channel._id ? 'rgba(88, 101, 242, 0.1)' : 'transparent',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          },
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={() => onChannelSelect(channel)}
      >
        {canManage && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              mr: 1,
              opacity: 0.6,
              '&:hover': { opacity: 1 },
              '&:active': { cursor: 'grabbing' }
            }}
          >
            <DragIndicator sx={{ fontSize: 16, color: '#b9bbbe' }} />
          </Box>
        )}
        
        <ListItemIcon sx={{ minWidth: 32 }}>
          {channel.type === 'voice' ? (
            <VolumeUp sx={{ color: '#b9bbbe', fontSize: 20 }} />
          ) : (
            <Tag sx={{ color: '#b9bbbe', fontSize: 20 }} />
          )}
        </ListItemIcon>
        
        <ListItemText
          primary={channel.name}
          primaryTypographyProps={{
            sx: {
              color: currentChannel?._id === channel._id ? '#fff' : '#b9bbbe',
              fontSize: '14px',
              fontWeight: currentChannel?._id === channel._id ? 'bold' : 'normal'
            }
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}

const DraggableChannelList = ({ 
  channels = [], 
  currentChannel, 
  onChannelSelect, 
  serverId,
  canManageChannels = false 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = channels.findIndex(channel => channel._id === active.id)
      const newIndex = channels.findIndex(channel => channel._id === over.id)
      
      const newChannels = arrayMove(channels, oldIndex, newIndex)
      
      // Actualizar posiciones localmente primero para mejor UX
      const channelsWithNewPositions = newChannels.map((channel, index) => ({
        ...channel,
        position: index
      }))
      
      try {
        // Enviar actualización al servidor
        await axios.put('/api/channels/reorder', {
          channels: channelsWithNewPositions.map(channel => ({
            id: channel._id,
            position: channel.position
          })),
          serverId
        })
        
        toast.success('Canales reordenados exitosamente')
        
        // Emitir evento para actualizar otros clientes conectados
        // (esto sería manejado por Socket.IO en una implementación completa)
        
      } catch (error) {
        console.error('Error al reordenar canales:', error)
        toast.error('Error al reordenar canales')
      }
    }
  }

  // Ordenar canales por posición
  const sortedChannels = [...channels].sort((a, b) => a.position - b.position)

  if (!canManageChannels) {
    // Si no puede manejar canales, mostrar lista normal sin drag & drop
    return (
      <List sx={{ py: 1 }}>
        {sortedChannels.map((channel) => (
          <ListItem key={channel._id} sx={{ py: 0 }}>
            <ListItemButton
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1,
                mx: 1,
                bgcolor: currentChannel?._id === channel._id ? 'rgba(88, 101, 242, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => onChannelSelect(channel)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {channel.type === 'voice' ? (
                  <VolumeUp sx={{ color: '#b9bbbe', fontSize: 20 }} />
                ) : (
                  <Tag sx={{ color: '#b9bbbe', fontSize: 20 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={channel.name}
                primaryTypographyProps={{
                  sx: {
                    color: currentChannel?._id === channel._id ? '#fff' : '#b9bbbe',
                    fontSize: '14px',
                    fontWeight: currentChannel?._id === channel._id ? 'bold' : 'normal'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sortedChannels.map(channel => channel._id)}
        strategy={verticalListSortingStrategy}
      >
        <List sx={{ py: 1 }}>
          {sortedChannels.map((channel) => (
            <SortableChannel
              key={channel._id}
              channel={channel}
              currentChannel={currentChannel}
              onChannelSelect={onChannelSelect}
              canManage={canManageChannels}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableChannelList