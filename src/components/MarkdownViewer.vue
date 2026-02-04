<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadMarkdownFile } from '@/utils/markdownLoader'

interface Props {
  filePath: string
}

const props = defineProps<Props>()

const html = ref<string>('')
const title = ref<string>('Loading...')
const date = ref<string>('')
const loading = ref(true)
const error = ref<string>('')

onMounted(async () => {
  try {
    const file = await loadMarkdownFile(props.filePath)
    html.value = file.html
    title.value = file.metadata.title
    date.value = file.metadata.date
  } catch (err) {
    error.value = `Failed to load markdown: ${err}`
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <article class="markdown-viewer">
    <div v-if="loading" class="loading">Loading content...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="date" class="metadata">
        <span class="date text-muted">{{ date }}</span>
      </div>
      <div class="markdown-content" v-html="html"></div>
    </div>
  </article>
</template>

<style scoped>
.markdown-viewer {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.error {
  color: var(--accent-danger);
  background: rgba(255, 0, 85, 0.1);
  border-left: 4px solid var(--accent-danger);
  padding: 1rem;
  border-radius: 4px;
}

.metadata {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--accent-primary);
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.1);
}

.date {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
}

.markdown-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Markdown element styling */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 2rem;
  color: var(--accent-primary);
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

.markdown-content h2 {
  font-size: 1.75rem;
  color: var(--accent-secondary);
  border-bottom: 2px solid var(--accent-secondary);
  padding-bottom: 0.5rem;
  text-shadow: 0 0 12px rgba(255, 0, 255, 0.4);
}

.markdown-content h3 {
  font-size: 1.5rem;
  color: var(--accent-tertiary);
  text-shadow: 0 0 10px rgba(255, 255, 0, 0.4);
}

.markdown-content p {
  margin: 1rem 0;
  line-height: 1.8;
}

.markdown-content a {
  color: var(--accent-primary);
  text-decoration: underline;
  transition: all 0.2s ease;
}

.markdown-content a:hover {
  color: var(--accent-secondary);
  text-decoration: none;
}

.markdown-content code {
  background: rgba(0, 0, 0, 0.5) !important;
  color: var(--text-primary) !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 3px !important;
  font-size: 0.9em !important;
  font-family: 'Monaco', 'Menlo', monospace !important;
  border-left: 2px solid var(--accent-primary) !important;
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-left: 3px solid var(--accent-primary);
  border-radius: 6px;
  padding: 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.markdown-content pre code {
  background: none !important;
  color: var(--text-primary) !important;
  padding: 0 !important;
}

.markdown-content pre code * {
  color: var(--text-primary) !important;
}

.markdown-content blockquote {
  border-left: 4px solid var(--accent-primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content li {
  margin: 0.5rem 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.markdown-content th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--accent-primary);
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
}

.markdown-content hr {
  border: none;
  border-top: 2px solid var(--border-color);
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .markdown-content {
    font-size: 1rem;
  }

  .markdown-header h1 {
    font-size: 1.75rem;
  }

  .markdown-content h2 {
    font-size: 1.5rem;
  }

  .markdown-content h3 {
    font-size: 1.25rem;
  }
}
</style>
