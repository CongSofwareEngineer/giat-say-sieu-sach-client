'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Render assistant markdown responses with proper formatting inside chat bubbles
const ChatMarkdown = ({ children }: { children: string }) => {
  return (
    <div className='chat-markdown text-sm leading-relaxed break-words'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className='my-1 last:mb-0 first:mt-0 whitespace-pre-wrap'>{children}</p>,
          strong: ({ children }) => <strong className='font-semibold text-inherit'>{children}</strong>,
          em: ({ children }) => <em className='italic'>{children}</em>,
          h1: ({ children }) => <h1 className='text-lg font-bold my-2 first:mt-0'>{children}</h1>,
          h2: ({ children }) => <h2 className='text-base font-bold my-2 first:mt-0'>{children}</h2>,
          h3: ({ children }) => <h3 className='text-sm font-bold my-1.5 first:mt-0'>{children}</h3>,
          h4: ({ children }) => <h4 className='text-sm font-semibold my-1.5 first:mt-0'>{children}</h4>,
          ul: ({ children }) => <ul className='list-disc pl-5 my-1.5 space-y-0.5'>{children}</ul>,
          ol: ({ children }) => <ol className='list-decimal pl-5 my-1.5 space-y-0.5'>{children}</ol>,
          li: ({ children }) => <li className='my-0.5'>{children}</li>,
          hr: () => <hr className='my-2 border-border' />,
          blockquote: ({ children }) => <blockquote className='border-l-2 border-gray-300 pl-3 my-1.5 text-gray-600 italic'>{children}</blockquote>,
          a: ({ children, href }) => (
            <a href={href} target='_blank' rel='noreferrer' className='underline text-blue-700 hover:opacity-80'>
              {children}
            </a>
          ),
          code: ({ children }) => <code className='rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs'>{children}</code>,
          table: ({ children }) => (
            <div className='my-2 overflow-x-auto'>
              <table className='w-full border-collapse text-xs'>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className='bg-black/5'>{children}</thead>,
          th: ({ children }) => <th className='border border-border px-2 py-1.5 text-left font-semibold'>{children}</th>,
          td: ({ children }) => <td className='border border-border px-2 py-1.5'>{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default ChatMarkdown
