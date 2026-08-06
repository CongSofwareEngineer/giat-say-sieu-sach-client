import type { AgentMessage } from '@/agents/base'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export type ChatMessage = {
  id: number
  text: string
  isUser: boolean
  time: string
}

interface ChatState {
  messages: ChatMessage[]
  history: AgentMessage[]
  inputValue: string
  isSending: boolean
  setInputValue: (value: string) => void
  setSending: (sending: boolean) => void
  addMessage: (message: ChatMessage) => void
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

        setInputValue: (value) => set({ inputValue: value }),
        setSending: (sending) => set({ isSending: sending }),
        addMessage: (message) => set({ messages: [...get().messages, message] }),
        setHistory: (history) => set({ history }),
        clearChat: () => set({ messages: [], history: [], inputValue: '' }),
      }),
      {
        name: 'chat-zustand',
        partialize: (state) => ({
          messages: state.messages,
          history: state.history,
          inputValue: state.inputValue,
        }),
      }
    ),
    {
      name: 'chat-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
