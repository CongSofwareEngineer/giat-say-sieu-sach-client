'use client'

import MyCard, { MyCardBody } from '@/components/MyCard'
import useLanguage from '@/hooks/useLanguage'

const AboutPage = () => {
  const { translate } = useLanguage()

  const values = [
    {
      icon: '⭐',
      title: translate('about.values.quality'),
      description: translate('about.values.qualityDesc'),
    },
    {
      icon: '🔍',
      title: translate('about.values.integrity'),
      description: translate('about.values.integrityDesc'),
    },
    {
      icon: '💡',
      title: translate('about.values.innovation'),
      description: translate('about.values.innovationDesc'),
    },
    {
      icon: '👥',
      title: translate('about.values.customer'),
      description: translate('about.values.customerDesc'),
    },
  ]

  return (
    <div className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('about.title')}</h1>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>{translate('about.subtitle')}</p>
        </div>

        {/* Story Section */}
        <section className='mb-16'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-2xl font-bold text-text mb-4'>{translate('about.story.title')}</h2>
              <p className='text-gray-600 leading-relaxed'>{translate('about.story.content')}</p>
            </div>
            <div className='relative aspect-video rounded-2xl overflow-hidden'>
              <img src='/thumbnail.png' alt='Giặt Ủi Siêu Sạch' className='w-full h-full object-cover' />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className='mb-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <MyCard>
              <MyCardBody>
                <div className='text-4xl mb-4'>🎯</div>
                <h3 className='text-xl font-bold text-text mb-3'>{translate('about.mission.title')}</h3>
                <p className='text-gray-600'>{translate('about.mission.content')}</p>
              </MyCardBody>
            </MyCard>
            <MyCard>
              <MyCardBody>
                <div className='text-4xl mb-4'>🔭</div>
                <h3 className='text-xl font-bold text-text mb-3'>{translate('about.vision.title')}</h3>
                <p className='text-gray-600'>{translate('about.vision.content')}</p>
              </MyCardBody>
            </MyCard>
          </div>
        </section>

        {/* Values Section */}
        <section className='mb-16'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-text mb-4'>{translate('about.values.title')}</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {values.map((value, index) => (
              <MyCard key={index}>
                <MyCardBody className='text-center'>
                  <div className='text-4xl mb-4'>{value.icon}</div>
                  <h3 className='text-lg font-semibold text-text mb-2'>{value.title}</h3>
                  <p className='text-gray-600 text-sm'>{value.description}</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <MyCard>
            <MyCardBody className='text-center py-12'>
              <div className='text-4xl mb-4'>👥</div>
              <h2 className='text-2xl font-bold text-text mb-4'>{translate('about.team.title')}</h2>
              <p className='text-gray-600 max-w-2xl mx-auto'>{translate('about.team.content')}</p>
            </MyCardBody>
          </MyCard>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
