import React from 'react'
import { triggerHaptic } from '../../utils/haptics'
import { TouchableButton } from './TouchableButton'

export function HapticButton({ children, onClick, hapticType = 'light', ...props }) {
  const handleClick = (e) => {
    triggerHaptic(hapticType)
    onClick?.(e)
  }

  return (
    <TouchableButton onClick={handleClick} {...props}>
      {children}
    </TouchableButton>
  )
} 