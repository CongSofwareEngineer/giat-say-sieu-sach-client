'use client'

import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

import { useEffect } from 'react'
import { en, vi } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'

import useLanguage from '@/hooks/useLanguage'
import { LANGUAGE_SUPPORT } from '@/zustand/language'
import { parseBlogContent } from '@/utils/blogContent'

export type BlogEditorProps = {
  initialContent?: string
  onChange: (content: string) => void
}

const Editor = ({ initialContent, onChange }: BlogEditorProps) => {
  const { lang } = useLanguage()

  const editor = useCreateBlockNote({
    initialContent: parseBlogContent(initialContent) ?? undefined,
    dictionary: lang === LANGUAGE_SUPPORT.VN ? vi : en,
  })

  // Legacy posts are stored as HTML: convert them to blocks once when the editor mounts
  useEffect(() => {
    if (!initialContent || parseBlogContent(initialContent)) return

    editor.replaceBlocks(editor.document, editor.tryParseHTMLToBlocks(initialContent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return <BlockNoteView editor={editor} theme='light' onChange={() => onChange(JSON.stringify(editor.document))} />
}

export default Editor
