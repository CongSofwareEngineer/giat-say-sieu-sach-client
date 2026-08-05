import { chat } from '@/zustand/chat'

const useChat = () => {
  return chat((state) => state)
}

export default useChat
