import React, { useState } from 'react'
import {
  IconButton,
  Popover,
  Box,
  useTheme
} from '@mui/material'
import { EmojiEmotions } from '@mui/icons-material'
import EmojiPickerReact from 'emoji-picker-react'

const EmojiPicker = ({ onEmojiSelect, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()

  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEmojiClick = (emojiObject) => {
    if (onEmojiSelect && emojiObject.emoji) {
      onEmojiSelect(emojiObject.emoji)
    }
    handleClose()
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton 
        onClick={handleClick}
        disabled={disabled}
        sx={{
          color: theme.palette.tertiary?.main || theme.palette.warning.main,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: theme.palette.tertiary?.light || theme.palette.warning.light,
            bgcolor: `${theme.palette.tertiary?.main || theme.palette.warning.main}15`,
            transform: 'scale(1.1)'
          },
          '&:active': {
            transform: 'scale(0.95)'
          }
        }}
      >
        <EmojiEmotions />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${theme.palette.primary.main}30`,
            '& .epr-main': {
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.accent || theme.palette.background.default} 100%)`,
              backdropFilter: 'blur(20px)'
            },
            '& .epr-category-nav': {
              background: theme.palette.background.accent || theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`
            },
            '& .epr-emoji-category-label': {
              background: `${theme.palette.primary.main}20`,
              color: theme.palette.text.primary,
              fontWeight: 'bold'
            },
            '& .epr-emoji:hover': {
              background: `${theme.palette.primary.main}20`
            },
            '& .epr-search-container': {
              background: theme.palette.background.accent || theme.palette.background.default,
              '& input': {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px'
              }
            }
          }}
        >
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            theme={theme.palette.mode}
            width={320}
            height={400}
            searchPlaceHolder="Buscar emojis..."
            categoryLabels={{
              smileys_people: "Caritas y Personas",
              animals_nature: "Animales y Naturaleza", 
              food_drink: "Comida y Bebida",
              travel_places: "Viajes y Lugares",
              activities: "Actividades",
              objects: "Objetos",
              symbols: "Símbolos",
              flags: "Banderas",
              recently_used: "Recientes"
            }}
            autoFocusSearch={false}
            lazyLoadEmojis={true}
          />
        </Box>
      </Popover>
    </>
  )
}

export default EmojiPicker