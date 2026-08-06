import { useRef } from 'react'

import useLanguage from './useLanguage'
import useModalDrawer from './useModalDrawer'

import ImageCropper from '@/components/ImageCropper'
import { MAX_PIXEL_REDUCE } from '@/constants/app'

const useBase64Img = (maxSizeOutputKB = 15, maxScale = MAX_PIXEL_REDUCE, outputFormat = 'image/jpeg') => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer({ maxWidth: 768 })
  const settledRef = useRef(false)

  // Compress an image file into a blob under the target size (PNG is lossless, JPEG is lossy)
  const reduceImageSize = (imageFile: File, maxSizeInKB = 5, quality = 0.7, format = outputFormat) => {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader()

      reader.readAsDataURL(imageFile)
      reader.onload = (event) => {
        const imgElement = document.createElement('img')

        imgElement.src = event.target?.result + ''
        imgElement.onload = () => {
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          // Adjust canvas size to reduce the dimensions of the image
          const MAX_WIDTH: any = maxScale // Adjust width as needed
          const scaleSize = MAX_WIDTH / imgElement.width

          canvas.width = MAX_WIDTH
          canvas.height = imgElement.height * scaleSize
          context?.drawImage(imgElement, 0, 0, canvas.width, canvas.height)

          const compressImage = (currentQuality: any) => {
            canvas.toBlob(
              (blob: any) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))

                  return
                }

                const isUnderSize = blob.size / 1024 < maxSizeInKB

                // PNG ignores quality, so encode once and accept the size
                if (isUnderSize || format !== 'image/jpeg' || currentQuality <= 0.1) {
                  resolve(blob)
                } else {
                  // If the image is still too large, compress further by reducing quality
                  compressImage(currentQuality - 0.1)
                }
              },
              format,
              currentQuality
            )
          }

          // Start compressing with initial quality
          compressImage(quality)
        }
        imgElement.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = () => reject(reader.error)
    })
  }

  // Read file -> open crop modal -> compress -> return optimized File
  const getFileOptimize = (file: File) => {
    return new Promise<File>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Invalid image file'))

        return
      }

      settledRef.current = false

      // Settle the outer promise once and close the crop modal
      const finish = (error: Error | null, optimizedFile?: File) => {
        if (settledRef.current) return

        settledRef.current = true
        close()

        if (error) reject(error)
        else resolve(optimizedFile!)
      }

      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onload = () => {
        open({
          title: translate('imageCropper.title'),
          showBtnClose: false,
          overClickClose: false,
          classNames: { container: 'md:w-[540px]' },
          onClose: () => finish(new Error('Crop cancelled')),
          children: (
            <ImageCropper
              image={reader.result as string}
              outputFileName={file.name}
              outputFormat={outputFormat}
              onCancel={() => finish(new Error('Crop cancelled'))}
              onConfirm={async (croppedFile) => {
                const optimizedBlob = await reduceImageSize(croppedFile, maxSizeOutputKB)

                finish(null, new File([optimizedBlob], croppedFile.name, { type: outputFormat }))
              }}
            />
          ),
        })
      }
      reader.onerror = () => finish(new Error('Failed to read file'))
    })
  }

  return { reduceImageSize, getFileOptimize }
}

export default useBase64Img
