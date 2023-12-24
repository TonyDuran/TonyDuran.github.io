<script lang="ts" setup>
import { type TimelinePost } from '../posts';
import { ref, onMounted } from 'vue';
import { marked } from "marked";
import highlightjs from 'highlight.js';

const parsedContent = ref<string>('');

onMounted(async () => {
  try {
    // Replace 'path/to/your/markdownfile.md' with the actual path
    const response = await fetch('/markdownfile.md');
    const markdown = await response.text();
    const options = {
      gfm: true,
      breaks: true,
      highlight: (code: string) => {
          return highlightjs.highlightAuto(code).value;
      }
    }
    if (typeof markdown === 'string'){
      parsedContent.value = await marked.parse(markdown, options );
    } else {
      throw new Error('Fetched data is not a string');
    }
  } catch (error) {
    console.error('Error reading markdown file:', error);
  }
});

</script>
<template>
  <div class="columns">
    <div class="column" v-html="parsedContent">
    </div>
  </div>
</template>
