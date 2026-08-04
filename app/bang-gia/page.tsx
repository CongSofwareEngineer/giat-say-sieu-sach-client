'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

const PriceListPage = () => {
  const { translate } = useLanguage()

  const services = [
    {
      id: 1,
      name: 'Giặt thường',
      description: 'Phù hợp cho đồ hàng ngày, đồ cotton, đồ tổng hợp',
      price: 8000,
      unit: 'kg',
      features: ['Giặt sạch', 'Phơi khô', 'Gói gọn'],
    },
    {
      id: 2,
      name: 'Giặt sấy',
      description: 'Giặt và sấy khô, phù hợp cho đồ dày',
      price: 12000,
      unit: 'kg',
      features: ['Giặt sạch', 'Sấy khô', 'Gói gọn'],
      popular: true,
    },
    {
      id: 3,
      name: 'Giặt hấp',
      description: 'Cho đồ cao cấp, đồ dễ hư, đồ lụa',
      price: 15000,
      unit: 'kg',
      features: ['Giặt hấp', 'Bảo quản tốt', 'Gói gọn'],
    },
    {
      id: 4,
      name: 'Ủi đồ',
      description: 'Ủi phẳng lì, phù hợp cho đồ công sở',
      price: 5000,
      unit: 'kg',
      features: ['Ủi phẳng', 'Bảo quản tốt', 'Gói gọn'],
    },
    {
      id: 5,
      name: 'Giặt chăn ga',
      description: 'Giặt chăn, ga, gối, nệm',
      price: 20000,
      unit: 'kg',
      features: ['Giặt sạch', 'Sấy khô', 'Khử mùi'],
    },
    {
      id: 6,
      name: 'Giặt rèm',
      description: 'Giặt rèm cửa, rèm treo',
      price: 25000,
      unit: 'kg',
      features: ['Giặt sạch', 'Phơi khô', 'Gấp gọn'],
    },
  ]

  const combos = [
    {
      id: 1,
      name: 'Combo Tiết Kiệm',
      description: 'Phù hợp cho gia đình nhỏ',
      price: 200000,
      weight: '20kg',
      savings: 'Tiết kiệm 20%',
    },
    {
      id: 2,
      name: 'Combo Gia Đình',
      description: 'Phù hợp cho gia đình đông người',
      price: 450000,
      weight: '50kg',
      savings: 'Tiết kiệm 25%',
      popular: true,
    },
    {
      id: 3,
      name: 'Combo Tháng',
      description: 'Dành cho khách hàng thân thiết',
      price: 800000,
      weight: '100kg',
      savings: 'Tiết kiệm 30%',
    },
  ]

  return (
    <div className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-3xl lg:text-4xl font-bold text-text mb-4'>{translate('home.pricing.title')}</h1>
          <p className='text-gray-600 text-lg'>{translate('home.pricing.subtitle')}</p>
        </div>

        {/* Services */}
        <section className='mb-16'>
          <h2 className='text-2xl font-bold text-text mb-8 text-center'>Dịch vụ lẻ</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {services.map((service) => (
              <MyCard key={service.id} className='relative'>
                {service.popular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full'>
                    Phổ biến
                  </div>
                )}
                <MyCardBody>
                  <h3 className='text-xl font-bold text-text mb-2'>{service.name}</h3>
                  <p className='text-gray-600 text-sm mb-4'>{service.description}</p>
                  <div className='mb-4'>
                    <span className='text-3xl font-bold text-primary'>{service.price.toLocaleString()}đ</span>
                    <span className='text-gray-500 text-sm'>/{service.unit}</span>
                  </div>
                  <ul className='space-y-2 mb-6'>
                    {service.features.map((feature, index) => (
                      <li key={index} className='flex items-center gap-2 text-sm text-gray-600'>
                        <span className='text-green-500'>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href='/dat-lich'>
                    <MyButton variant='primary' className='w-full'>
                      Đặt lịch
                    </MyButton>
                  </Link>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </section>

        {/* Combos */}
        <section>
          <h2 className='text-2xl font-bold text-text mb-8 text-center'>Combo tiết kiệm</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            {combos.map((combo) => (
              <MyCard
                key={combo.id}

                className={combo.popular ? 'ring-2 ring-primary' : ''}
              >
                <MyCardBody className='text-center'>
                  {combo.popular && (
                    <div className='inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-2'>Phổ biến</div>
                  )}
                  <h3 className='text-xl font-bold text-text mb-2'>{combo.name}</h3>
                  <p className='text-gray-600 text-sm mb-4'>{combo.description}</p>
                  <div className='mb-2'>
                    <span className='text-3xl font-bold text-primary'>{combo.price.toLocaleString()}đ</span>
                  </div>
                  <p className='text-sm text-gray-500 mb-2'>{combo.weight}</p>
                  <p className='text-sm text-green-600 font-medium mb-4'>{combo.savings}</p>
                  <Link href='/dat-lich'>
                    <MyButton variant='primary' className='w-full'>
                      Đặt lịch
                    </MyButton>
                  </Link>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </section>

        {/* Note */}
        <div className='mt-12 text-center'>
          <p className='text-gray-500 text-sm'>* Giá có thể thay đổi tùy theo loại vải và mức độ bẩn. Vui lòng liên hệ để được tư vấn chi tiết.</p>
        </div>
      </div>
    </div>
  )
}

export default PriceListPage
