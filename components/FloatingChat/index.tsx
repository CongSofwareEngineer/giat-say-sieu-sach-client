'use client'

import { useState, useRef, useEffect } from 'react'

import ChatBubbleIcon from '../Icons/ChatBubble'
import ChatMarkdown from '../ChatMarkdown'
import { TrashIcon } from '../Icons/Trash'
import { CloseIcon } from '../Icons/Functions/Close'
import SendIcon from '../Icons/Functions/Send'

import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import MyButton from '@/components/MyButton'
import { chat, type ChatMessage } from '@/zustand/chat'
import { PATH_LANGUAGE, TYPE_LANGUAGE } from '@/zustand/language'

type TranslateFn = (
  key?: PATH_LANGUAGE<TYPE_LANGUAGE>,
  variables?: Record<string, string | number | React.ReactNode | ((value: string | number) => React.ReactNode)>,
  defaultMessage?: string
) => any

const FloatingChat = () => {
  const { translate, lang } = useLanguage()
  const { open, close, isMobile } = useModalDrawer({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, inputValue, isSending, setInputValue, addMessage } = useChat()

  useEffect(() => {
    if (chat.getState().messages.length === 0) {
      addMessage({
        id: 1,
        text: translate('chat.welcome'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [addMessage, translate])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to the latest message when the chat opens (drawer/modal may animate in)
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(scrollToBottom, 350)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleSend = async () => {
    const { messages, inputValue, isSending, setInputValue, setSending, addMessage, history } = chat.getState()

    if (!inputValue.trim() || isSending) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    addMessage(userMessage)
    setInputValue('')
    setSending(true)

    try {
      const response = await fetch('/api/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, history, locale: lang }),
      })

      const data = await response.json()

      if (response.ok && data.text) {
        addMessage({
          id: messages.length + 2,
          text: data.text,
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        chat.getState().setHistory(data.history)
      } else {
        throw new Error(data?.error || 'Request failed')
      }
    } catch {
      addMessage({
        id: messages.length + 2,
        text: translate('chat.error'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    chat.getState().clearChat()
    addMessage({
      id: 1,
      text: translate('chat.welcome'),
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const openChat = () => {
    setIsOpen(true)

    if (isMobile) {
      open({
        title: translate('chat.title'),
        drawerPlacement: 'bottom',
        classNames: {
          container: 'rounded-t-2xl',
        },
        onClose: () => setIsOpen(false),
        children: (
          <ChatContent
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
            handleClearChat={handleClearChat}
            messagesEndRef={messagesEndRef}
            translate={translate}
          />
        ),
      })
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    if (isMobile) close()
  }

  // Desktop chat popup
  const renderDesktopChat = () => {
    if (!isOpen || isMobile) return null

    return (
      <div className='fixed bottom-24 right-6 z-50 flex h-[70dvh] max-h-[calc(100dvh-7rem)] w-[500px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl'>
        <div className='flex items-center justify-between px-4 py-3 bg-primary text-white rounded-t-2xl'>
          <div>
            <p className='font-semibold text-sm'>{translate('chat.title')}</p>
            <p className='text-xs text-white/90 flex items-center gap-1'>
              <span className='w-2 h-2 bg-green-400 rounded-full inline-block' />
              {translate('chat.online')}
            </p>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={handleClearChat}
              aria-label={translate('chat.clear')}
              title={translate('chat.clear')}
              className='cursor-pointer rounded-full p-2 bg-white/15 hover:bg-white/25 transition-colors'
            >
              <TrashIcon className='w-5 h-5' />
            </button>
            <button
              onClick={closeChat}
              aria-label='Close'
              className='cursor-pointer rounded-full p-2 bg-white/15 hover:bg-white/25 transition-colors'
            >
              <CloseIcon className='w-5 h-5' />
            </button>
          </div>
        </div>

        <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} isSending={isSending} translate={translate} />

        <div className='p-3 border-t border-border'>
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={translate('chat.inputPlaceholder')}
            className='w-full px-3 py-2 text-sm border border-border rounded-2xl focus:outline-none resize-none placeholder:text-gray-500'
          />
          <div className='flex items-center justify-between mt-2'>
            <p className='text-xs text-gray-500'>{translate('chat.pressEnterToSend')}</p>
            <MyButton onClick={handleSend} disabled={!inputValue.trim() || isSending} className='p-3'>
              {isSending ? (
                <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
              ) : (
                <SendIcon className='w-4 h-4' />
              )}
            </MyButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderDesktopChat()}

      <MyButton
        onClick={isOpen ? closeChat : openChat}
        aria-label={translate('chat.title')}
        className={`fixed z-50 p-0 shadow-lg ${isMobile ? 'bottom-5 right-5 h-10 w-10' : 'bottom-6 right-6 h-[58px] w-[58px]'}`}
      >
        {isOpen ? <CloseIcon className='w-6 h-6' /> : <ChatBubbleIcon className='w-6 h-6' />}
      </MyButton>
    </>
  )
}

// Shared message list with typing indicator for desktop popup and mobile drawer
const ChatMessageList = ({
  messages,
  messagesEndRef,
  isSending,
  translate,
}: {
  messages: ChatMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isSending: boolean
  translate: TranslateFn
}) => {
  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-3'>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isUser ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-text rounded-bl-md'}`}
          >
            {msg.isUser ? <p className='whitespace-pre-wrap'>{msg.text}</p> : <ChatMarkdown>{msg.text}</ChatMarkdown>}
            <p className={`text-[10px] mt-1 ${msg.isUser ? 'text-white/90' : 'text-gray-500'}`}>{msg.time}</p>
          </div>
        </div>
      ))}
      {isSending && <TypingIndicator translate={translate} />}
      <div ref={messagesEndRef} />
    </div>
  )
}

// Small bubble shown while the server is processing the user's message
const TypingIndicator = ({ translate }: { translate: TranslateFn }) => {
  return (
    <div className='flex justify-start'>
      <div className='flex items-center gap-2 bg-gray-100 text-gray-500 rounded-2xl rounded-bl-md px-3 py-2 text-xs'>
        <span className='flex gap-1'>
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce' />
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]' />
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]' />
        </span>
        {translate('chat.typing')}
      </div>
    </div>
  )
}

// Reusable chat content for both modal and drawer
const ChatContent = ({
  handleSend,
  handleKeyDown,
  handleClearChat,
  messagesEndRef,
  translate,
}: {
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleClearChat: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  translate: TranslateFn
}) => {
  const { messages, inputValue, isSending, setInputValue } = useChat()

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-border text-xs text-gray-500'>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 bg-green-400 rounded-full inline-block' />
          {translate('chat.online')}
        </div>
        <button
          onClick={handleClearChat}
          aria-label={translate('chat.clear')}
          title={translate('chat.clear')}
          className='cursor-pointer rounded-full p-1.5 hover:bg-black/5 transition-colors'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>

      <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} isSending={isSending} translate={translate} />

      <div className='p-3 border-t border-border'>
        <textarea
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={translate('chat.inputPlaceholder')}
          className='w-full px-3 py-2 text-sm border border-border rounded-2xl focus:outline-none resize-none'
        />
        <div className='flex items-center justify-between mt-2'>
          <p className='text-xs text-gray-500'>{translate('chat.pressEnterToSend')}</p>
          <MyButton onClick={handleSend} disabled={!inputValue.trim() || isSending} className='p-3'>
            {isSending ? (
              <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
            ) : (
              <SendIcon className='w-4 h-4' />
            )}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default FloatingChat
