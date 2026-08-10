import type { AgentMessage } from '@/agents/base'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export type ChatMessage = {
  id: number
  text: string
  isUser: boolean
  time: string
  isQuickOptions?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  history: AgentMessage[]
  inputValue: string
  isSending: boolean
  unreadCount: number
  isHasHydrated: boolean
  setInputValue: (value: string) => void
  setSending: (sending: boolean) => void
  addMessage: (message: ChatMessage) => void
  removeMessage: (id: number) => void
  incrementUnread: () => void
  resetUnread: () => void
  setHistory: (history: AgentMessage[]) => void
  clearChat: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const chat = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        history: [],
        inputValue: '',
        isSending: false,
        unreadCount: 0,
        isHasHydrated: false,
        setInputValue: (value) => set({ inputValue: value }),
        setSending: (sending) => set({ isSending: sending }),
        addMessage: (message) => set({ messages: [...get().messages, message] }),
        removeMessage: (id) => set({ messages: get().messages.filter((msg) => msg.id !== id) }),
        incrementUnread: () => set({ unreadCount: get().unreadCount + 1 }),
        resetUnread: () => set({ unreadCount: 0 }),
        setHistory: (history) => set({ history }),
        clearChat: () => set({ messages: [], history: [], inputValue: '', unreadCount: 0 }),
        setHasHydrated: (hasHydrated) => set({ isHasHydrated: hasHydrated }),
      }),
      {
        name: 'chat-zustand',
        partialize: (state) => ({
          messages: state.messages,
          history: state.history,
          inputValue: state.inputValue,
          unreadCount: state.unreadCount,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      }
    ),
    {
      name: 'chat-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
