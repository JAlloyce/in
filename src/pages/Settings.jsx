import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SettingsModal from '../components/settings/SettingsModal'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    // go back to previous page after modal closes
    navigate(-1)
  }

  // Close on esc key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SettingsModal isOpen={open} onClose={handleClose} />
  )
} 