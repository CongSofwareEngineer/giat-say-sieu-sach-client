import { drawer } from '@/zustand/drawer'

const useDrawer = () => {
  return drawer((state) => state)
}

export default useDrawer
