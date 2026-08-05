import { toJsonLd, type JsonLd } from '@/config/seo'

type SeoJsonLdProps = {
  data: JsonLd
}

// Render a JSON-LD structured data script for SEO
const SeoJsonLd = ({ data }: SeoJsonLdProps) => <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: toJsonLd(data) }} />

export default SeoJsonLd
