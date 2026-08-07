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
  setInputValue: (value: string) => void
  setSending: (sending: boolean) => void
  addMessage: (message: ChatMessage) => void
  incrementUnread: () => void
  resetUnread: () => void
  setHistory: (history: AgentMessage[]) => void
  clearChat: () => void
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

        setInputValue: (value) => set({ inputValue: value }),
        setSending: (sending) => set({ isSending: sending }),
        addMessage: (message) => set({ messages: [...get().messages, message] }),
        incrementUnread: () => set({ unreadCount: get().unreadCount + 1 }),
        resetUnread: () => set({ unreadCount: 0 }),
        setHistory: (history) => set({ history }),
        clearChat: () => set({ messages: [], history: [], inputValue: '', unreadCount: 0 }),
      }),
      {
        name: 'chat-zustand',
        partialize: (state) => ({
          messages: state.messages,
          history: state.history,
          inputValue: state.inputValue,
          unreadCount: state.unreadCount,
        }),
      }
    ),
    {
      name: 'chat-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
