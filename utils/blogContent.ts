import type { PartialBlock } from '@blocknote/core'

// Blog content is stored as JSON.stringify(editor.document) (BlockNote blocks).
// Older posts created with Tiptap are still plain HTML strings, so return null for those.
export const parseBlogContent = (content?: string | null): PartialBlock[] | null => {
  if (!content) return null

  try {
    const parsed = JSON.parse(content)

    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export const getBlogPlainText = (content?: string | null): string => {
  const blocks = parseBlogContent(content)

  if (!blocks) return (content ?? '').replace(/<[^>]*>/g, '')

  const texts: string[] = []
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk)

      return
    }

    if (node && typeof node === 'object') {
      const item = node as Record<string, unknown>

      if (item.type === 'text' && typeof item.text === 'string') texts.push(item.text)
      Object.values(item).forEach(walk)
    }
  }

  walk(blocks)

  return texts.join(' ')
}

export const getBlogReadTime = (content?: string | null) => Math.ceil(getBlogPlainText(content).length / 200) || 1
