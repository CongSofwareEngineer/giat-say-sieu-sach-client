'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import ChatMessageList from './ChatMessageList'
import { LAUNDRY_PRICES, LAUNDRY_SERVICE_NAMES, type LaundryFormData } from './types'

import { TrashIcon } from '@/components/Icons/Trash'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import SendIcon from '@/components/Icons/Functions/Send'
import MyButton from '@/components/MyButton'
import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { chatAgent } from '@/agents'
import { LAUNDRY_FORM_MARKER } from '@/agents/tools/laundry'
import { notifyUnreadMessage } from '@/utils/notification'

type ChatProps = {
  onClose?: () => void
  isMobile?: boolean
}

const Chat = ({ onClose, isMobile = false }: ChatProps) => {
  const { translate, lang } = useLanguage()
  const {
    isHasHydrated,
    isOpen,
    incrementUnread,
    setHistory,
    setSending,
    resetUnread,
    messages,
    inputValue,
    isSending,
    history,
    setInputValue,
    addMessage,
    removeMessage,
    clearChat,
  } = useChat()

  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Laundry form state
  const [showLaundryForm, setShowLaundryForm] = useState(false)
  const [laundryFormData, setLaundryFormData] = useState<LaundryFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0]?.detail || '',
    serviceType: 'quan-ao',
    weight: '',
  })
  const [laundryFormMessageId, setLaundryFormMessageId] = useState<number | null>(null)

  // Mark as read when chat opens
  useEffect(() => {
    resetUnread()
  }, [resetUnread])

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && isHasHydrated) {
      addMessage({
        id: 1,
        text: translate('chat.welcome'),
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isQuickOptions: true,
      })
    }
  }, [messages.length, addMessage, isHasHydrated])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 350)

    return () => clearTimeout(timer)
  }, [scrollToBottom])

  // Calculate estimated price
  const calculateEstimatedPrice = useCallback(() => {
    const weight = parseFloat(laundryFormData.weight)

    if (isNaN(weight) || weight <= 0) return 0
    const pricePerKg = LAUNDRY_PRICES[laundryFormData.serviceType] || 25000

    return Math.round(pricePerKg * weight)
  }, [laundryFormData.weight, laundryFormData.serviceType])

  const estimatedPrice = calculateEstimatedPrice()

  // Laundry handlers
  const handleLaundryFormChange = useCallback((field: string, value: string) => {
    setLaundryFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmitLaundry = useCallback(() => {
    if (!laundryFormData.name.trim() || !laundryFormData.phone.trim() || !laundryFormData.address.trim() || !laundryFormData.weight.trim()) {
      return
    }

    // Remove the laundry form placeholder message if it exists
    if (laundryFormMessageId) {
      removeMessage(laundryFormMessageId)
      setLaundryFormMessageId(null)
    }

    const orderMessage =
      `Đặt dịch vụ giặt đồ:\n\n` +
      `• Họ tên: ${laundryFormData.name}\n` +
      `• SĐT: ${laundryFormData.phone}\n` +
      `• Địa chỉ: ${laundryFormData.address}\n` +
      `• Loại: ${LAUNDRY_SERVICE_NAMES[laundryFormData.serviceType]}\n` +
      `• Khối lượng: ${laundryFormData.weight} kg\n` +
      `• Giá ước tính: ${estimatedPrice.toLocaleString()}đ`

    // Add order message
    addMessage({
      id: Date.now(),
      text: orderMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    // Hide form after submit
    setShowLaundryForm(false)

    // Reset form data
    setLaundryFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.addresses?.[0]?.detail || '',
      serviceType: 'quan-ao',
      weight: '',
    })

    // Show confirmation
    setTimeout(() => {
      addMessage({
        id: Date.now() + 1,
        text: 'Bạn đã đặt thành công, chúng tôi sẽ liên hệ bạn',
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }, 500)
  }, [laundryFormData, estimatedPrice, user, translate, addMessage, removeMessage, laundryFormMessageId])

  const handleCancelLaundry = useCallback(() => {
    // Remove the laundry form message if it exists
    if (laundryFormMessageId) {
      removeMessage(laundryFormMessageId)
    }
    setShowLaundryForm(false)
    setLaundryFormMessageId(null)
    setLaundryFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.addresses?.[0]?.detail || '',
      serviceType: 'quan-ao',
      weight: '',
    })
  }, [user, laundryFormMessageId, removeMessage])

  // Handle laundry option click
  const handleLaundryOptionClick = useCallback(() => {
    // Add a message for the laundry form
    const formMessageId = Date.now()

    addMessage({
      id: formMessageId,
      text: 'Đặt dịch vụ giặt đồ',
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setLaundryFormMessageId(formMessageId)
    setShowLaundryForm(true)
    setInputValue('')
  }, [addMessage, setInputValue])

  // Chat handlers
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue

    if (!textToSend.trim() || isSending) return

    if (!messageText) setInputValue('')

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    addMessage(userMessage)
    setSending(true)

    try {
      const { text, history: newHistory } = await chatAgent.chat(textToSend, history, { locale: lang })

      if (text) {
        // Agent requested the laundry order form -> strip the marker and show it
        const wantsLaundryForm = text.includes(LAUNDRY_FORM_MARKER)
        const cleanText = wantsLaundryForm ? text.replace(LAUNDRY_FORM_MARKER, '').trim() : text

        if (cleanText) {
          addMessage({
            id: Date.now(),
            text: cleanText,
            isUser: false,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })
        }

        if (wantsLaundryForm) {
          setShowLaundryForm(true)
        }

        // Count as unread when the user is not viewing the chat
        if (!isOpen) {
          incrementUnread()
          notifyUnreadMessage()
        }
        setHistory(newHistory)
      } else {
        throw new Error('Empty agent reply')
      }
    } catch {
      addMessage({
        id: Date.now(),
        text: translate('chat.error'),
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      if (!isOpen) {
        incrementUnread()
        notifyUnreadMessage()
      }
    } finally {
      setSending(false)
    }
  }

  const handleQuickOptionClick = (option: string) => {
    // Don't clear chat for quick options
    // Just send the option text to agent
    setTimeout(() => handleSend(option), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    clearChat()
    setInputValue('')
  }

  // Render chat header
  const renderChatHeader = () => (
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
  )

  // Render chat body (messages + input)
  const renderChatBody = () => (
    <div className='flex flex-col flex-1 overflow-hidden'>
      <ChatMessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        isSending={isSending}
        onQuickOptionClick={handleQuickOptionClick}
        onLaundryClick={handleLaundryOptionClick}
        showLaundryForm={showLaundryForm}
        laundryFormData={laundryFormData}
        estimatedPrice={estimatedPrice}
        onLaundryFormChange={handleLaundryFormChange}
        onSubmitLaundry={handleSubmitLaundry}
        onCancelLaundry={handleCancelLaundry}
      />

      <div className='p-3 border-t border-border'>
        <div className='flex gap-2'>
          <textarea
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            placeholder={translate('chat.inputPlaceholder')}
            className='flex-1 px-3 py-2 text-sm border border-border rounded-2xl focus:outline-none resize-none'
          />
          <MyButton onClick={() => handleSend()} disabled={!inputValue.trim() || isSending} className='shrink-0 self-stretch rounded-2xl px-4'>
            {isSending ? (
              <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
            ) : (
              <SendIcon className='w-4 h-4' />
            )}
          </MyButton>
        </div>
        <div className='text-xs text-gray-500 text-right mt-1'>{inputValue.length}/200</div>
      </div>
    </div>
  )

  // Desktop: render as popup with header
  if (!isMobile) {
    return (
      <div className='fixed bottom-24 right-6 z-50 flex flex-col h-[78dvh] max-h-[calc(100dvh-7rem)] w-[500px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl'>
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
            <button onClick={onClose} aria-label='Close' className='cursor-pointer rounded-full p-2 bg-white/15 hover:bg-white/25 transition-colors'>
              <CloseIcon className='w-5 h-5' />
            </button>
          </div>
        </div>

        {renderChatBody()}
      </div>
    )
  }

  // Mobile: render as content only (for drawer)
  return (
    <div className='flex flex-col h-full'>
      {renderChatHeader()}
      {renderChatBody()}
    </div>
  )
}

export default Chat
