<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CyberCityScene from '@/components/CyberCityScene.vue'

const router = useRouter()
const isFullscreen = ref(false)
</script>

<template>
  <div class="experiments-page" :class="{ 'fs-mode': isFullscreen }">
    <header v-if="!isFullscreen" class="experiments-header">
      <button class="back-btn" @click="router.push('/')">
        <span class="back-arrow">&larr;</span> Home
      </button>
      <h1 class="page-title">Experiments</h1>
    </header>

    <section class="experiment-card" :class="{ 'fs-card': isFullscreen }">
      <div v-if="!isFullscreen" class="card-header">
        <div>
          <h2 class="experiment-title">Builder vs Breaker</h2>
          <p class="experiment-desc">A cyberpunk cityscape where creation and destruction happen in real time.</p>
        </div>
        <button class="expand-btn" @click="isFullscreen = true">Fullscreen</button>
      </div>

      <div class="scene-container" :class="{ 'fs-scene': isFullscreen }">
        <CyberCityScene />
      </div>

      <button v-if="isFullscreen" class="exit-fs-btn" @click="isFullscreen = false">
        &times; Exit
      </button>
    </section>
  </div>
</template>

<style scoped>
.experiments-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 2;
  padding: 2rem;
}

.experiments-page.fs-mode {
  padding: 0;
  min-height: 0;
}

.experiments-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--accent-primary);
  border-radius: 6px;
  color: var(--accent-primary);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.back-btn:hover {
  background: rgba(0, 255, 255, 0.08);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
}

.back-arrow {
  font-size: 1.1rem;
}

.page-title {
  font-size: 1.5rem;
  color: var(--accent-primary);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  margin: 0;
}

.experiment-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 1000px;
}

.experiment-card.fs-card {
  max-width: none;
  padding: 0;
  border: none;
  border-radius: 0;
  background: none;
  position: fixed;
  inset: 0;
  z-index: 100;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.experiment-title {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.experiment-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.expand-btn {
  padding: 0.4rem 0.9rem;
  border: 1.5px solid var(--accent-secondary);
  border-radius: 6px;
  color: var(--accent-secondary);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.expand-btn:hover {
  background: rgba(255, 0, 255, 0.08);
  box-shadow: 0 0 12px rgba(255, 0, 255, 0.3);
}

.scene-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: #050510;
}

.scene-container.fs-scene {
  aspect-ratio: auto;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
}

.exit-fs-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 110;
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--accent-primary);
  border-radius: 6px;
  color: var(--accent-primary);
  background: rgba(10, 14, 39, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.exit-fs-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
}
</style>
