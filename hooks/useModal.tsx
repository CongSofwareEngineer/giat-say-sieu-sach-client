import { modal } from '@/zustand/modal'

const useModal = () => {
  return modal((state) => state)
}

export default useModal
