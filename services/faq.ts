export type FaqItem = {
  id: string
  question: string
  answer: string
  category?: string
}

// Mock FAQ list, replace with a real API later
export const mockFaqs: FaqItem[] = [
  {
    id: '1',
    question: 'Thời gian xử lý đơn bao lâu?',
    answer: 'Đơn giặt thường được xử lý và giao lại trong vòng 24 giờ. Với dịch vụ giặt nhanh, bạn sẽ nhận lại đồ chỉ trong 4 giờ.',
    category: 'delivery',
  },
  {
    id: '2',
    question: 'Có lấy đồ tận nhà không?',
    answer: 'Có. Nhân viên của chúng tôi sẽ đến tận nhà lấy đồ và giao lại đúng địa chỉ bạn yêu cầu, hoàn toàn miễn phí.',
    category: 'delivery',
  },
  {
    id: '3',
    question: 'Nếu đồ bị hỏng thì sao?',
    answer: 'Chúng tôi cam kết bồi thường 100% giá trị nếu đồ bị hư hỏng do lỗi của chúng tôi trong quá trình giặt ủi.',
    category: 'warranty',
  },
  {
    id: '4',
    question: 'Có hỗ trợ giặt đồ cao cấp không?',
    answer: 'Có. Chúng tôi có dịch vụ giặt khô chuyên dụng cho vest, áo dài và các loại vải cao cấp nhạy cảm.',
    category: 'service',
  },
  {
    id: '5',
    question: 'Cách thanh toán?',
    answer: 'Bạn có thể thanh toán tiền mặt khi nhận đồ hoặc chuyển khoản qua ngân hàng. Chúng tôi luôn minh bạch về chi phí.',
    category: 'payment',
  },
  {
    id: '6',
    question: 'Khối lượng tối thiểu khi đặt dịch vụ là bao nhiêu?',
    answer: 'Chúng tôi nhận từ 1kg trở lên, phù hợp cho cả những đơn giặt nhỏ hằng ngày.',
    category: 'booking',
  },
  {
    id: '7',
    question: 'Có cần đặt trước khi sử dụng dịch vụ không?',
    answer: 'Bạn có thể đặt trước qua website hoặc gọi điện để chúng tôi sắp xếp lịch lấy đồ phù hợp nhất.',
    category: 'booking',
  },
  {
    id: '8',
    question: 'Dịch vụ giao hàng mất bao lâu?',
    answer: 'Giao nhanh trong 4 giờ và giao tiêu chuẩn trong 24 giờ tùy vào gói bạn chọn.',
    category: 'delivery',
  },
]

// Simple keyword match used by the FAQ tool
export const searchFaqs = (query: string): FaqItem[] => {
  const q = query.toLowerCase().trim()

  if (!q) return mockFaqs

  return mockFaqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category?.includes(q))
}
