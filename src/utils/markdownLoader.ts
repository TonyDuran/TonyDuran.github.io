import { marked } from 'marked'

export interface ContentMetadata {
  title: string
  date: string
  category: string
  excerpt?: string
  slug: string
}

export interface ContentFile {
  metadata: ContentMetadata
  content: string
  html: string
}

// Parse frontmatter from markdown
export function parseFrontmatter(content: string): {
  metadata: Record<string, string>
  body: string
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { metadata: {}, body: content }
  }

  const metadataString = match[1]
  const body = match[2]
  const metadata: Record<string, string> = {}

  metadataString.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts) {
      metadata[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '')
    }
  })

  return { metadata, body }
}

// Process markdown content
export async function processMarkdown(content: string, basePath: string): Promise<string> {
  let html = await marked(content)

  // Rewrite image paths to be relative to the markdown file location
  // Convert ![alt](image.png) to ![alt](/src/content/thoughts/category/slug/images/image.png)
  html = html.replace(
    /src="(?!(?:https?:|\/))([^"]+)"/g,
    `src="${basePath}/$1"`
  )

  return html
}

// Load a markdown file by path
export async function loadMarkdownFile(filePath: string): Promise<ContentFile> {
  const response = await fetch(filePath)
  const text = await response.text()
  const { metadata, body } = parseFrontmatter(text)

  // Extract directory for image path resolution
  const pathParts = filePath.split('/')
  pathParts.pop() // Remove filename
  const basePath = pathParts.join('/')

  const html = await processMarkdown(body, basePath)

  return {
    metadata: {
      title: metadata.title || 'Untitled',
      date: metadata.date || new Date().toISOString().split('T')[0],
      category: metadata.category || 'thoughts',
      excerpt: metadata.excerpt,
      slug: metadata.slug || '',
    },
    content: body,
    html,
  }
}
