import BaseAPI from '@/config/baseApi'
import { CHAT_LIMIT_REASON, CHAT_MESSAGE_TYPE } from '@/constants/tools'

export type SavedChatMessage = {
  type: CHAT_MESSAGE_TYPE
  createdAt: string
}

// Body of the backend 429 when a chat message is over the limit
export type ChatLimitError = {
  reason?: CHAT_LIMIT_REASON
  retryAfterSeconds?: number
}

// Chat messages kept on the backend only to enforce the chat limits (per account when logged in, per device otherwise)
class ChatMessageApi extends BaseAPI {
  // Throws HttpError 429 (data: ChatLimitError) when the user is over the limit
  async saveMessage(deviceId: string, type: CHAT_MESSAGE_TYPE, isLogin: boolean): Promise<SavedChatMessage> {
    const response = await this.post<{ data: SavedChatMessage }>('', { deviceId, type }, { isUseAuth: isLogin })

    return response.data
  }
}

const ChatMessageService = new ChatMessageApi('chat-messages')

export default ChatMessageService
