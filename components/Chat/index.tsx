'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import ChatMessageList from './ChatMessageList'
import { createTextSmoother, getVisibleStreamText } from './textStream'

import CancelOrderConfirm from '@/components/CancelOrderConfirm'
import { TrashIcon } from '@/components/Icons/Trash'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import SendIcon from '@/components/Icons/Functions/Send'
import MyButton from '@/components/MyButton'
import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import useLaundryBooking from '@/hooks/useLaundryBooking'
import { chatAgent } from '@/agents'
import { LAUNDRY_FORM_MARKER } from '@/agents/tools/laundry'
import { formatPickupTime, getBookingErrorMessage } from '@/agents/tools/booking'
import { notifyUnreadMessage } from '@/utils/notification'
import { formatAddress } from '@/services/address'
import { chat } from '@/zustand/chat'
import { chatStream } from '@/zustand/chatStream'
import OrderService, { getOrderCode } from '@/services/order'
import { getMyOrders, ORDER_PHONE_FORM_MARKER, PendingCancelOrder, takePendingCancelOrder } from '@/agents/tools/myOrders'
import ChatMessageService from '@/services/chatMessage'
import { getChatDeviceId } from '@/utils/chatDevice'
import { HttpError } from '@/config/baseApi'
import { BOOKING_SOURCE, HTTP_STATUS } from '@/constants/app'
import { CHAT_MESSAGE_TYPE, CHAT_SCROLL_PIN_THRESHOLD } from '@/constants/tools'
import { QUERY_KEYS } from '@/constants/reactQuery'
import { toast } from '@/utils/toast'

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
  const queryClient = useQueryClient()
  const { open: openModal, close: closeModal } = useModalDrawer()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  // Follow new text unless the user scrolled up to read older messages
  const isPinnedRef = useRef(true)
  const lastScrollTopRef = useRef(0)

  // Laundry form state, shared with the booking page
  const {
    formData: laundryFormData,
    addresses,
    activePlans,
    selectedPlan,
    pricing,
    pointsBalance,
    usePoints,
    setUsePoints,
    isBooking,
    handleChange: handleLaundryFormChange,
    resetForm: resetLaundryForm,
    submitBooking,
  } = useLaundryBooking(BOOKING_SOURCE.CHAT)

  const [showLaundryForm, setShowLaundryForm] = useState(false)
  const [showOrderPhoneForm, setShowOrderPhoneForm] = useState(false)
  const [isLookingUpOrders, setIsLookingUpOrders] = useState(false)
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

  // Only an upward scroll unpins, so the smooth scroll down itself never does
  const handleListScroll = useCallback(() => {
    const list = listRef.current

    if (!list) return

    if (list.scrollHeight - list.scrollTop - list.clientHeight < CHAT_SCROLL_PIN_THRESHOLD) isPinnedRef.current = true
    else if (list.scrollTop < lastScrollTopRef.current) isPinnedRef.current = false

    lastScrollTopRef.current = list.scrollTop
  }, [])

  useEffect(() => {
    // Sending a message always jumps back to the bottom
    if (messages.at(-1)?.isUser) isPinnedRef.current = true
    if (isPinnedRef.current) scrollToBottom()
  }, [messages, scrollToBottom])

  // Instant scroll while streaming: a smooth one restarts on every tick and jitters
  useEffect(
    () =>
      chatStream.subscribe(() => {
        const list = listRef.current

        if (list && isPinnedRef.current) list.scrollTop = list.scrollHeight
      }),
    []
  )

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 350)

    return () => clearTimeout(timer)
  }, [scrollToBottom])

  const handleSubmitLaundry = useCallback(async () => {
    if (!selectedPlan) {
      addMessage({
        id: Date.now(),
        text: translate('chat.serviceNotFound'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })

      return
    }

    try {
      const result = await submitBooking()

      if (!result) return

      const { order, plan, data, price } = result

      // Remove the laundry form placeholder message if it exists
      if (laundryFormMessageId) {
        removeMessage(laundryFormMessageId)
        setLaundryFormMessageId(null)
      }

      // No estimated weight: the amount is only a placeholder until the shipper weighs the laundry
      const hasWeight = parseFloat(data.weight) > 0
      const orderMessage = translate('chat.orderConfirmation', {
        name: data.name,
        phone: data.phone,
        address: formatAddress({ ...data, address: data.address.trim() }),
        service: plan.name,
        weight: hasWeight ? translate('chat.laundryForm.weightValue', { kg: data.weight }) : translate('chat.laundryForm.weightUnknown'),
        pickup: formatPickupTime(data.pickupDate, data.pickupSlot),
        returnTime: formatPickupTime(data.returnDate, data.returnSlot),
        price: hasWeight
          ? translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })
          : translate('chat.laundryForm.priceAfterWeighing'),
      })

      addMessage({
        id: Date.now(),
        text: orderMessage,
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })

      setShowLaundryForm(false)
      resetLaundryForm()

      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          text: translate('chat.orderSuccessWithCode', { code: getOrderCode(order) }),
          orderCode: getOrderCode(order),
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }, 500)
    } catch (error) {
      addMessage({
        id: Date.now(),
        text: getBookingErrorMessage(error, 'chat.error'),
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [selectedPlan, submitBooking, translate, addMessage, removeMessage, laundryFormMessageId, resetLaundryForm])

  const handleCancelLaundry = useCallback(() => {
    if (laundryFormMessageId) {
      removeMessage(laundryFormMessageId)
    }
    setShowLaundryForm(false)
    setLaundryFormMessageId(null)
    resetLaundryForm()
  }, [laundryFormMessageId, removeMessage, resetLaundryForm])

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

  // Guest order lookup: call the get_my_orders tool directly with the phone
  const handleSubmitOrderPhone = useCallback(
    async (phone: string) => {
      setIsLookingUpOrders(true)

      try {
        const result = await getMyOrders(phone, { locale: lang, userId: user?.id })

        addMessage({
          id: Date.now(),
          text: phone,
          isUser: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        addMessage({
          id: Date.now() + 1,
          text: result,
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        // Keep the agent aware of the lookup for follow-up questions
        setHistory([...history, { role: 'user', content: phone }, { role: 'assistant', content: result }])
        setShowOrderPhoneForm(false)
      } catch {
        addMessage({
          id: Date.now(),
          text: translate('chat.error'),
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      } finally {
        setIsLookingUpOrders(false)
      }
    },
    [lang, user?.id, history, addMessage, setHistory, translate]
  )

  const handleCancelOrderPhone = useCallback(() => setShowOrderPhoneForm(false), [])

  // Confirm modal for the order picked by the cancel_my_order tool (only the click cancels it)
  const openCancelOrderConfirm = (order: PendingCancelOrder) => {
    openModal({
      mode: 'modal',
      add: true,
      title: translate('myOrders.cancel.title'),
      children: (
        <CancelOrderConfirm
          orderCode={order.code}
          onClose={closeModal}
          onConfirm={async () => {
            await OrderService.cancelMyOrder(order.id)
            closeModal()
            toast({ message: translate('myOrders.cancel.success'), type: 'default' })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrders] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getMyOrder, order.id] })

            const cancelledText = translate('agent.order.cancel.cancelled', { code: order.code })

            addMessage({
              id: Date.now(),
              text: cancelledText,
              isUser: false,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
            // Keep the agent aware the order is now cancelled
            setHistory([...chat.getState().history, { role: 'assistant', content: cancelledText }])
          }}
        />
      ),
    })
  }

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

    const deviceId = getChatDeviceId()
    let isUserSaved = false

    // The backend blocks a user who is too far ahead of the bot replies (spam)
    try {
      await ChatMessageService.saveMessage(deviceId, CHAT_MESSAGE_TYPE.USER)
      isUserSaved = true
    } catch (error) {
      if (error instanceof HttpError && error.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        removeMessage(userMessage.id)
        if (!messageText) setInputValue(textToSend)
        toast({ message: translate('chat.spamBlocked'), type: 'warning' })
        setSending(false)

        return
      }
      // Backend unreachable: keep the chat working without the limit
    }

    // Drop a cancel request left over from a failed turn
    takePendingCancelOrder()

    const { begin, end, setText, setActiveTool } = chatStream.getState()
    const controller = begin()
    const smoother = createTextSmoother(setText)
    let rawText = ''

    // Stopping also ends the reveal of text that was already received
    controller.signal.addEventListener('abort', () => smoother.stop())

    const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const notifyIfClosed = () => {
      if (!chat.getState().isOpen) {
        incrementUnread()
        notifyUnreadMessage()
      }
    }

    try {
      const { text, history: newHistory } = await chatAgent.chat(
        textToSend,
        history,
        { locale: lang, userId: user?.id },
        {
          signal: controller.signal,
          onText: (delta) => {
            rawText += delta
            smoother.setTarget(getVisibleStreamText(rawText))
          },
          // Text before a tool call is not the answer: go back to the status label
          onToolCall: (toolName) => {
            rawText = ''
            smoother.reset()
            setActiveTool(toolName)
          },
        }
      )
      const cancelOrder = takePendingCancelOrder()

      if (!text) throw new Error('Empty agent reply')

      const wantsLaundryForm = text.includes(LAUNDRY_FORM_MARKER)
      const wantsPhoneForm = text.includes(ORDER_PHONE_FORM_MARKER)
      const cleanText = text.replace(LAUNDRY_FORM_MARKER, '').replace(ORDER_PHONE_FORM_MARKER, '').trim()

      // Finish the reveal first; the final text also covers replies that were never streamed
      smoother.setTarget(cleanText)
      await smoother.drain()
      controller.signal.throwIfAborted()

      if (cleanText) addMessage({ id: Date.now(), text: cleanText, isUser: false, time: getTime() })

      if (wantsLaundryForm) setShowLaundryForm(true)

      if (wantsPhoneForm) setShowOrderPhoneForm(true)

      if (cancelOrder) openCancelOrderConfirm(cancelOrder)

      notifyIfClosed()
      setHistory(newHistory)
    } catch {
      const partialText = smoother.stop().trim()
      const { isDiscarded } = chatStream.getState()

      if (isDiscarded) return

      if (partialText) addMessage({ id: Date.now(), text: partialText, isUser: false, time: getTime() })

      if (controller.signal.aborted) {
        // Stopped by the user: not an error, keep the partial answer as context
        if (partialText) {
          setHistory([...history, { role: 'user', content: textToSend }, { role: 'assistant', content: partialText }])
        }

        return
      }

      addMessage({ id: Date.now() + 1, text: translate('chat.error'), isUser: false, time: getTime() })
      notifyIfClosed()
    } finally {
      end()

      // Every answered turn (also errors and stops) frees the user to send again
      if (isUserSaved && !chatStream.getState().isDiscarded) {
        await ChatMessageService.saveMessage(deviceId, CHAT_MESSAGE_TYPE.BOT).catch(() => undefined)
      }

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
    // A reply still being generated must not reappear after clearing
    chatStream.getState().discard()
    clearChat()
    setInputValue('')
    // Clearing also removes this device's history on the backend (resets the spam limit)
    ChatMessageService.clearMessages(getChatDeviceId()).catch(() => undefined)
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
        listRef={listRef}
        onScroll={handleListScroll}
        isSending={isSending}
        onQuickOptionClick={handleQuickOptionClick}
        onLaundryClick={handleLaundryOptionClick}
        showLaundryForm={showLaundryForm}
        laundryFormData={laundryFormData}
        addresses={addresses}
        plans={activePlans}
        pricing={pricing}
        pointsBalance={pointsBalance}
        usePoints={usePoints}
        onToggleUsePoints={setUsePoints}
        onLaundryFormChange={handleLaundryFormChange}
        onSubmitLaundry={handleSubmitLaundry}
        onCancelLaundry={handleCancelLaundry}
        isBooking={isBooking}
        showOrderPhoneForm={showOrderPhoneForm}
        isLookingUpOrders={isLookingUpOrders}
        onSubmitOrderPhone={handleSubmitOrderPhone}
        onCancelOrderPhone={handleCancelOrderPhone}
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
          {isSending ? (
            <MyButton
              onClick={() => chatStream.getState().stop()}
              aria-label={translate('chat.stop')}
              title={translate('chat.stop')}
              className='shrink-0 self-stretch rounded-2xl px-4'
            >
              <span className='inline-block size-3 rounded-sm bg-white' />
            </MyButton>
          ) : (
            <MyButton onClick={() => handleSend()} disabled={!inputValue.trim()} className='shrink-0 self-stretch rounded-2xl px-4'>
              <SendIcon className='w-4 h-4' />
            </MyButton>
          )}
        </div>
        <div className='text-xs text-gray-500 text-right mt-1'>{inputValue.length}/200</div>
      </div>
    </div>
  )

  if (!isMobile) {
    return (
      <div className='fixed bottom-10 right-6 z-50 flex flex-col h-[85dvh] max-h-[calc(100dvh-7rem)] w-[500px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl'>
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
