import { toast as toastZustand, Toast } from '@/zustand/toast'

export const toast = (payload: Omit<Toast, 'id'>) => {
  toastZustand.getState().addToast(payload)
}
