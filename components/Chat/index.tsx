'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import ChatMessageList from './ChatMessageList'
import { type LaundryFormData } from './types'

import { TrashIcon } from '@/components/Icons/Trash'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import SendIcon from '@/components/Icons/Functions/Send'
import MyButton from '@/components/MyButton'
import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import useGetListAddress from '@/hooks/reactQuery/useGetListAddress'
import { chatAgent } from '@/agents'
import { LAUNDRY_FORM_MARKER } from '@/agents/tools/laundry'
import { notifyUnreadMessage } from '@/utils/notification'
import { formatAddress } from '@/services/address'
import { chat } from '@/zustand/chat'
import PricingService, { PricingPlan } from '@/services/pricing'
import OrderService from '@/services/order'
import AddressService from '@/services/address'
import { QUERY_KEYS } from '@/constants/reactQuery'

type ChatProps = {
  onClose?: () => void
  isMobile?: boolean
  isOpenChatRef?: boolean
}

const Chat = ({ onClose, isMobile = false }: ChatProps) => {
  const { translate, lang } = useLanguage()
  const {
    isHasHydrated,
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
  const { addresses, defaultAddress } = useGetListAddress()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const defaultAddressText = formatAddress(defaultAddress)

  const { data: plans = [] } = useQuery<PricingPlan[]>({
    queryKey: [QUERY_KEYS.getListPrice],
    queryFn: () => PricingService.getPlans(),
    staleTime: 30_000,
  })

  const activePlans = plans.filter((p) => p.isActive)

  const planByKey = useMemo(() => new Map(activePlans.map((p) => [p.id, p])), [activePlans])

  // Laundry form state
  const [showLaundryForm, setShowLaundryForm] = useState(false)
  const [laundryFormData, setLaundryFormData] = useState<LaundryFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    addressId: defaultAddress?.id || '',
    address: defaultAddressText,
    serviceType: activePlans.find((p) => p.name.toLowerCase().includes('thường'))?.id || 'quan-ao',
    weight: '',
  })
  const [laundryFormMessageId, setLaundryFormMessageId] = useState<number | null>(null)

  // Prefill the pickup address once the default address is loaded from the server
  useEffect(() => {
    if (!defaultAddress) return

    setLaundryFormData((prev) => (prev.addressId ? prev : { ...prev, addressId: defaultAddress.id, address: defaultAddressText }))
  }, [defaultAddress, defaultAddressText])

  // Update service type if plans load and current selection is invalid
  useEffect(() => {
    if (activePlans.length === 0) return
    const currentPlan = planByKey.get(laundryFormData.serviceType)

    if (!currentPlan) {
      const fallback = activePlans[0]

      setLaundryFormData((prev) => ({ ...prev, serviceType: fallback.id }))
    }
  }, [activePlans, laundryFormData.serviceType, planByKey])

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
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isUser: false,
        isQuickOptions: true,
      })
    }
  }, [messages.length, addMessage, isHasHydrated, translate])

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
    const plan = planByKey.get(laundryFormData.serviceType)
    const pricePerKg = plan?.price ?? 25000

    return Math.round(pricePerKg * weight)
  }, [laundryFormData.weight, laundryFormData.serviceType, planByKey])

  const estimatedPrice = calculateEstimatedPrice()

  // Laundry handlers
  const handleLaundryFormChange = useCallback((field: string, value: string) => {
    setLaundryFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmitLaundry = useCallback(async () => {
    if (!laundryFormData.name.trim() || !laundryFormData.phone.trim() || !laundryFormData.address.trim() || !laundryFormData.weight.trim()) {
      return
    }

    try {
      let addressId = laundryFormData.addressId

      if (!addressId) {
        const matched = addresses.find((a) => formatAddress(a) === laundryFormData.address)

        if (matched) {
          addressId = matched.id
        } else {
          const newAddr = await AddressService.createAddress({
            label: translate('chat.laundryForm.chatAddress'),
            recipientName: laundryFormData.name,
            phone: laundryFormData.phone,
            address: laundryFormData.address,
            district: '',
            city: '',
          })

          addressId = newAddr.id
        }
      }

      const plan = planByKey.get(laundryFormData.serviceType)

      if (!plan) {
        addMessage({
          id: Date.now(),
          text: translate('chat.serviceNotFound'),
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })

        return
      }

      const weight = parseFloat(laundryFormData.weight)

      await OrderService.createOrder({
        addressId,
        items: [{ categoryId: plan.id, quantity: weight }],
        notes: translate('chat.order.notes', { serviceType: laundryFormData.serviceType }),
      })

      // Remove the laundry form placeholder message if it exists
      if (laundryFormMessageId) {
        removeMessage(laundryFormMessageId)
        setLaundryFormMessageId(null)
      }

      const serviceName = plan.name
      const orderMessage = translate('chat.order.confirmation', {
        name: laundryFormData.name,
        phone: laundryFormData.phone,
        address: laundryFormData.address,
        service: serviceName,
        weight: laundryFormData.weight,
        price: estimatedPrice.toLocaleString(),
      })

      addMessage({
        id: Date.now(),
        text: orderMessage,
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })

      setShowLaundryForm(false)

      setLaundryFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        addressId: defaultAddress?.id || '',
        address: defaultAddressText,
        serviceType: activePlans.find((p) => p.name.toLowerCase().includes('thường'))?.id || 'quan-ao',
        weight: '',
      })

      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          text: translate('chat.order.success'),
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }, 500)
    } catch {
      addMessage({
        id: Date.now(),
        text: translate('chat.error'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [
    laundryFormData,
    estimatedPrice,
    user,
    translate,
    addMessage,
    removeMessage,
    laundryFormMessageId,
    defaultAddressText,
    defaultAddress,
    addresses,
    activePlans,
    planByKey,
  ])

  const handleCancelLaundry = useCallback(() => {
    if (laundryFormMessageId) {
      removeMessage(laundryFormMessageId)
    }
    setShowLaundryForm(false)
    setLaundryFormMessageId(null)
    setLaundryFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      addressId: defaultAddress?.id || '',
      address: defaultAddressText,
      serviceType: activePlans.find((p) => p.name.toLowerCase().includes('thường'))?.id || 'quan-ao',
      weight: '',
    })
  }, [user, laundryFormMessageId, removeMessage, defaultAddressText, defaultAddress, activePlans])

  // Handle laundry option click
  const handleLaundryOptionClick = useCallback(() => {
    const formMessageId = Date.now()

    addMessage({
      id: formMessageId,
      text: translate('chat.laundryForm.title'),
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setLaundryFormMessageId(formMessageId)
    setShowLaundryForm(true)
    setInputValue('')
  }, [addMessage, setInputValue, translate])

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
      const { text, history: newHistory } = await chatAgent.chat(textToSend, history, { locale: lang, userId: user?.id })

      if (text) {
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

        if (!chat.getState().isOpen) {
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
      if (!chat.getState().isOpen) {
        incrementUnread()
        notifyUnreadMessage()
      }
    } finally {
      setSending(false)
    }
  }

  const handleQuickOptionClick = (option: string) => {
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
        addresses={addresses}
        plans={activePlans}
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
            <button
              onClick={onClose}
              aria-label={translate('common.close')}
              className='cursor-pointer rounded-full p-2 bg-white/15 hover:bg-white/25 transition-colors'
            >
              <CloseIcon className='w-5 h-5' />
            </button>
          </div>
        </div>

        {renderChatBody()}
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      {renderChatHeader()}
      {renderChatBody()}
    </div>
  )
}

export default Chat
