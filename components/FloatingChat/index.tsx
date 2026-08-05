'use client'

import { useState, useRef, useEffect } from 'react'

import ChatBubbleIcon from '../Icons/ChatBubble'
import { CloseIcon } from '../Icons/Functions/Close'
import SendIcon from '../Icons/Functions/Send'

import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import MyButton from '@/components/MyButton'
import { PATH_LANGUAGE, TYPE_LANGUAGE } from '@/zustand/language'

type Message = {
  id: number
  text: string
  isUser: boolean
  time: string
}

const FloatingChat = () => {
  const { translate } = useLanguage()
  const { open, close, isMobile } = useModalDrawer({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: translate('chat.welcome'),
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsSending(true)

    // Simulate auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        text: translate('chat.autoReply'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, reply])
      setIsSending(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
        children: (
          <ChatContent
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
            messagesEndRef={messagesEndRef}
            isSending={isSending}
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
      <div className='fixed bottom-24 right-6 w-[60rem] h-[72rem] bg-white rounded-2xl shadow-2xl border border-border z-50 flex flex-col'>
        <div className='flex items-center justify-between px-4 py-3 bg-primary text-white rounded-t-2xl'>
          <div>
            <p className='font-semibold text-sm'>{translate('chat.title')}</p>
            <p className='text-xs text-white/80 flex items-center gap-1'>
              <span className='w-2 h-2 bg-green-400 rounded-full inline-block' />
              {translate('chat.online')}
            </p>
          </div>
          <button onClick={closeChat} aria-label='Close' className='rounded-full p-1 bg-white/15'>
            <CloseIcon className='w-4 h-4' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isUser ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-text rounded-bl-md'}`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.isUser ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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
            <p className='text-xs text-gray-400'>{translate('chat.pressEnterToSend')}</p>
            <MyButton onClick={handleSend} disabled={!inputValue.trim() || isSending} className='p-2'>
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
        className='fixed bottom-6 right-6 z-50 h-[58px] w-[58px] p-0'
      >
        {isOpen ? <CloseIcon className='w-6 h-6' /> : <ChatBubbleIcon className='w-6 h-6' />}
      </MyButton>
    </>
  )
}

// Reusable chat content for both modal and drawer
const ChatContent = ({
  messages,
  inputValue,
  setInputValue,
  handleSend,
  handleKeyDown,
  messagesEndRef,
  isSending,
  translate,
}: {
  messages: Message[]
  inputValue: string
  setInputValue: (val: string) => void
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isSending: boolean
  translate: (
    key?: PATH_LANGUAGE<TYPE_LANGUAGE>,
    variables?: Record<string, string | number | React.ReactNode | ((value: string | number) => React.ReactNode)>,
    defaultMessage?: string
  ) => any
}) => {
  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-border text-xs text-gray-500'>
        <span className='w-2 h-2 bg-green-400 rounded-full inline-block' />
        {translate('chat.online')}
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isUser ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-text rounded-bl-md'}`}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.isUser ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
          <p className='text-xs text-gray-400'>{translate('chat.pressEnterToSend')}</p>
          <MyButton onClick={handleSend} disabled={!inputValue.trim() || isSending} className='p-2'>
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
