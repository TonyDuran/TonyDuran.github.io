<script setup lang="ts">
// import { computed } from "vue";

// const props = defineProps({
//   theme: {
//     type: String,
//     required: true,
//   }
// })
const emit = defineEmits(["toggleTheme"]);



// const toggleThemeButton = computed(() => {
//   return props.theme == "light" ? "pi pi-mooon" : "pi pi-sun";
// })
</script>
<template>
  <div class="navbar">
    <span><button @click="emit('toggleTheme')">Hello</button></span>
    <div class="navbar-end">
    </div>
  </div>
</template>
