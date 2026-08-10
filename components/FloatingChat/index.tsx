'use client'

import { useState } from 'react'

import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import ContactFloatingButtons from '@/components/ContactFloatingButtons'
import useModalDrawer from '@/hooks/useModalDrawer'
import useLanguage from '@/hooks/useLanguage'
import { PATH_LANGUAGE, TYPE_LANGUAGE } from '@/zustand/language'

import Chat from '@/components/Chat'

type TranslateFn = (
  key?: PATH_LANGUAGE<TYPE_LANGUAGE>,
  variables?: Record<string, any>,
  defaultMessage?: string
) => any

const FloatingChat = () => {
  const { translate } = useLanguage()
  const { open: openDrawer, close: closeDrawer, isMobile } = useModalDrawer({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)

  const openChat = () => {
    setIsOpen(true)
    if (isMobile) {
      openDrawer({
        title: translate('chat.title'),
        drawerPlacement: 'bottom',
        classNames: {
          container: 'rounded-t-2xl',
        },
        onClose: () => setIsOpen(false),
        children: <Chat isMobile={true} />,
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
    return <Chat onClose={closeChat} isMobile={false} />
  }

  return (
    <>
      {renderDesktopChat()}
      <ContactFloatingButtons
        hidden={isOpen}
        badge={0}
        extraItems={[
          {
            key: 'chat',
            label: translate('chat.title'),
            icon: <ChatBubbleIcon className='h-5 w-5' />,
            className: 'bg-gradient-to-br from-primary to-secondary',
            badge: 0,
            onClick: openChat,
          },
        ]}
      />
    </>
  )
}

export default FloatingChat
