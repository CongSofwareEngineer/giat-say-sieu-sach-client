'use client'

import Link from 'next/link'

import MyImage from '../MyImage'
import { PhoneIcon } from '../Icons/Phone'
import { MailIcon } from '../Icons/Mail'
import { MapPinIcon } from '../Icons/MapPin'
import FacebookIcon from '../Icons/SocialMedia/Facebook'
import ZaloIcon from '../Icons/SocialMedia/Zalo'

import { images } from '@/config/images'
import { INFO_CONTACT } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'

const Footer = () => {
  const { translate } = useLanguage()

  const quickLinks = [
    { href: '/', label: translate('menu.home') },
    { href: '/pricing', label: translate('menu.priceList') },
    { href: '/blog', label: translate('menu.blog') },
    { href: '/about', label: translate('menu.about') },
    { href: '/contact', label: translate('menu.contact') },
  ]

  const serviceLinks = [
    { href: '/booking', label: translate('menu.booking') },
    { href: '/track-order', label: translate('menu.tracking') },
  ]

  return (
    <footer className='bg-footer text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
          {/* About */}
          <div className='space-y-4'>
            <Link href='/' className='inline-block'>
              <div className='relative w-10 h-10 lg:w-12 lg:h-12'>
                <MyImage src={images.favicon} alt='Giặt Ủi Siêu Sạch' fill className='object-contain' sizes='48px' />
              </div>
            </Link>
            <h3 className='text-lg font-semibold'>{translate('footer.about')}</h3>
            <p className='text-gray-400 text-sm leading-relaxed'>{translate('footer.aboutDesc')}</p>
            <div className='flex items-center gap-3'>
              <a
                href={INFO_CONTACT.Facebook}
                target='_blank'
                rel='noopener noreferrer'
                className='p-2 bg-gray-800 rounded-lg transition-colors'
                aria-label='Facebook'
              >
                <FacebookIcon className='w-5 h-5' />
              </a>
              <a
                href={INFO_CONTACT.Zalo}
                target='_blank'
                rel='noopener noreferrer'
                className='p-2 bg-gray-800 rounded-lg transition-colors'
                aria-label='Zalo'
              >
                <ZaloIcon className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>{translate('footer.quickLinks')}</h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='text-gray-400 transition-colors text-sm'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>{translate('footer.services')}</h3>
            <ul className='space-y-3'>
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='text-gray-400 transition-colors text-sm'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>{translate('footer.contactInfo')}</h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <PhoneIcon className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                <span className='text-gray-400 text-sm'>{INFO_CONTACT.Phone}</span>
              </li>
              <li className='flex items-start gap-3'>
                <MailIcon className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                <span className='text-gray-400 text-sm'>contact@giatsaysieusach.com</span>
              </li>
              <li className='flex items-start gap-3'>
                <MapPinIcon className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                <span className='text-gray-400 text-sm'>{INFO_CONTACT.Address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-gray-400 text-sm'>{translate('footer.copyright')}</p>
            <div className='flex items-center gap-4'>
              <Link href='/chinh-sach-bao-mat' className='text-gray-400 text-sm transition-colors'>
                {translate('footer.privacy')}
              </Link>
              <Link href='/dieu-khoan-su-dung' className='text-gray-400 text-sm transition-colors'>
                {translate('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
