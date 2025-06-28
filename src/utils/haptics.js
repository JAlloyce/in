export const triggerHaptic = (type = 'light') => {
  if (typeof window !== 'undefined' && window.navigator?.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 100, 10],
      error: [100, 50, 100]
    }
    window.navigator.vibrate(patterns[type] || patterns.light)
  }
} 