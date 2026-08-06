'use client'

import { useCallback, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

type ImageCropperProps = {
  image: string
  outputFileName: string
  outputFormat?: string
  onCancel: () => void
  onConfirm: (file: File) => void | Promise<void>
}

// Map MIME type to a file extension
const getExtension = (format: string) => (format === 'image/jpeg' ? 'jpg' : 'png')

// Create a square File from the selected crop area
const getCroppedFile = async (imageSrc: string, pixelCrop: Area, fileName: string, format: string): Promise<File> => {
  const image = new Image()

  image.src = imageSrc
  await image.decode()

  const canvas = document.createElement('canvas')

  canvas.width = Math.round(pixelCrop.width)
  canvas.height = Math.round(pixelCrop.height)

  const context = canvas.getContext('2d')

  if (!context) throw new Error('Canvas not supported')

  context.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height)

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Failed to crop image'))
      },
      format,
      0.95
    )
  })

  return new File([blob], `${fileName.replace(/\.[^.]+$/, '')}_cropped.${getExtension(format)}`, { type: format })
}

const ImageCropper = ({ image, outputFileName, outputFormat = 'image/jpeg', onCancel, onConfirm }: ImageCropperProps) => {
  const { translate } = useLanguage()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)

    try {
      const croppedFile = await getCroppedFile(image, croppedAreaPixels, outputFileName, outputFormat)

      await onConfirm(croppedFile)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <p className='text-sm text-gray-600'>{translate('imageCropper.subtitle')}</p>

      <div className='relative h-[45dvh] min-h-[240px] w-full overflow-hidden rounded-2xl bg-black'>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape='rect'
          showGrid
          minZoom={1}
          maxZoom={4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className='flex items-center gap-3 px-1'>
        <span className='text-xs font-medium text-gray-500'>{translate('imageCropper.zoom')}</span>
        <input
          type='range'
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className='w-full accent-primary'
          aria-label={translate('imageCropper.zoom')}
        />
      </div>

      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={onCancel} disabled={isProcessing}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton variant='primary' onClick={handleConfirm} loading={isProcessing}>
          {isProcessing ? translate('imageCropper.processing') : translate('imageCropper.confirm')}
        </MyButton>
      </div>
    </div>
  )
}

export default ImageCropper
