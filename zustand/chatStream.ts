import { create } from 'zustand'

// Live state of the reply being generated. Kept apart from the chat store on
// purpose: that store persists to localStorage on every set, this one changes
// many times per second. Lives outside Chat because Chat unmounts when closed.
interface ChatStreamState {
  text: string
  activeTool: string | null
  controller: AbortController | null
  isDiscarded: boolean
  setText: (text: string) => void
  setActiveTool: (activeTool: string | null) => void
  begin: () => AbortController
  stop: () => void
  discard: () => void
  end: () => void
}

export const chatStream = create<ChatStreamState>()((set, get) => ({
  text: '',
  activeTool: null,
  controller: null,
  isDiscarded: false,
  setText: (text) => set({ text }),
  setActiveTool: (activeTool) => set({ activeTool }),
  begin: () => {
    const controller = new AbortController()

    set({ text: '', activeTool: null, controller, isDiscarded: false })

    return controller
  },
  // Stop the turn and keep what was generated so far
  stop: () => get().controller?.abort(),
  // Stop the turn and drop its output (chat was cleared)
  discard: () => {
    set({ isDiscarded: true })
    get().controller?.abort()
  },
  end: () => set({ text: '', activeTool: null, controller: null }),
}))
