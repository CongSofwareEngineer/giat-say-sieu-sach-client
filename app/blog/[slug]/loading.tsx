const BlogDetailLoading = () => {
  return (
    <div className='py-12 px-4'>
      <div className='max-w-3xl mx-auto animate-pulse'>
        <div className='h-8 bg-gray-200 rounded w-3/4 mb-4' />
        <div className='h-4 bg-gray-200 rounded w-1/2 mb-8' />
        <div className='aspect-video bg-gray-200 rounded-2xl mb-8' />
        <div className='space-y-4'>
          <div className='h-4 bg-gray-200 rounded' />
          <div className='h-4 bg-gray-200 rounded' />
          <div className='h-4 bg-gray-200 rounded' />
        </div>
      </div>
    </div>
  )
}

export default BlogDetailLoading
