'use client'

import type { ChatMessage } from '@/zustand/chat'
import type { AddressItem } from '@/services/address/type'
import type { PricingPlan } from '@/services/pricing'
import type { OrderPricing } from '@/utils/orderPricing'

import { useState } from 'react'

import LaundryForm from './LaundryForm'
import OrderPhoneForm from './OrderPhoneForm'
import QuickOptions from './QuickOptions'
import TypingIndicator from './TypingIndicator'
import { type LaundryFormData } from './types'

import ChatMarkdown from '@/components/ChatMarkdown'
import { CheckIcon } from '@/components/Icons/Check'
import { CopyIcon } from '@/components/Icons/Functions/Copy'
import useLanguage from '@/hooks/useLanguage'
import { COPY_FEEDBACK_DURATION } from '@/constants/app'
import { copyToClipboard } from '@/utils/functions'

type ChatMessageListProps = {
  messages: ChatMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isSending: boolean
  onQuickOptionClick: (option: string) => void
  onLaundryClick?: () => void
  showLaundryForm?: boolean
  laundryFormData?: LaundryFormData
  addresses?: AddressItem[]
  plans?: PricingPlan[]
  pricing?: OrderPricing
  pointsBalance?: number
  usePoints?: boolean
  onToggleUsePoints?: (usePoints: boolean) => void
  onLaundryFormChange?: (field: string, value: string) => void
  onSubmitLaundry?: () => void
  onCancelLaundry?: () => void
  isBooking?: boolean
  showOrderPhoneForm?: boolean
  isLookingUpOrders?: boolean
  onSubmitOrderPhone?: (phone: string) => void
  onCancelOrderPhone?: () => void
}

const ChatMessageList = ({
  messages,
  messagesEndRef,
  isSending,
  onQuickOptionClick,
  onLaundryClick,
  showLaundryForm,
  laundryFormData,
  addresses,
  plans,
  pricing,
  pointsBalance,
  usePoints,
  onToggleUsePoints,
  onLaundryFormChange,
  onSubmitLaundry,
  onCancelLaundry,
  isBooking,
  showOrderPhoneForm,
  isLookingUpOrders,
  onSubmitOrderPhone,
  onCancelOrderPhone,
}: ChatMessageListProps) => {
  const { translate } = useLanguage()
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)

  // Sort messages by id to ensure chronological order
  const sortedMessages = [...messages].sort((a, b) => a.id - b.id)

  const handleCopyOrderCode = async (msg: ChatMessage) => {
    if (!msg.orderCode) return

    await copyToClipboard(msg.orderCode)
    setCopiedMessageId(msg.id)
    setTimeout(() => setCopiedMessageId((current) => (current === msg.id ? null : current)), COPY_FEEDBACK_DURATION)
  }

  return (
    <div className='flex-1  px-5 overflow-y-auto py-4 space-y-3'>
      {sortedMessages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isUser ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-text rounded-bl-md'}`}
          >
            {msg.isUser ? (
              <p className='whitespace-pre-wrap'>{msg.text}</p>
            ) : msg.isQuickOptions ? (
              <>
                <p className='whitespace-pre-wrap'>{msg.text}</p>
                <QuickOptions onOptionClick={onQuickOptionClick} onLaundryClick={onLaundryClick} />
              </>
            ) : (
              <ChatMarkdown>{msg.text}</ChatMarkdown>
            )}
            {msg.orderCode && (
              <button
                type='button'
                onClick={() => handleCopyOrderCode(msg)}
                className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/5'
              >
                {copiedMessageId === msg.id ? <CheckIcon className='size-3.5' strokeWidth={2.5} /> : <CopyIcon className='size-3.5' />}
                {copiedMessageId === msg.id ? translate('common.copied') : translate('booking.success.copyCode')}
              </button>
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
              addresses={addresses ?? []}
              plans={plans ?? []}
              pricing={pricing ?? { totalAmount: 0, weightDiscount: 0, pointsUsed: 0, pointsDiscount: 0, finalAmount: 0 }}
              pointsBalance={pointsBalance}
              usePoints={usePoints}
              onToggleUsePoints={onToggleUsePoints}
              onChange={onLaundryFormChange}
              onSubmit={onSubmitLaundry}
              onCancel={onCancelLaundry}
              isSubmitting={isBooking}
            />
          </div>
        </div>
      )}

      {/* Guest phone input for the order lookup */}
      {showOrderPhoneForm && onSubmitOrderPhone && onCancelOrderPhone && (
        <div className='flex justify-start'>
          <div className='w-full'>
            <OrderPhoneForm isSubmitting={isLookingUpOrders} onSubmit={onSubmitOrderPhone} onCancel={onCancelOrderPhone} />
          </div>
        </div>
      )}

      {isSending && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessageList
