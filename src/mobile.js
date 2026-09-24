// Small phone-only niceties: haptics and keeping the screen awake while practising.
import { useEffect } from 'react'

// Short buzz on supporting phones (Android; iOS Safari ignores it)
export function buzz(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // some browsers throw when vibration is blocked; it's only a nicety
  }
}

export const buzzWrong = () => buzz([40, 40, 40])
export const buzzRight = () => buzz(12)

/** Keep the screen on while `active` is true (drills, metronome). */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !navigator.wakeLock) return
    let lock = null
    let cancelled = false
    const request = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) l.release()
        else lock = l
      } catch {
        // denied (low battery, not visible): the screen just sleeps as usual
      }
    }
    // the lock is dropped when the tab is hidden, so take it again on return
    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}
