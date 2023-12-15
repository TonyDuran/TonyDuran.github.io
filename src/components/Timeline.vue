<script setup lang="ts">
import { ref } from "vue";
import  TimelineItem from "./TimelineItem.vue"
import { usePosts } from "@/stores/posts";
import { periods } from "../constants"


const postsStore = usePosts()

const selectedPeriod = ref("Today");

//slowing the site just to test <Suspense>
// await postsStore.fetchPosts()

</script>

<template>
  <nav class="is-primary panel">
    <span class="panel-tabs">
      <a v-for="period of periods" :key="period" :class="{ 'is-active': period === selectedPeriod }"
        @click="postsStore.setSelectedPeriod(period)">
        {{ period }}
      </a>
    </span>
    <TimelineItem
      v-for="post of postsStore.filteredPosts"
      :key="post.id"
      :post="post"
      />

  </nav>
</template>
