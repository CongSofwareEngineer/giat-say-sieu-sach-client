import { LAUNDRY_FORM_MARKER } from '@/agents/tools/laundry'
import { ORDER_PHONE_FORM_MARKER } from '@/agents/tools/myOrders'
import { CHAT_STREAM_CATCH_UP_DIVISOR, CHAT_STREAM_TICK_MS } from '@/constants/tools'

const CHAT_MARKERS = [LAUNDRY_FORM_MARKER, ORDER_PHONE_FORM_MARKER]
const MAX_MARKER_LENGTH = Math.max(...CHAT_MARKERS.map((marker) => marker.length))

// Text safe to show mid-stream: drops markers and holds back a tail that may be the start of one
export const getVisibleStreamText = (raw: string): string => {
  const text = CHAT_MARKERS.reduce((result, marker) => result.split(marker).join(''), raw).trimStart()

  for (let length = Math.min(MAX_MARKER_LENGTH - 1, text.length); length > 0; length -= 1) {
    const tail = text.slice(-length)

    if (CHAT_MARKERS.some((marker) => marker.startsWith(tail))) return text.slice(0, -length)
  }

  return text
}

// Reveals text at an even pace however the provider chunks it: the more is
// pending, the larger the step, so the display never lags far behind.
export const createTextSmoother = (onUpdate: (text: string) => void) => {
  let target = ''
  let shown = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let waiters: (() => void)[] = []

  const settle = () => {
    waiters.forEach((resolve) => resolve())
    waiters = []
  }

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  const tick = () => {
    timer = null

    const pending = target.length - shown

    if (pending <= 0) {
      settle()

      return
    }

    // Hidden tabs throttle timers, so show everything at once there
    shown += document.hidden ? pending : Math.max(1, Math.ceil(pending / CHAT_STREAM_CATCH_UP_DIVISOR))

    // Never split a surrogate pair (emoji)
    const lastCode = target.charCodeAt(shown - 1)

    if (lastCode >= 0xd800 && lastCode <= 0xdbff) shown += 1

    onUpdate(target.slice(0, shown))
    schedule()
  }

  const schedule = () => {
    if (timer === null) timer = setTimeout(tick, CHAT_STREAM_TICK_MS)
  }

  return {
    setTarget: (text: string) => {
      target = text
      schedule()
    },
    // Forget the text so far (it preceded a tool call)
    reset: () => {
      clearTimer()
      target = ''
      shown = 0
      onUpdate('')
    },
    // Resolves once all the text has been revealed, or on stop()
    drain: () =>
      new Promise<void>((resolve) => {
        if (timer === null && shown >= target.length) {
          resolve()

          return
        }
        waiters.push(resolve)
        schedule()
      }),
    // Halt and return the text shown so far
    stop: () => {
      clearTimer()
      settle()

      return target.slice(0, shown)
    },
  }
}
