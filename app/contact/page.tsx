'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import { PhoneIcon } from '@/components/Icons/Phone'
import { MailIcon } from '@/components/Icons/Mail'
import { MapPinIcon } from '@/components/Icons/MapPin'
import FacebookIcon from '@/components/Icons/SocialMedia/Facebook'
import ZaloIcon from '@/components/Icons/SocialMedia/Zalo'
import { INFO_CONTACT } from '@/constants/app'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, contactPageSchema, localBusinessSchema } from '@/config/seo'

const ContactPage = () => {
  const { translate } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd data={localBusinessSchema()} />
      <SeoJsonLd data={contactPageSchema()} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Liên hệ', path: '/contact' },
        ])}
      />
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('contact.title')}</h1>
          <p className='text-gray-600 text-lg'>{translate('contact.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Contact Info */}
          <div>
            <h2 className='text-xl font-bold text-text mb-6'>{translate('contact.info.title')}</h2>
            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <PhoneIcon className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <p className='font-semibold text-text mb-1'>{translate('contact.info.phone')}</p>
                  <a href={`tel:${INFO_CONTACT.Phone}`} className='text-gray-600 transition-colors'>
                    {INFO_CONTACT.Phone}
                  </a>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <MailIcon className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <p className='font-semibold text-text mb-1'>{translate('contact.info.email')}</p>
                  <a href={INFO_CONTACT.Mail} className='text-gray-600 transition-colors'>
                    contact@giatsaysieusach.com
                  </a>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <MapPinIcon className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <p className='font-semibold text-text mb-1'>{translate('contact.info.address')}</p>
                  <p className='text-gray-600'>{INFO_CONTACT.Address}</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <span className='text-xl'>⏰</span>
                </div>
                <div>
                  <p className='font-semibold text-text mb-1'>{translate('contact.info.workingHours')}</p>
                  <p className='text-gray-600'>8:00 - 20:00 (Thứ 2 - Chủ nhật)</p>
                </div>
              </div>

              <div className='flex gap-3'>
                <a
                  href={INFO_CONTACT.Facebook}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white transition-colors'
                  aria-label='Facebook'
                >
                  <FacebookIcon className='w-6 h-6' />
                </a>
                <a
                  href={INFO_CONTACT.Zalo}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center text-white transition-colors'
                  aria-label='Zalo'
                >
                  <ZaloIcon className='w-6 h-6' />
                </a>
              </div>
            </div>

            {/* Map */}
            <div className='mt-8'>
              <h3 className='text-lg font-semibold text-text mb-4'>{translate('contact.map.title')}</h3>
              <div className='aspect-video rounded-2xl overflow-hidden border border-border'>
                <iframe
                  src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.494634696789!2d106.65220107465083!3d10.789999989364675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17a9210e75b25e03%3A0x633e4e607bb1e6a5!2zVMOibiBCw6JuLCBUaMOgbmggUGjDqW5oLCBI4buHIENoaW0gU2FpZ29u!5e0!3m2!1svi!2s!4v1709900000000!5m2!1svi!2s'
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <MyCard>
              <MyCardBody>
                <h2 className='text-xl font-bold text-text mb-6'>{translate('contact.form.title')}</h2>

                {isSuccess ? (
                  <div className='text-center py-8'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center'>
                      <span className='text-3xl'>✓</span>
                    </div>
                    <p className='text-lg font-semibold text-text mb-2'>{translate('contact.form.success')}</p>
                    <MyButton variant='default' onClick={() => setIsSuccess(false)}>
                      {translate('common.close')}
                    </MyButton>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <MyInput
                        label={translate('contact.form.name')}
                        placeholder={translate('contact.form.namePlaceholder')}
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                      <MyInput
                        label={translate('contact.form.email')}
                        placeholder={translate('contact.form.emailPlaceholder')}
                        type='email'
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <MyInput
                        label={translate('contact.form.phone')}
                        placeholder={translate('contact.form.phonePlaceholder')}
                        type='tel'
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                      <MyInput
                        label={translate('contact.form.subject')}
                        placeholder={translate('contact.form.subjectPlaceholder')}
                        required
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                      />
                    </div>
                    <MyTextarea
                      label={translate('contact.form.message')}
                      placeholder={translate('contact.form.messagePlaceholder')}
                      required
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                    <MyButton type='submit' variant='primary' loading={isSubmitting} className='w-full'>
                      {translate('contact.form.submit')}
                    </MyButton>
                  </form>
                )}
              </MyCardBody>
            </MyCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
