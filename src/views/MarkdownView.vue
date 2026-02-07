<script lang="ts" setup>
import { useRoute } from 'vue-router'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

const route = useRoute()
const category = route.params.category as string
const slug = route.params.slug as string

// Construct the markdown file path
const filePath = `/src/content/thoughts/${category}/${slug}/index.md`
</script>

<template>
  <div class="markdown-page">
    <section class="markdown-section">
      <div class="container">
        <MarkdownViewer :filePath="filePath" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.markdown-page {
  width: 100%;
}

.markdown-section {
  padding: 4rem 0;
}

@media (max-width: 768px) {
  .markdown-section {
    padding: 2rem 0;
  }
}
</style>
