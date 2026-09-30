'use client'

import dynamic from 'next/dynamic'

import MyLoading from '@/components/MyLoading'

// BlockNote only runs in the browser
const BlogEditor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => (
    <div className='flex min-h-[400px] items-center justify-center'>
      <MyLoading />
    </div>
  ),
})

export default BlogEditor
