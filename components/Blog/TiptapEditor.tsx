'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import { useState, useCallback } from 'react'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'
import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import MyModal from '@/components/MyModal'
import MyImage from '@/components/MyImage'

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Placeholder.configure({ placeholder: '' }),
  Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
  Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  Youtube,
]

type EditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export default function TiptapEditor({ value, onChange, placeholder, readOnly = false, className }: EditorProps) {
  const { translate } = useLanguage()
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageModal(false)
    }
  }, [editor, imageUrl])

  const addVideo = useCallback(() => {
    if (videoUrl && editor) {
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
      if (youtubeMatch) {
        editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/embed/${youtubeMatch[1]}` }).run()
      } else {
        editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      }
      setVideoUrl('')
      setShowVideoModal(false)
    }
  }, [editor, videoUrl])

  if (!editor) {
    return <div className={cn('min-h-[300px] border border-border rounded-lg', className)}>Loading editor...</div>
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <div className='flex flex-wrap gap-2 p-2 border-b border-border bg-gray-50'>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={readOnly}
          aria-label='Heading 1'
        >
          H1
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={readOnly}
          aria-label='Heading 2'
        >
          H2
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={readOnly}
          aria-label='Heading 3'
        >
          H3
        </MyButton>

        <div className='w-px h-6 bg-border mx-1' />

        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={readOnly}
          isActive={editor.isActive('bold')}
          aria-label='Bold'
        >
          <strong>B</strong>
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={readOnly}
          isActive={editor.isActive('italic')}
          aria-label='Italic'
        >
          <em>I</em>
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={readOnly}
          isActive={editor.isActive('strike')}
          aria-label='Strikethrough'
        >
          <s>S</s>
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={readOnly}
          isActive={editor.isActive('underline')}
          aria-label='Underline'
        >
          <u>U</u>
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          disabled={readOnly}
          isActive={editor.isActive('highlight')}
          aria-label='Highlight'
        >
          🖍️
        </MyButton>

        <div className='w-px h-6 bg-border mx-1' />

        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={readOnly}
          isActive={editor.isActive('bulletList')}
          aria-label='Bullet list'
        >
          • List
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={readOnly}
          isActive={editor.isActive('orderedList')}
          aria-label='Ordered list'
        >
          1. List
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          disabled={readOnly}
          isActive={editor.isActive('taskList')}
          aria-label='Task list'
        >
          ☐ Task
        </MyButton>

        <div className='w-px h-6 bg-border mx-1' />

        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          disabled={readOnly}
          isActive={editor.isActive({ textAlign: 'left' })}
          aria-label='Align left'
        >
          ⬛
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          disabled={readOnly}
          isActive={editor.isActive({ textAlign: 'center' })}
          aria-label='Align center'
        >
          ⬜
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          disabled={readOnly}
          isActive={editor.isActive({ textAlign: 'right' })}
          aria-label='Align right'
        >
          ⬛
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          disabled={readOnly}
          isActive={editor.isActive({ textAlign: 'justify' })}
          aria-label='Align justify'
        >
          ▣
        </MyButton>

        <div className='w-px h-6 bg-border mx-1' />

        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setShowImageModal(true)}
          disabled={readOnly}
          aria-label='Add image'
        >
          🖼️
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setShowVideoModal(true)}
          disabled={readOnly}
          aria-label='Add video'
        >
          📹
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().extendMarkRange('link').run()}
          disabled={readOnly || !editor.can().setLink({ href: '' })}
          isActive={editor.isActive('link')}
          aria-label='Add link'
        >
          🔗
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={readOnly}
          isActive={editor.isActive('codeBlock')}
          aria-label='Code block'
        >
          <code className='text-sm'>{'{}'}</code>
        </MyButton>
        <MyButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().addTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          disabled={readOnly}
          aria-label='Add table'
        >
          ⊞
        </MyButton>
      </div>

      <EditorContent editor={editor} className='p-4 min-h-[300px]' />

      {showImageModal && (
        <MyModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={translate('blog.editor.addImage', {}, 'Thêm hình ảnh')}
          classNames={{ container: 'max-w-md' }}
        >
          <div className='space-y-4'>
            <MyInput
              label={translate('blog.editor.imageUrl', {}, 'URL hình ảnh')}
              placeholder='https://example.com/image.jpg'
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className='relative aspect-video rounded-lg overflow-hidden'>
                <MyImage src={imageUrl} alt='Preview' fill className='object-cover' />
              </div>
            )}
            <div className='flex justify-end gap-2'>
              <MyButton variant='outline' onClick={() => setShowImageModal(false)}>
                {translate('common.cancel')}
              </MyButton>
              <MyButton variant='primary' onClick={addImage} disabled={!imageUrl}>
                {translate('common.add')}
              </MyButton>
            </div>
          </div>
        </MyModal>
      )}

      {showVideoModal && (
        <MyModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          title={translate('blog.editor.addVideo', {}, 'Thêm video (YouTube)')}
          classNames={{ container: 'max-w-md' }}
        >
          <div className='space-y-4'>
            <MyInput
              label={translate('blog.editor.videoUrl', {}, 'URL video YouTube')}
              placeholder='https://youtube.com/watch?v=...'
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className='text-sm text-gray-500'>{translate('blog.editor.videoHint', {}, 'Hỗ trợ link YouTube: youtube.com/watch?v=... hoặc youtu.be/...')}</p>
            <div className='flex justify-end gap-2'>
              <MyButton variant='outline' onClick={() => setShowVideoModal(false)}>
                {translate('common.cancel')}
              </MyButton>
              <MyButton variant='primary' onClick={addVideo} disabled={!videoUrl}>
                {translate('common.add')}
              </MyButton>
            </div>
          </div>
        </MyModal>
      )}
    </div>
  )
}