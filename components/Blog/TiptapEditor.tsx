'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { useCallback, useState } from 'react'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { cn } from '@/utils/tailwind'
import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import MyImage from '@/components/MyImage'

// Syntax highlighting languages
import html from 'highlight.js/lib/languages/xml'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'

const lowlight = createLowlight()
lowlight.register('html', html)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('css', css)

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    codeBlock: false,
  }),
  Placeholder.configure({ placeholder: 'Write something...' }),
  Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
  Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full my-4' } }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color.configure({ types: ['textStyle'] }),
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  HorizontalRule,
  Youtube,
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-2 overflow-x-auto',
    },
  }),
]

type EditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

// Toolbar Button Component - matches Tiptap UI Components style
type ToolbarButtonProps = {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  ariaLabel: string
  title?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, ariaLabel, title, children }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'h-8 w-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? 'bg-gray-200 dark:bg-gray-600' : 'bg-transparent',
        'text-gray-700 dark:text-gray-200'
      )}
    >
      {children}
    </button>
  )
}

// Heading Button Component
function HeadingButton({ level, isActive, onClick, disabled }: { level: number; isActive: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={`Heading ${level}`}
      className={cn(
        'h-8 px-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? 'bg-gray-200 dark:bg-gray-600' : 'bg-transparent',
        'text-gray-700 dark:text-gray-200'
      )}
    >
      H{level}
    </button>
  )
}

// Separator Component
function Separator() {
  return <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />
}

export default function TiptapEditor({ value, onChange, placeholder, readOnly = false, className }: EditorProps) {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-li:my-1 prose-img:my-4 prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-code:before:content-none prose-code:after:content-none prose-pre:my-2 prose-table:my-4',
      },
    },
  })

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      close()
    }
  }, [editor, imageUrl, close])

  const addVideo = useCallback(() => {
    if (videoUrl && editor) {
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
      if (youtubeMatch) {
        editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/embed/${youtubeMatch[1]}` }).run()
      } else {
        editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      }
      setVideoUrl('')
      close()
    }
  }, [editor, videoUrl, close])

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl('')
      close()
    }
  }, [editor, linkUrl, close])

  const openImageModal = () => {
    open({
      mode: 'modal',
      title: translate('blog.editor.addImage', {}, 'Thêm hình ảnh'),
      classNames: { container: 'max-w-md' },
      children: (
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
            <MyButton variant='outline' onClick={close}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton variant='primary' onClick={addImage} disabled={!imageUrl}>
              {translate('common.add')}
            </MyButton>
          </div>
        </div>
      ),
    })
  }

  const openVideoModal = () => {
    open({
      mode: 'modal',
      title: translate('blog.editor.addVideo', {}, 'Thêm video (YouTube)'),
      classNames: { container: 'max-w-md' },
      children: (
        <div className='space-y-4'>
          <MyInput
            label={translate('blog.editor.videoUrl', {}, 'URL video YouTube')}
            placeholder='https://youtube.com/watch?v=...'
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className='text-sm text-gray-500'>{translate('blog.editor.videoHint', {}, 'Hỗ trợ link YouTube: youtube.com/watch?v=... hoặc youtu.be/...')}</p>
          <div className='flex justify-end gap-2'>
            <MyButton variant='outline' onClick={close}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton variant='primary' onClick={addVideo} disabled={!videoUrl}>
              {translate('common.add')}
            </MyButton>
          </div>
        </div>
      ),
    })
  }

  const openLinkModal = () => {
    open({
      mode: 'modal',
      title: translate('blog.editor.addLink', {}, 'Thêm liên kết'),
      classNames: { container: 'max-w-md' },
      children: (
        <div className='space-y-4'>
          <MyInput
            label={translate('blog.editor.linkUrl', {}, 'URL liên kết')}
            placeholder='https://example.com'
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <div className='flex justify-end gap-2'>
            <MyButton variant='outline' onClick={close}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton variant='primary' onClick={addLink} disabled={!linkUrl}>
              {translate('common.add')}
            </MyButton>
          </div>
        </div>
      ),
    })
  }

  if (!editor) {
    return <div className={cn('min-h-[300px] border border-border rounded-lg', className)}>Loading editor...</div>
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm', className)}>
      {/* Toolbar - Based on Simple Editor template from Tiptap UI Components docs */}
      <div className='flex flex-wrap items-center gap-1 p-2 border-b border-border bg-gray-50 dark:bg-gray-800'>
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={readOnly || !editor.can().undo()}
          isActive={false}
          ariaLabel='Undo'
          title='Undo (Ctrl+Z)'
        >
          ⬅️
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={readOnly || !editor.can().redo()}
          isActive={false}
          ariaLabel='Redo'
          title='Redo (Ctrl+Y)'
        >
          ➡️
        </ToolbarButton>

        <Separator />

        {/* Headings */}
        <HeadingButton
          level={1}
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={readOnly}
        />
        <HeadingButton
          level={2}
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={readOnly}
        />
        <HeadingButton
          level={3}
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={readOnly}
        />
        <HeadingButton
          level={4}
          isActive={editor.isActive('heading', { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          disabled={readOnly}
        />
        <HeadingButton
          level={5}
          isActive={editor.isActive('heading', { level: 5 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          disabled={readOnly}
        />
        <HeadingButton
          level={6}
          isActive={editor.isActive('heading', { level: 6 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          disabled={readOnly}
        />

        <Separator />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={readOnly}
          ariaLabel='Bold'
          title='Bold (Ctrl+B)'
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={readOnly}
          ariaLabel='Italic'
          title='Italic (Ctrl+I)'
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          disabled={readOnly}
          ariaLabel='Underline'
          title='Underline (Ctrl+U)'
        >
          U
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          disabled={readOnly}
          ariaLabel='Strikethrough'
          title='Strikethrough'
        >
          S
        </ToolbarButton>

        <Separator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={readOnly}
          ariaLabel='Bullet list'
          title='Bullet List'
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={readOnly}
          ariaLabel='Ordered list'
          title='Ordered List'
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          disabled={readOnly}
          ariaLabel='Task list'
          title='Task List'
        >
          ☐
        </ToolbarButton>

        <Separator />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          disabled={readOnly}
          ariaLabel='Blockquote'
          title='Blockquote'
        >
          "
        </ToolbarButton>

        {/* Code Block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          disabled={readOnly}
          ariaLabel='Code block'
          title='Code Block'
        >
          {'{ }'}
        </ToolbarButton>

        <Separator />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          disabled={readOnly}
          ariaLabel='Align left'
          title='Align Left'
        >
          ⬛
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          disabled={readOnly}
          ariaLabel='Align center'
          title='Align Center'
        >
          ⬜
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          disabled={readOnly}
          ariaLabel='Align right'
          title='Align Right'
        >
          ⬛
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          disabled={readOnly}
          ariaLabel='Align justify'
          title='Align Justify'
        >
          ▣
        </ToolbarButton>

        <Separator />

        {/* Media */}
        <ToolbarButton
          onClick={openImageModal}
          disabled={readOnly}
          ariaLabel='Add image'
          title='Add Image'
        >
          🖼️
        </ToolbarButton>
        <ToolbarButton
          onClick={openVideoModal}
          disabled={readOnly}
          ariaLabel='Add video'
          title='Add Video'
        >
          📹
        </ToolbarButton>
        <ToolbarButton
          onClick={openLinkModal}
          isActive={editor.isActive('link')}
          disabled={readOnly}
          ariaLabel='Add link'
          title='Add Link (Ctrl+K)'
        >
          🔗
        </ToolbarButton>

        <Separator />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          disabled={readOnly}
          ariaLabel='Code'
          title='Inline Code'
        >
          &lt;/&gt;
        </ToolbarButton>

        <Separator />

        {/* Table */}
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          disabled={readOnly}
          ariaLabel='Add table'
          title='Add Table'
        >
          ⊞
        </ToolbarButton>

        <Separator />

        {/* Highlight */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          disabled={readOnly}
          ariaLabel='Highlight'
          title='Highlight'
        >
          🖍️
        </ToolbarButton>

        <Separator />

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={readOnly}
          ariaLabel='Horizontal rule'
          title='Horizontal Rule'
        >
          −−−
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className='p-4 min-h-[300px] prose dark:prose-invert max-w-none' />
    </div>
  )
}
