'use client'

import { useState } from 'react'

import useModal from '@/hooks/useModal'

function DemoContent() {
  const [count, setCount] = useState(0)
  const { close } = useModal()

  return (
    <div className='flex flex-col gap-4'>
      <p>Count: {count}</p>
      <button className='btn btn-primary' onClick={() => setCount(count + 1)}>
        Tăng count
      </button>
      <button className='btn' onClick={() => close()}>
        Đóng
      </button>
    </div>
  )
}

function ConfirmContent() {
  const { close, open } = useModal()

  return (
    <div className='flex flex-col gap-4'>
      <p>Bạn có chắc chắn muốn xóa?</p>
      <div className='flex gap-2 justify-end'>
        <button className='btn btn-ghost' onClick={() => close()}>
          Hủy
        </button>
        <button
          className='btn btn-error'
          onClick={() => {
            close()
            open({
              title: 'Thành công',
              children: <p>Đã xóa thành công!</p>,
              placement: 'center',
            })
          }}
        >
          Xóa
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { open, closeAll } = useModal()

  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8'>
      <main className='flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-16'>
        <h1 className='text-3xl font-bold'>Modal Demo</h1>

        <div className='flex flex-col gap-4 w-full max-w-md'>
          <button
            className='btn btn-primary'
            onClick={() =>
              open({
                title: 'Modal cơ bản',
                children: <DemoContent />,
                callBackAfter: () => {},
              })
            }
          >
            1. Modal cơ bản
          </button>

          <button
            className='btn btn-secondary'
            onClick={() =>
              open({
                title: 'Không có nút close',
                children: <p>Chỉ đóng được bằng backdrop</p>,
                showBtnClose: false,
              })
            }
          >
            2. Không có nút close
          </button>

          <button
            className='btn btn-accent'
            onClick={() =>
              open({
                title: 'Không close bằng backdrop',
                children: <p>Phải bấm nút close để đóng</p>,
                overClickClose: false,
              })
            }
          >
            3. Không close bằng backdrop
          </button>

          <button
            className='btn btn-info'
            onClick={() =>
              open({
                title: 'Stack modal 1',
                children: (
                  <button
                    className='btn btn-primary'
                    onClick={() =>
                      open({
                        title: 'Stack modal 2',
                        children: <p>Modal này chồng lên modal 1</p>,
                      })
                    }
                  >
                    Mở modal mới
                  </button>
                ),
              })
            }
          >
            4. Stack modal
          </button>

          <button
            className='btn btn-warning'
            onClick={() =>
              open({
                title: 'Modal cũ',
                children: (
                  <button
                    className='btn btn-primary'
                    onClick={() =>
                      open({
                        addModal: false,
                        title: 'Modal mới (replace)',
                        children: <p>Đã thay thế modal cũ</p>,
                      })
                    }
                  >
                    Thay thế modal này
                  </button>
                ),
              })
            }
          >
            5. Replace modal
          </button>

          <button
            className='btn btn-error'
            onClick={() =>
              open({
                title: 'Xác nhận xóa',
                children: <ConfirmContent />,
                placement: 'center',
              })
            }
          >
            6. Confirm dialog
          </button>

          <button
            className='btn btn-outline'
            onClick={() =>
              open({
                title: 'Modal top-left',
                children: <p>Vị trí top-left</p>,
                placement: 'top-left',
              })
            }
          >
            7. Placement top-left
          </button>

          <button
            className='btn btn-outline'
            onClick={() =>
              open({
                title: 'Modal bottom-right',
                children: <p>Vị trí bottom-right</p>,
                placement: 'bottom-right',
              })
            }
          >
            8. Placement bottom-right
          </button>

          <button className='btn btn-ghost' onClick={closeAll}>
            Đóng tất cả modal
          </button>
        </div>
      </main>
    </div>
  )
}
