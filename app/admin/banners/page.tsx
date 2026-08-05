'use client'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyImage from '@/components/MyImage'
import { mockBanners } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'

const AdminBannerPage = () => {
  const { translate } = useLanguage()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.banner.title')}</h1>
        <MyButton variant='primary'>{translate('admin.banner.create')}</MyButton>
      </div>

      {/* Banner Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {mockBanners.map((banner) => (
          <MyCard key={banner.id}>
            <div className='relative aspect-video'>
              <MyImage src={banner.image} alt={banner.title} fill sizes='(max-width: 768px) 100vw, 50vw' className='rounded-t-2xl' />
            </div>
            <MyCardBody>
              <h3 className='font-semibold text-text mb-1'>{banner.title}</h3>
              <p className='text-sm text-gray-500 mb-4'>{banner.subtitle}</p>
              <div className='flex gap-2'>
                <MyButton variant='default' size='small'>
                  {translate('common.edit')}
                </MyButton>
                <MyButton variant='error' size='small'>
                  {translate('common.delete')}
                </MyButton>
              </div>
            </MyCardBody>
          </MyCard>
        ))}
      </div>
    </div>
  )
}

export default AdminBannerPage
