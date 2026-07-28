'use client'

import { useState } from 'react'

import useModalDrawer from '@/hooks/useModalDrawer'
import MyButton from '@/components/MyButton'

function DemoContent() {
  const [count, setCount] = useState(0)
  const { close } = useModalDrawer()

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

function DrawerContent() {
  const [count, setCount] = useState(0)
  const { close } = useModalDrawer()

  return (
    <div className='flex flex-col gap-4 p-4'>
      <p>Count: {count}</p>
      <button className='btn btn-primary' onClick={() => setCount(count + 1)}>
        Tăng count
      </button>
      <button className='btn' onClick={() => close()}>
        Đóng drawer
      </button>
    </div>
  )
}

function ConfirmContent() {
  const { close, open } = useModalDrawer()

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
              children: <p>Đã xóa thành công!</p>,
              mode: 'modal',
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
  const { open, closeAll } = useModalDrawer()

  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8'>
      <main className='flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-16'>
        <h1 className='text-3xl font-bold'>Modal Demo</h1>

        <div className='flex flex-col gap-4 w-full max-w-md'>
          <MyButton
            onClick={() =>
              open({
                title: 'Modal cơ bản',
                children: <DemoContent />,
                mode: 'modal',
                onClose: () => {},
              })
            }
          >
            1. Modal cơ bản
          </MyButton>

          <MyButton
            variant='primary'
            onClick={() =>
              open({
                title: 'Không có nút close',
                children: <p>Chỉ đóng được bằng backdrop</p>,
                mode: 'modal',
                showBtnClose: false,
              })
            }
          >
            2. Không có nút close
          </MyButton>

          <MyButton
            variant='warning'
            onClick={() =>
              open({
                title: 'Không close bằng backdrop',
                children: <p>Phải bấm nút close để đóng</p>,
                mode: 'modal',
                overClickClose: false,
              })
            }
          >
            3. Không close bằng backdrop
          </MyButton>

          <MyButton
            variant='error'
            onClick={() =>
              open({
                title: 'Stack modal 1',
                mode: 'modal',
                children: (
                  <button
                    className='btn btn-primary'
                    onClick={() =>
                      open({
                        title: 'Stack modal 2',
                        mode: 'modal',
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
          </MyButton>

          <button
            className='btn btn-warning'
            onClick={() =>
              open({
                title: 'Modal cũ',
                mode: 'modal',
                children: (
                  <button
                    className='btn btn-primary'
                    onClick={() =>
                      open({
                        mode: 'modal',
                        add: false,
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
                mode: 'modal',
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
                mode: 'modal',
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
                mode: 'modal',
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

        <h1 className='text-3xl font-bold mt-8'>Drawer Demo</h1>

        <div className='flex flex-col gap-4 w-full max-w-md'>
          <MyButton
            onClick={() =>
              open({
                title: 'Drawer bên phải',
                children: <DrawerContent />,
                mode: 'drawer',
                drawerPlacement: 'right',
              })
            }
          >
            1. Drawer phải (default)
          </MyButton>

          <MyButton
            variant='primary'
            onClick={() =>
              open({
                title: 'Drawer bên trái',
                children: <p>Nội dung drawer bên trái</p>,
                mode: 'drawer',
                drawerPlacement: 'left',
              })
            }
          >
            2. Drawer trái
          </MyButton>

          <MyButton
            variant='warning'
            onClick={() =>
              open({
                title: 'Drawer từ dưới lên',
                children: <p>Nội dung drawer bottom</p>,
                mode: 'drawer',
                drawerPlacement: 'bottom',
              })
            }
          >
            3. Drawer bottom
          </MyButton>

          <MyButton
            variant='error'
            onClick={() =>
              open({
                title: 'Drawer từ trên xuống',
                children: <p>Nội dung drawer top</p>,
                mode: 'drawer',
                drawerPlacement: 'top',
              })
            }
          >
            4. Drawer top
          </MyButton>

          <button
            className='btn btn-outline'
            onClick={() =>
              open({
                title: 'Drawer không close bằng overlay',
                children: <p>Phải bấm nút ✕ để đóng</p>,
                mode: 'drawer',
                drawerPlacement: 'right',
                overClickClose: false,
              })
            }
          >
            5. Không close bằng overlay
          </button>

          <button
            className='btn btn-outline'
            onClick={() =>
              open({
                title: 'Stack drawer 1',
                mode: 'drawer',
                drawerPlacement: 'right',
                children: (
                  <div className='p-4'>
                    <button
                      className='btn btn-primary'
                      onClick={() =>
                        open({
                          title: 'Stack drawer 2',
                          mode: 'drawer',
                          drawerPlacement: 'right',
                          children: <p>Drawer này chồng lên drawer 1</p>,
                          add: true,
                        })
                      }
                    >
                      Mở drawer mới
                    </button>
                  </div>
                ),
              })
            }
          >
            6. Stack drawer
          </button>

          <button
            className='btn btn-error'
            onClick={() =>
              open({
                title: 'Drawer có callback onClose',
                children: <p>Drawer này có callback khi đóng</p>,
                mode: 'drawer',
                drawerPlacement: 'right',
                onClose: () => console.log('Drawer closed!'),
              })
            }
          >
            7. onClose callback
          </button>

          <button className='btn btn-ghost' onClick={closeAll}>
            Đóng tất cả drawer
          </button>
        </div>
      </main>
    </div>
  )
}
