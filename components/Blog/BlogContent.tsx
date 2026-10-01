import '@blocknote/core/fonts/inter.css'
import '@blocknote/core/style.css'

import { ServerBlockNoteEditor } from '@blocknote/server-util'

import { parseBlogContent } from '@/utils/blogContent'

// Server Component: renders stored BlockNote blocks to static HTML with the same markup as the editor
const BlogContent = async ({ content }: { content?: string | null }) => {
  if (!content) {
    return null
  }

  const blocks = parseBlogContent(content)

  if (!blocks) {
    return <div className='prose prose-lg max-w-none text-text' dangerouslySetInnerHTML={{ __html: content }} />
  }

  const html = await ServerBlockNoteEditor.create().blocksToFullHTML(blocks)

  return (
    <div className='bn-root bn-container' data-color-scheme='light'>
      <div className='ProseMirror bn-editor bn-default-styles !px-0' dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default BlogContent
