// Play a short chime + vibration for unread chat messages
let audioCtx: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null

  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioCtx) return null

  audioCtx ??= new AudioCtx()

  if (audioCtx.state === 'suspended') audioCtx.resume()

  return audioCtx
}

const playTone = (ctx: AudioContext, startAt: number, frequency: number, duration: number) => {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  // Fade in/out to avoid clicks
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.05)
}

// Alert the user with a chime + vibration when a new unread message arrives
export const notifyUnreadMessage = () => {
  if (navigator.vibrate) navigator.vibrate([120, 60, 120])

  const ctx = getAudioContext()

  if (!ctx) return

  const now = ctx.currentTime

  playTone(ctx, now, 880, 0.18)
  playTone(ctx, now + 0.16, 1320, 0.3)
}
