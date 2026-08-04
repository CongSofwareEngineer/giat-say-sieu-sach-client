'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

const HomePage = () => {
  const { translate } = useLanguage()

  const processSteps = [
    {
      step: 1,
      title: translate('home.process.step1'),
      description: translate('home.process.step1Desc'),
      icon: '📅',
    },
    {
      step: 2,
      title: translate('home.process.step2'),
      description: translate('home.process.step2Desc'),
      icon: '🚚',
    },
    {
      step: 3,
      title: translate('home.process.step3'),
      description: translate('home.process.step3Desc'),
      icon: '🧼',
    },
    {
      step: 4,
      title: translate('home.process.step4'),
      description: translate('home.process.step4Desc'),
      icon: '✨',
    },
  ]

  const benefits = [
    {
      icon: '⚡',
      title: translate('home.benefits.fast'),
      description: translate('home.benefits.fastDesc'),
    },
    {
      icon: '⭐',
      title: translate('home.benefits.quality'),
      description: translate('home.benefits.qualityDesc'),
    },
    {
      icon: '💰',
      title: translate('home.benefits.price'),
      description: translate('home.benefits.priceDesc'),
    },
    {
      icon: '🎯',
      title: translate('home.benefits.convenience'),
      description: translate('home.benefits.convenienceDesc'),
    },
    {
      icon: '⏰',
      title: translate('home.benefits.schedule'),
      description: translate('home.benefits.scheduleDesc'),
    },
    {
      icon: '📞',
      title: translate('home.benefits.support'),
      description: translate('home.benefits.supportDesc'),
    },
  ]

  const commitments = [
    {
      icon: '✨',
      title: translate('home.commitment.clean'),
      description: translate('home.commitment.cleanDesc'),
    },
    {
      icon: '🛡️',
      title: translate('home.commitment.safe'),
      description: translate('home.commitment.safeDesc'),
    },
    {
      icon: '🚀',
      title: translate('home.commitment.fast'),
      description: translate('home.commitment.fastDesc'),
    },
    {
      icon: '💵',
      title: translate('home.commitment.price'),
      description: translate('home.commitment.priceDesc'),
    },
  ]

  const faqs = [
    {
      question: 'Dịch vụ giặt ủi có những loại nào?',
      answer: 'Chúng tôi cung cấp đa dạng dịch vụ: giặt thường, giặt sấy, giặt hấp, ủi đồ, và gói combo tiết kiệm.',
    },
    {
      question: 'Thời gian giao nhận đồ là bao lâu?',
      answer: 'Thời gian giao nhận đồ thông thường là 24 giờ. Đối với dịch vụ gấp, chúng tôi có thể giao trong 4 giờ.',
    },
    {
      question: 'Giá cả như thế nào?',
      answer: 'Giá cả rất cạnh tranh, chỉ từ 8.000đ/kg. Xem chi tiết tại trang Bảng giá.',
    },
    {
      question: 'Làm sao để theo dõi đơn hàng?',
      answer: 'Bạn có thể theo dõi đơn hàng bằng cách nhập mã đơn và số điện thoại tại trang Theo dõi đơn.',
    },
  ]

  const feedbacks = [
    {
      name: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Dịch vụ rất tốt, đồ sạch sẽ và giao đúng hẹn. Sẽ sử dụng lại!',
    },
    {
      name: 'Trần Thị B',
      rating: 5,
      comment: 'Giá cả hợp lý, nhân viên nhiệt tình. Rất hài lòng!',
    },
    {
      name: 'Lê Văn C',
      rating: 5,
      comment: 'Tiện lợi, không cần phải đi đâu. Đồ được giao tận nơi!',
    },
  ]

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-32'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-4xl lg:text-6xl font-bold text-text mb-6'>{translate('home.heroTitle')}</h1>
            <p className='text-xl lg:text-2xl text-primary font-semibold mb-4'>{translate('home.heroSubtitle')}</p>
            <p className='text-gray-600 text-lg mb-8'>{translate('home.heroDescription')}</p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Link href='/dat-lich'>
                <MyButton variant='primary' size='large'>
                  {translate('home.heroCTA')}
                </MyButton>
              </Link>
              <Link href='/bang-gia'>
                <MyButton variant='default' size='large'>
                  {translate('home.heroSecondaryCTA')}
                </MyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.process.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.process.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {processSteps.map((step) => (
              <div key={step.step} className='text-center'>
                <div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl'>{step.icon}</div>
                <div className='text-sm font-semibold text-primary mb-2'>Bước {step.step}</div>
                <h3 className='text-lg font-semibold text-text mb-2'>{step.title}</h3>
                <p className='text-gray-600 text-sm'>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-16 lg:py-24 bg-background'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.benefits.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.benefits.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {benefits.map((benefit, index) => (
              <MyCard key={index}>
                <MyCardBody>
                  <div className='text-4xl mb-4'>{benefit.icon}</div>
                  <h3 className='text-lg font-semibold text-text mb-2'>{benefit.title}</h3>
                  <p className='text-gray-600 text-sm'>{benefit.description}</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.pricing.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.pricing.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <MyCard>
              <MyCardBody className='text-center'>
                <h3 className='text-lg font-semibold text-text mb-2'>Giặt thường</h3>
                <div className='text-3xl font-bold text-primary mb-4'>
                  8.000đ<span className='text-sm font-normal text-gray-500'>/kg</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>Phù hợp cho đồ hàng ngày</p>
                <Link href='/dat-lich'>
                  <MyButton variant='primary' className='w-full'>
                    Đặt lịch
                  </MyButton>
                </Link>
              </MyCardBody>
            </MyCard>
            <MyCard className='ring-2 ring-primary'>
              <MyCardBody className='text-center'>
                <div className='inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-2'>Phổ biến</div>
                <h3 className='text-lg font-semibold text-text mb-2'>Giặt sấy</h3>
                <div className='text-3xl font-bold text-primary mb-4'>
                  12.000đ<span className='text-sm font-normal text-gray-500'>/kg</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>Giặt và sấy khô</p>
                <Link href='/dat-lich'>
                  <MyButton variant='primary' className='w-full'>
                    Đặt lịch
                  </MyButton>
                </Link>
              </MyCardBody>
            </MyCard>
            <MyCard>
              <MyCardBody className='text-center'>
                <h3 className='text-lg font-semibold text-text mb-2'>Giặt hấp</h3>
                <div className='text-3xl font-bold text-primary mb-4'>
                  15.000đ<span className='text-sm font-normal text-gray-500'>/kg</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>Cho đồ cao cấp, dễ hư</p>
                <Link href='/dat-lich'>
                  <MyButton variant='primary' className='w-full'>
                    Đặt lịch
                  </MyButton>
                </Link>
              </MyCardBody>
            </MyCard>
          </div>
          <div className='text-center mt-8'>
            <Link href='/bang-gia'>
              <MyButton variant='default'>{translate('home.pricing.viewFull')}</MyButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className='py-16 lg:py-24 bg-background'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.commitment.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.commitment.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {commitments.map((commitment, index) => (
              <div key={index} className='text-center'>
                <div className='text-4xl mb-4'>{commitment.icon}</div>
                <h3 className='text-lg font-semibold text-text mb-2'>{commitment.title}</h3>
                <p className='text-gray-600 text-sm'>{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className='py-16 lg:py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.feedback.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.feedback.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {feedbacks.map((feedback, index) => (
              <MyCard key={index}>
                <MyCardBody>
                  <div className='flex items-center mb-4'>
                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold'>
                      {feedback.name.charAt(0)}
                    </div>
                    <div className='ml-3'>
                      <p className='font-semibold text-text'>{feedback.name}</p>
                      <div className='flex items-center'>
                        {Array.from({ length: feedback.rating }).map((_, i) => (
                          <span key={i} className='text-yellow-400'>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className='text-gray-600 text-sm'>&quot;{feedback.comment}&quot;</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-16 lg:py-24 bg-background'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.faq.title')}</h2>
            <p className='text-gray-600 text-lg'>{translate('home.faq.subtitle')}</p>
          </div>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <MyCard key={index}>
                <MyCardBody>
                  <h3 className='font-semibold text-text mb-2'>{faq.question}</h3>
                  <p className='text-gray-600 text-sm'>{faq.answer}</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 lg:py-24 bg-primary'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold text-white mb-4'>{translate('home.cta.title')}</h2>
          <p className='text-white/80 text-lg mb-8'>{translate('home.cta.subtitle')}</p>
          <Link href='/dat-lich'>
            <MyButton variant='default' size='large' className='bg-white text-primary'>
              {translate('home.cta.button')}
            </MyButton>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
