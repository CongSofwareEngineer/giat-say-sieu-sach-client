import PolicyContent from './components/PolicyContent'

import SeoJsonLd from '@/components/SeoJsonLd'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'
import MessageVN from '@/public/assets/language/vn.json'

const PolicyPage = () => {
  return (
    <>
      <SeoJsonLd data={webPageSchema(MessageVN.policy.seo.title, '/policy', MessageVN.policy.seo.description)} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: MessageVN.menu.home, path: '/' },
          { name: MessageVN.menu.policy, path: '/policy' },
        ])}
      />
      <PolicyContent />
    </>
  )
}

export default PolicyPage
