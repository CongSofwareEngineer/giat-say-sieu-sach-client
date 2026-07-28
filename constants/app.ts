export const SITE_CONFIG = {
  title: 'Next.js + TailwindCSS + TypeScript Starter',
  description: 'A starter template for Next.js with TailwindCSS and TypeScript.',
  url: 'https://example.com',
  icon: '/logo.png',
  thumbnail: '/thumbnail.png',
  keywords: ['Next.js', 'TailwindCSS', 'TypeScript', 'Starter Template'],
}

export enum INFO_CONTACT {
  Mail = 'mailto:hodiencong2000@gmail.com',
  Phone = '+84-392-225-405',
}

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production'
