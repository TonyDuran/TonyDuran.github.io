<script setup lang="ts">
import { onMounted, ref } from 'vue';
import NavBar from "@/components/NavBar.vue"
import '@/assets/main.css';

const LIGHT_THEME = "/light-mode.css"
const DARK_THEME = "/dark-mode.css"

const theme = ref("dark");

onMounted(() => {
  const saved = localStorage.getItem("current-theme") || "dark";
  theme.value = saved;
  applyTheme(saved);
});

function applyTheme(themeValue: string) {
  const root = document.documentElement;

  if (themeValue === 'light') {
    root.style.setProperty('--bg-primary', '#f5f3ff');
    root.style.setProperty('--bg-secondary', '#ede9ff');
    root.style.setProperty('--bg-tertiary', '#e6e1ff');
    root.style.setProperty('--text-primary', '#1a1a2e');
    root.style.setProperty('--text-secondary', '#5a5a7a');
    root.style.setProperty('--text-muted', '#8a8aaa');
    root.style.setProperty('--accent-primary', '#0099cc');
    root.style.setProperty('--accent-secondary', '#9d00ff');
    root.style.setProperty('--accent-tertiary', '#ffd60a');
    root.style.setProperty('--accent-danger', '#ff0055');
    root.style.setProperty('--border-color', 'rgba(157, 0, 255, 0.2)');
    root.style.setProperty('--shadow-glow', '0 0 20px rgba(157, 0, 255, 0.15)');
  } else {
    root.style.setProperty('--bg-primary', '#0a0e27');
    root.style.setProperty('--bg-secondary', '#1a1f3a');
    root.style.setProperty('--bg-tertiary', '#2a2f4a');
    root.style.setProperty('--text-primary', '#e0e6ff');
    root.style.setProperty('--text-secondary', '#a0a6d2');
    root.style.setProperty('--text-muted', '#707099');
    root.style.setProperty('--accent-primary', '#00d9ff');
    root.style.setProperty('--accent-secondary', '#b413f5');
    root.style.setProperty('--accent-tertiary', '#ffd60a');
    root.style.setProperty('--accent-danger', '#ff0055');
    root.style.setProperty('--border-color', 'rgba(0, 217, 255, 0.2)');
    root.style.setProperty('--shadow-glow', '0 0 20px rgba(0, 217, 255, 0.3)');
  }

  console.log("Applied theme:", themeValue);
}

function toggleTheme() {
  console.log("Toggle clicked. Current theme:", theme.value);
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("current-theme", theme.value);
  applyTheme(theme.value);
  console.log("New theme:", theme.value);
}
</script>

<template>
  <div id="app">
    <NavBar :theme="theme" @toggleTheme="toggleTheme" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
