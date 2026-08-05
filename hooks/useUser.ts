import { user } from '@/zustand/user'

const useUser = () => {
  return user((state) => state)
}

export default useUser
