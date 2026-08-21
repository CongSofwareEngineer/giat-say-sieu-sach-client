'use client'

import MyButton from '@/components/MyButton'
import useModalDrawer from '@/hooks/useModalDrawer'
import useLanguage from '@/hooks/useLanguage'

type AdminDeleteConfirmProps = {
  title?: string
  message?: string
  itemName?: string
  onConfirm: () => void | Promise<void>
  isDeleting?: boolean
}

const AdminDeleteConfirm = ({ title: _title, message, itemName, onConfirm, isDeleting }: AdminDeleteConfirmProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()

  const displayMessage =
    message ||
    (itemName
      ? `${translate('common.confirmDelete', {}, 'Bạn có chắc chắn muốn xóa')} "${itemName}"?`
      : translate('common.confirmDeleteDefault', {}, 'Bạn có chắc chắn muốn xóa mục này?'))

  return (
    <div className='w-full'>
      <p className='mb-6 text-sm text-gray-600'>{displayMessage}</p>
      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton
          variant='error'
          loading={isDeleting}
          onClick={async () => {
            await onConfirm()
            close()
          }}
        >
          {translate('common.delete')}
        </MyButton>
      </div>
    </div>
  )
}

export default AdminDeleteConfirm
