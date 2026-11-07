import BaseAPI from '@/config/baseApi'
import { CHAT_MESSAGE_TYPE } from '@/constants/tools'

export type SavedChatMessage = {
  indexChat: number
  type: CHAT_MESSAGE_TYPE
  createdAt: string
}

// Chat history kept on the backend per device, used to block users who send without waiting for replies
class ChatMessageApi extends BaseAPI {
  // Throws HttpError 429 when the user is already ahead of the bot by the allowed limit
  async saveMessage(deviceId: string, type: CHAT_MESSAGE_TYPE): Promise<SavedChatMessage> {
    const response = await this.post<{ data: SavedChatMessage }>('', { deviceId, type }, { isUseAuth: false })

    return response.data
  }

  async clearMessages(deviceId: string): Promise<void> {
    await this.delete<{ data: { deletedCount: number } }>(`/${deviceId}`, { isUseAuth: false })
  }
}

const ChatMessageService = new ChatMessageApi('chat-messages')

export default ChatMessageService
