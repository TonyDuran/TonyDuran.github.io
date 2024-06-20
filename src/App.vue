<script setup>
import { ref, onMounted } from 'vue';
import NavBar from "@/components/NavBar.vue"
import { useStorage } from "@vueuse/core";

const theme = useStorage("current-theme", "dark");
const isDarkMode = ref(true);

const loadTheme = () => {
  const theme = isDarkMode.value ? 'dark-mode' : 'light-mode';
  removeCurrentTheme();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = `/${theme}.css`;  // Adjusted to load from the public directory
  link.id = 'theme-style';
  document.head.appendChild(link);
};

const removeCurrentTheme = () => {
  const existingLink = document.getElementById('theme-style');
  if (existingLink) {
    document.head.removeChild(existingLink);
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  loadTheme();
};

onMounted(() => {
  loadTheme();
});
</script>

<template>
  <div id="app">
    <label>
      <input type="checkbox" v-model="isDarkMode" @change="toggleTheme" />
      Toggle Light/Dark Mode
    </label>
    <NavBar  :theme="theme" @toggle-theme="toggleTheme" />
    <router-view />
  </div>
</template>
