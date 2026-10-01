import BaseAPI from '@/config/baseApi'
import { MAX_IMAGES_PER_UPLOAD, UPLOAD_IMAGE_TYPE } from '@/constants/app'

// Image stored on Cloudinary, returned by the upload API and sent back as-is in other request bodies
export type CloudinaryImage = {
  publicId: string
  url: string
}

class UploadApi extends BaseAPI {
  // Upload images (split into batches the server accepts) and return them in the same order
  async uploadImages(files: File[], type: UPLOAD_IMAGE_TYPE): Promise<CloudinaryImage[]> {
    if (!files.length) return []

    const batches: File[][] = []

    for (let i = 0; i < files.length; i += MAX_IMAGES_PER_UPLOAD) {
      batches.push(files.slice(i, i + MAX_IMAGES_PER_UPLOAD))
    }

    const results = await Promise.all(
      batches.map((batch) => {
        const formData = new FormData()

        formData.append('type', type)
        batch.forEach((file) => formData.append('files', file))

        return this.postFormData<{ data: CloudinaryImage[] }>('/images', formData, { isUseAuth: true })
      })
    )

    return results.flatMap((response) => response.data)
  }
}

const UploadService = new UploadApi('uploads')

export default UploadService
