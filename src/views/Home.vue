<script lang="ts" setup>
import Timeline from "../components/Timeline.vue";
</script>

<template>
  <RouterView />
  <Suspense>
    <template #default>
      <Timeline />
    </template>
    <template #fallback>
      <progress class="progress is-primary is-small" />
    </template>
  </Suspense>
</template>
