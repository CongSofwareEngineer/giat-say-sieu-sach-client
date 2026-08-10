'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import ChatMarkdown from '@/components/ChatMarkdown'
import { TrashIcon } from '@/components/Icons/Trash'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import SendIcon from '@/components/Icons/Functions/Send'
import ContactFloatingButtons from '@/components/ContactFloatingButtons'
import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import MyButton from '@/components/MyButton'
import { chatAgent } from '@/agents'
import { chat, type ChatMessage } from '@/zustand/chat'
import { PATH_LANGUAGE, TYPE_LANGUAGE } from '@/zustand/language'
import { notifyUnreadMessage } from '@/utils/notification'

type TranslateFn = (
  key?: PATH_LANGUAGE<TYPE_LANGUAGE>,
  variables?: Record<string, string | number | React.ReactNode | ((value: string | number) => React.ReactNode)>,
  defaultMessage?: string
) => any

type LaundryFormData = {
  name: string
  phone: string
  address: string
  serviceType: string
  weight: string
}

// Pricing configuration for laundry services
const LAUNDRY_PRICES: Record<string, number> = {
  'quan-ao': 25000, // Giặt thường 25k/kg
  'chan-mem': 80000, // Giặt chăn ga 80k/bộ
  'vest-ao-dai': 80000, // Giặt khô 80k/kg
  'giat-nhanh': 40000, // Giặt nhanh 40k/kg
  'giat-ui': 50000, // Giặt + ủi 50k/kg
}

const LAUNDRY_SERVICE_NAMES: Record<string, string> = {
  'quan-ao': 'Quần áo thường',
  'chan-mem': 'Chăn mền',
  'vest-ao-dai': 'Vest/Áo dài (giặt khô)',
  'giat-nhanh': 'Giặt nhanh',
  'giat-ui': 'Giặt + Ủi',
}

const FloatingChat = () => {
  const { translate, lang } = useLanguage()
  const { open: openDrawer, close: closeDrawer, isMobile } = useModalDrawer({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)
  const isOpenRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, inputValue, isSending, unreadCount, setInputValue, addMessage } = useChat()

  // Laundry form state
  const { user } = useUser()
  const [showLaundryForm, setShowLaundryForm] = useState(false)
  const [laundryFormData, setLaundryFormData] = useState<LaundryFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0]?.detail || '',
    serviceType: 'quan-ao',
    weight: '',
  })

  // Keep an up-to-date open flag so async replies know if the chat was closed mid-request
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (chat.getState().messages.length === 0) {
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

  // Calculate estimated price
  const calculateEstimatedPrice = useCallback(() => {
    const weight = parseFloat(laundryFormData.weight)

    if (isNaN(weight) || weight <= 0) return 0

    const pricePerKg = LAUNDRY_PRICES[laundryFormData.serviceType] || 25000

    return Math.round(pricePerKg * weight)
  }, [laundryFormData.weight, laundryFormData.serviceType])

  const estimatedPrice = calculateEstimatedPrice()

  // Handle laundry option click
  const handleLaundryOptionClick = useCallback(() => {
    setShowLaundryForm(true)
    setInputValue('')
    addMessage({
      id: messages.length + 1,
      text: translate('chat.laundryForm.title') || 'Đặt dịch vụ giặt đồ',
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }, [messages.length, translate, addMessage, setInputValue])

  // Handle laundry form input change
  const handleLaundryFormChange = useCallback((field: string, value: string) => {
    setLaundryFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle submit laundry order
  const handleSubmitLaundry = useCallback(() => {
    if (!laundryFormData.name.trim() || !laundryFormData.phone.trim() || !laundryFormData.address.trim() || !laundryFormData.weight.trim()) {
      return
    }

    const orderMessage =
      `Đặt dịch vụ giặt đồ:\n\n` +
      `• Họ tên: ${laundryFormData.name}\n` +
      `• SĐT: ${laundryFormData.phone}\n` +
      `• Địa chỉ: ${laundryFormData.address}\n` +
      `• Loại: ${LAUNDRY_SERVICE_NAMES[laundryFormData.serviceType]}\n` +
      `• Khối lượng: ${laundryFormData.weight} kg\n` +
      `• Giá ước tính: ${estimatedPrice.toLocaleString()}đ`

    // Add user message to chat
    addMessage({
      id: messages.length + 1,
      text: orderMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    // Reset form
    setShowLaundryForm(false)
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
        id: messages.length + 2,
        text: translate('chat.laundryForm.orderConfirmed') || 'Cảm ơn bạn đã đặt dịch vụ! Chúng tôi sẽ liên hệ xác nhận sớm nhất.',
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }, 500)
  }, [laundryFormData, estimatedPrice, user, messages.length, translate, addMessage])

  // Handle cancel laundry form
  const handleCancelLaundry = useCallback(() => {
    setShowLaundryForm(false)
    setLaundryFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.addresses?.[0]?.detail || '',
      serviceType: 'quan-ao',
      weight: '',
    })
  }, [user])

  const handleSend = async (messageText?: string) => {
    const { messages, inputValue, isSending, setInputValue, setSending, addMessage, history } = chat.getState()

    const textToSend = messageText || inputValue

    if (!textToSend.trim() || isSending) return

    if (!messageText) {
      setInputValue('')
    }

    const userMessage = {
      id: messages.length + 1,
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
        addMessage({
          id: messages.length + 2,
          text,
          isUser: false,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
        // Count as unread when the user is not viewing the chat
        if (!isOpenRef.current) {
          chat.getState().incrementUnread()
          notifyUnreadMessage()
        }
        chat.getState().setHistory(newHistory)
      } else {
        throw new Error('Empty agent reply')
      }
    } catch {
      addMessage({
        id: messages.length + 2,
        text: translate('chat.error'),
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      if (!isOpenRef.current) {
        chat.getState().incrementUnread()
        notifyUnreadMessage()
      }
    } finally {
      setSending(false)
    }
  }

  const handleQuickOptionClick = (option: string) => {
    chat.getState().clearChat()
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
    setTimeout(() => handleSend(option), 0)
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
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isQuickOptions: true,
    })
  }

  const openChat = () => {
    setIsOpen(true)
    // Clear the unread badge once the user opens the chat
    chat.getState().resetUnread()

    if (isMobile) {
      openDrawer({
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
            onQuickOptionClick={handleQuickOptionClick}
            onLaundryClick={handleLaundryOptionClick}
            showLaundryForm={showLaundryForm}
            laundryFormData={laundryFormData}
            estimatedPrice={estimatedPrice}
            onLaundryFormChange={handleLaundryFormChange}
            onSubmitLaundry={handleSubmitLaundry}
            onCancelLaundry={handleCancelLaundry}
            messages={messages}
            inputValue={inputValue}
            isSending={isSending}
            setInputValue={setInputValue}
          />
        ),
      })
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    if (isMobile) closeDrawer()
  }

  // Desktop chat popup
  const renderDesktopChat = () => {
    if (!isOpen || isMobile) return null

    return (
      <div className='fixed bottom-24 right-6 z-50 flex h-[78dvh] max-h-[calc(100dvh-7rem)] w-[500px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl'>
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

        <ChatMessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          isSending={isSending}
          translate={translate}
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
              placeholder={translate('chat.inputPlaceholder')}
              className='flex-1 px-3 py-2 text-sm border border-border rounded-2xl focus:outline-none resize-none placeholder:text-gray-500'
            />
            <MyButton onClick={() => handleSend()} disabled={!inputValue.trim() || isSending} className='shrink-0 self-stretch rounded-2xl px-4'>
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

      <ContactFloatingButtons
        hidden={isOpen}
        badge={unreadCount}
        extraItems={[
          {
            key: 'chat',
            label: translate('chat.title'),
            icon: <ChatBubbleIcon className='h-5 w-5' />,
            className: 'bg-gradient-to-br from-primary to-secondary',
            badge: unreadCount,
            onClick: openChat,
          },
        ]}
      />
    </>
  )
}

// Quick options component for the welcome message
const QuickOptions = ({
  translate,
  onOptionClick,
  onLaundryClick,
}: {
  translate: TranslateFn
  onOptionClick: (option: string) => void
  onLaundryClick?: () => void
}) => {
  const options = [
    { key: 'priceList', label: translate('chat.quickOptions.priceList') },
    { key: 'address', label: translate('chat.quickOptions.address') },
    { key: 'promotions', label: translate('chat.quickOptions.promotions') },
    { key: 'orderInfo', label: translate('chat.quickOptions.orderInfo') },
    { key: 'laundry', label: translate('chat.quickOptions.laundry') },
  ]

  return (
    <div className='flex flex-wrap gap-2 mt-2'>
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => {
            if (option.key === 'laundry' && onLaundryClick) {
              onLaundryClick()
            } else {
              onOptionClick(option.label)
            }
          }}
          className='px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap'
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// Laundry Form component
const LaundryForm = ({
  formData,
  estimatedPrice,
  onChange,
  onSubmit,
  onCancel,
  translate,
}: {
  formData: LaundryFormData
  estimatedPrice: number
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
  translate: TranslateFn
}) => {
  const serviceOptions = [
    { key: 'quan-ao', label: translate('chat.laundryForm.serviceOptions.clothes') || 'Quần áo thường' },
    { key: 'chan-mem', label: translate('chat.laundryForm.serviceOptions.bedding') || 'Chăn mền' },
    { key: 'vest-ao-dai', label: translate('chat.laundryForm.serviceOptions.dryClean') || 'Vest/Áo dài (giặt khô)' },
    { key: 'giat-nhanh', label: translate('chat.laundryForm.serviceOptions.express') || 'Giặt nhanh' },
    { key: 'giat-ui', label: translate('chat.laundryForm.serviceOptions.washIron') || 'Giặt + Ủi' },
  ]

  const isFormValid =
    formData.name.trim() && formData.phone.trim() && formData.address.trim() && formData.weight.trim() && parseFloat(formData.weight) > 0

  return (
    <div className='bg-white border border-border w-full rounded-xl p-4 space-y-4'>
      <h3 className='font-semibold text-primary'>{translate('chat.laundryForm.title') || 'Đặt dịch vụ giặt đồ'}</h3>

      <div className='space-y-3'>
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.name') || 'Họ tên'}</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={translate('chat.laundryForm.namePlaceholder') || 'Nhập họ tên'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.phone') || 'Số điện thoại'}</label>
          <input
            type='tel'
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={translate('chat.laundryForm.phonePlaceholder') || 'Nhập số điện thoại'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.address') || 'Địa chỉ'}</label>
          <input
            type='text'
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder={translate('chat.laundryForm.addressPlaceholder') || 'Nhập địa chỉ'}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.serviceType') || 'Loại dịch vụ'}</label>
          <select
            value={formData.serviceType}
            onChange={(e) => onChange('serviceType', e.target.value)}
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white'
          >
            {serviceOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('chat.laundryForm.weight') || 'Khối lượng (kg)'}</label>
          <input
            type='number'
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
            placeholder={translate('chat.laundryForm.weightPlaceholder') || 'Nhập số kg'}
            min='1'
            step='0.1'
            className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        {/* Estimated price display */}
        {estimatedPrice > 0 && (
          <div className='p-3 bg-primary/5 border border-primary/20 rounded-lg'>
            <p className='text-sm text-primary font-medium'>
              {translate('chat.laundryForm.estimatedPrice') || 'Giá ước tính'}:
              <span className='font-bold text-primary ml-1'>{estimatedPrice.toLocaleString()}đ</span>
            </p>
          </div>
        )}

        <div className='flex gap-2 pt-2'>
          <MyButton onClick={onCancel} variant='outline' className='flex-1 py-2 text-sm'>
            {translate('common.cancel') || 'Hủy'}
          </MyButton>
          <MyButton onClick={onSubmit} disabled={!isFormValid} className='flex-1 py-2 text-sm'>
            {translate('chat.laundryForm.submit') || 'Đặt lịch'}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

// Shared message list with typing indicator for desktop popup and mobile drawer
const ChatMessageList = ({
  messages,
  messagesEndRef,
  isSending,
  translate,
  onQuickOptionClick,
  onLaundryClick,
  showLaundryForm,
  laundryFormData,
  estimatedPrice,
  onLaundryFormChange,
  onSubmitLaundry,
  onCancelLaundry,
}: {
  messages: ChatMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isSending: boolean
  translate: TranslateFn
  onQuickOptionClick: (option: string) => void
  onLaundryClick?: () => void
  showLaundryForm?: boolean
  laundryFormData?: LaundryFormData
  estimatedPrice?: number
  onLaundryFormChange?: (field: string, value: string) => void
  onSubmitLaundry?: () => void
  onCancelLaundry?: () => void
}) => {
  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-3'>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isUser ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-text rounded-bl-md'}`}
          >
            {msg.isUser ? (
              <p className='whitespace-pre-wrap'>{msg.text}</p>
            ) : msg.isQuickOptions ? (
              <>
                <p className='whitespace-pre-wrap'>{msg.text}</p>
                <QuickOptions translate={translate} onOptionClick={onQuickOptionClick} onLaundryClick={onLaundryClick} />
              </>
            ) : (
              <ChatMarkdown>{msg.text}</ChatMarkdown>
            )}
            <p className={`text-[10px] mt-1 ${msg.isUser ? 'text-white/90' : 'text-gray-500'}`}>{msg.time}</p>
          </div>
        </div>
      ))}

      {/* Laundry Form Display */}
      {showLaundryForm && laundryFormData && onLaundryFormChange && onSubmitLaundry && onCancelLaundry && (
        <div className='flex justify-start'>
          <div className='w-full'>
            <LaundryForm
              formData={laundryFormData}
              estimatedPrice={estimatedPrice || 0}
              onChange={onLaundryFormChange}
              onSubmit={onSubmitLaundry}
              onCancel={onCancelLaundry}
              translate={translate}
            />
          </div>
        </div>
      )}

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
  onQuickOptionClick,
  onLaundryClick,
  showLaundryForm,
  laundryFormData,
  estimatedPrice,
  onLaundryFormChange,
  onSubmitLaundry,
  onCancelLaundry,
  messages,
  inputValue,
  isSending,
  setInputValue,
}: {
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleClearChat: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  translate: TranslateFn
  onQuickOptionClick: (option: string) => void
  onLaundryClick?: () => void
  showLaundryForm?: boolean
  laundryFormData?: LaundryFormData
  estimatedPrice?: number
  onLaundryFormChange?: (field: string, value: string) => void
  onSubmitLaundry?: () => void
  onCancelLaundry?: () => void
  messages: ChatMessage[]
  inputValue: string
  isSending: boolean
  setInputValue: (value: string) => void
}) => {
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

      <ChatMessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        isSending={isSending}
        translate={translate}
        onQuickOptionClick={onQuickOptionClick}
        onLaundryClick={onLaundryClick}
        showLaundryForm={showLaundryForm}
        laundryFormData={laundryFormData}
        estimatedPrice={estimatedPrice}
        onLaundryFormChange={onLaundryFormChange}
        onSubmitLaundry={onSubmitLaundry}
        onCancelLaundry={onCancelLaundry}
      />

      <div className='p-3 border-t border-border'>
        <div className='flex gap-2'>
          <textarea
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
      </div>
    </div>
  )
}

export default FloatingChat
