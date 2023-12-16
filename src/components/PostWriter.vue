<script lang="ts" setup>
import { type TimelinePost } from '../posts';
import { ref } from 'vue';

const props = defineProps<{
  post: TimelinePost
}>()

const title = ref(props.post.title);
const content = ref(props.post.markdown);
const contentEditable = ref<HTMLDivElement>();

function handleInput() {
  if (!contentEditable.value){
    throw Error("contentEditable DOM node was not found");
  }
  content.value = contentEditable.value?.innerText

}
</script>
<template>
  <div class="columns">
    <div class="column">
      <div class="field">
        <div class="label">Post title</div>
        <input type="text" class="input" v-model="title">
      </div>
    </div>
  </div>

  <div class="columns">
    <div class="column">
      <div contenteditable ref="contentEditable" @input="handleInput">
        {{ content }}
      </div>

    </div>
    <div class="column">
        {{ content }}
    </div>
  </div>
</template>
