<script setup lang="ts">
import { type TimelinePost } from "../posts";
defineProps<{
  post: TimelinePost
}>()
</script>
<template>
  <a class="panel-block is-flex-direction-column is-align-items-flex-start">
    <a>{{ post.title }}</a>
    <div>
      {{ post.created.toFormat("d MMM")}}
    </div>

  </a>
</template>

