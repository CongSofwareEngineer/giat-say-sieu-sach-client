export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) return ''

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}