<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';
import '@/assets/main.css';
import SpiralBackground from '@/components/SpiralBackground.vue';
import CyberpunkOverlay from '@/components/CyberpunkOverlay.vue';
import DroneCursor from '@/components/DroneCursor.vue';

const theme = ref("dark");

provide('theme', theme);
provide('toggleTheme', toggleTheme);

onMounted(() => {
  const saved = localStorage.getItem("current-theme") || "dark";
  theme.value = saved;
  applyTheme(saved);
});

function applyTheme(themeValue: string) {
  const root = document.documentElement;

  // Switch the CSS file link to load the correct theme defaults
  const themeLink = document.getElementById('theme') as HTMLLinkElement | null;
  if (themeLink) {
    themeLink.href = themeValue === 'light' ? '/light-mode.css' : '/dark-mode.css';
  }

  if (themeValue === 'light') {
    root.style.setProperty('--bg-primary', '#fdf0d5');
    root.style.setProperty('--bg-secondary', '#f5e4c0');
    root.style.setProperty('--bg-tertiary', '#ebd8aa');
    root.style.setProperty('--text-primary', '#2a1f0e');
    root.style.setProperty('--text-secondary', '#5a4a2e');
    root.style.setProperty('--text-muted', '#8a7a5e');
    root.style.setProperty('--accent-primary', '#007a8a');
    root.style.setProperty('--accent-secondary', '#b8336a');
    root.style.setProperty('--accent-tertiary', '#cc8800');
    root.style.setProperty('--accent-danger', '#cc2244');
    root.style.setProperty('--border-color', 'rgba(0, 122, 138, 0.25)');
    root.style.setProperty('--shadow-glow', '0 0 20px rgba(0, 122, 138, 0.15)');
    root.style.setProperty('--hero-grad-1', '#007a8a');
    root.style.setProperty('--hero-grad-2', '#b8336a');
    root.style.setProperty('--hero-grad-3', '#cc8800');
    root.style.setProperty('--hero-grad-4', '#007a8a');
    root.style.setProperty('--hero-glow', 'rgba(0, 122, 138, 0.4)');
    root.style.setProperty('--glitch-color-1', 'rgba(0, 122, 138, 0.3)');
    root.style.setProperty('--glitch-color-2', 'rgba(184, 51, 106, 0.3)');
    root.style.setProperty('--scanline-color', 'rgba(90, 70, 30, 0.02)');
    root.style.setProperty('--vignette-color', 'rgba(200, 180, 140, 0.3)');
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
    root.style.setProperty('--hero-grad-1', '#00ffff');
    root.style.setProperty('--hero-grad-2', '#ff00ff');
    root.style.setProperty('--hero-grad-3', '#ffff00');
    root.style.setProperty('--hero-grad-4', '#00ffff');
    root.style.setProperty('--hero-glow', 'rgba(0, 255, 255, 0.5)');
    root.style.setProperty('--glitch-color-1', 'rgba(0, 255, 255, 0.5)');
    root.style.setProperty('--glitch-color-2', 'rgba(255, 0, 255, 0.5)');
    root.style.setProperty('--scanline-color', 'rgba(0, 255, 255, 0.03)');
    root.style.setProperty('--vignette-color', 'rgba(0, 0, 0, 0.5)');
  }
}

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("current-theme", theme.value);
  applyTheme(theme.value);
}
</script>

<template>
  <div id="app">
    <SpiralBackground :theme="theme" />
    <CyberpunkOverlay />
    <main>
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <DroneCursor />
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

/* Route transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
