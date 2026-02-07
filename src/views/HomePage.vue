<script lang="ts" setup>
import { inject, ref, onMounted, onUnmounted, type Ref } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SkillGraph from '@/components/SkillGraph.vue'

const theme = inject<Ref<string>>('theme', ref('dark'))
const toggleTheme = inject<() => void>('toggleTheme', () => {})

const builderRoles = [
  'Software Engineer',
  'Product Engineer',
  'Full-Stack Developer',
  'DevOps Engineer',
  'Cloud Engineer',
]

const breakerRoles = [
  'Application Security Engineer',
  'Security Researcher',
  'CTF Player',
  'Malware Developer'
]

const isBuilderExpanded = ref(false)
const isBreakerExpanded = ref(false)

// Scroll-reveal for about section
const aboutRef = ref<HTMLElement | null>(null)
const aboutVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (aboutRef.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) aboutVisible.value = true
      },
      { threshold: 0.15 },
    )
    observer.observe(aboutRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-name" data-text="Tony Duran">Tony Duran</h1>

          <h2 class="hero-identity">
            <div class="identity-columns">
              <div
                class="identity-col"
                @mouseenter="isBuilderExpanded = true"
                @mouseleave="isBuilderExpanded = false"
              >
                <span class="identity-word builder">Builder</span>
                <div class="role-list" :class="{ expanded: isBuilderExpanded }">
                  <span
                    v-for="(role, i) in builderRoles"
                    :key="role"
                    class="role-item builder-role"
                    :style="{ transitionDelay: `${i * 70}ms` }"
                  >{{ role }}</span>
                </div>
              </div>

              <span class="separator">//</span>

              <div
                class="identity-col"
                @mouseenter="isBreakerExpanded = true"
                @mouseleave="isBreakerExpanded = false"
              >
                <span class="identity-word breaker">Breaker</span>
                <div class="role-list" :class="{ expanded: isBreakerExpanded }">
                  <span
                    v-for="(role, i) in breakerRoles"
                    :key="role"
                    class="role-item breaker-role"
                    :style="{ transitionDelay: `${i * 70}ms` }"
                  >{{ role }}</span>
                </div>
              </div>
            </div>
          </h2>

          <div class="theme-toggle-area">
            <ThemeToggle :theme="theme" @toggle="toggleTheme" />
          </div>
        </div>
      </div>
    </section>

    <section ref="aboutRef" class="about-section" :class="{ visible: aboutVisible }">
      <div class="about-container">
        <div class="about-text">
          <h2 class="section-title">About</h2>
          <p class="about-tagline">The stack behind the segfaults.</p>
          <p class="about-bio">
            Security Software Engineer from Texas, currently pursuing a Masters at
            Georgia Tech (OMSCS). I build systems by day and find ways to break them
            at night — shipping segfaults since the beginning.
          </p>
        </div>
        <div class="about-graph">
          <SkillGraph />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  position: relative;
  z-index: 2;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-text {
  max-width: 1200px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --- Name --- */
.hero-name {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(90deg, var(--hero-grad-1), var(--hero-grad-2), var(--hero-grad-3), var(--hero-grad-4));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px var(--hero-glow));
  position: relative;
}

/* --- Identity line: Builder // Breaker --- */
.hero-identity {
  margin: 0 0 2.5rem;
  line-height: 1.2;
}

.identity-columns {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
}

.identity-col {
  position: relative;
  cursor: default;
  padding: 0.5rem 0.25rem;
}

.identity-word {
  font-size: 4.5rem;
  font-weight: 700;
  letter-spacing: -1px;
  position: relative;
  display: inline-block;
}

/* Subtle pulsing underline — hints interactivity */
.identity-word::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 10%;
  width: 80%;
  height: 2px;
  background: currentColor;
  opacity: 0.2;
  animation: hint-pulse 3s ease-in-out infinite;
}

.identity-col:hover .identity-word::after {
  opacity: 0.5;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

.identity-word.builder {
  color: var(--accent-primary);
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.identity-word.breaker {
  color: var(--accent-secondary);
  text-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
}

.separator {
  font-size: 4.5rem;
  font-weight: 300;
  color: var(--text-muted);
  margin: 0 1.25rem;
  padding-top: 0.5rem;
  user-select: none;
  opacity: 0.5;
}

/* --- Role list (expands below each word) --- */
.role-list {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding-top: 0.75rem;
  white-space: nowrap;
}

.role-item {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.role-list.expanded .role-item {
  opacity: 1;
  transform: translateY(0);
}

.builder-role {
  color: var(--accent-primary);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
}

.breaker-role {
  color: var(--accent-secondary);
  text-shadow: 0 0 8px rgba(255, 0, 255, 0.2);
}

/* --- Theme toggle near identity --- */
.theme-toggle-area {
  margin-top: 1.5rem;
}

/* --- Glitch effect on name — subtle, intermittent --- */
.hero-name::before,
.hero-name::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0;
}

.hero-name::before {
  -webkit-text-fill-color: var(--glitch-color-1, rgba(0, 255, 255, 0.5));
  animation: glitch-1 8s infinite linear;
}

.hero-name::after {
  -webkit-text-fill-color: var(--glitch-color-2, rgba(255, 0, 255, 0.5));
  animation: glitch-2 8s infinite linear;
}

@keyframes glitch-1 {
  0%, 28%, 32%, 68%, 72%, 100% {
    clip-path: inset(50% 0 50% 0);
    transform: translate(0, 0);
    opacity: 0;
  }
  29% {
    clip-path: inset(20% 0 60% 0);
    transform: translate(-1px, 0);
    opacity: 0.6;
  }
  30% {
    clip-path: inset(70% 0 10% 0);
    transform: translate(1px, 0);
    opacity: 0.6;
  }
  31% {
    clip-path: inset(40% 0 50% 0);
    transform: translate(-1px, 0);
    opacity: 0.4;
  }
  69% {
    clip-path: inset(10% 0 80% 0);
    transform: translate(1px, 0);
    opacity: 0.5;
  }
  70% {
    clip-path: inset(60% 0 20% 0);
    transform: translate(-1px, 0);
    opacity: 0.5;
  }
  71% {
    clip-path: inset(30% 0 60% 0);
    transform: translate(1px, 0);
    opacity: 0.3;
  }
}

@keyframes glitch-2 {
  0%, 28%, 32%, 68%, 72%, 100% {
    clip-path: inset(50% 0 50% 0);
    transform: translate(0, 0);
    opacity: 0;
  }
  29% {
    clip-path: inset(60% 0 20% 0);
    transform: translate(1px, 0);
    opacity: 0.5;
  }
  30% {
    clip-path: inset(15% 0 70% 0);
    transform: translate(-1px, 0);
    opacity: 0.5;
  }
  31% {
    clip-path: inset(50% 0 30% 0);
    transform: translate(1px, 0);
    opacity: 0.3;
  }
  69% {
    clip-path: inset(80% 0 5% 0);
    transform: translate(-1px, 0);
    opacity: 0.6;
  }
  70% {
    clip-path: inset(25% 0 55% 0);
    transform: translate(1px, 0);
    opacity: 0.6;
  }
  71% {
    clip-path: inset(45% 0 40% 0);
    transform: translate(-1px, 0);
    opacity: 0.4;
  }
}

/* --- About Section --- */
.about-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.about-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.about-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, var(--hero-grad-1), var(--hero-grad-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-tagline {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
  letter-spacing: 0.5px;
}

.about-bio {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0;
}

.about-graph {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .hero-name {
    font-size: 3rem;
  }

  .identity-word {
    font-size: 2.5rem;
  }

  .separator {
    font-size: 2.5rem;
    margin: 0 0.5rem;
  }

  /* Always show roles on mobile (no hover) */
  .role-item {
    opacity: 1 !important;
    transform: translateY(0) !important;
    font-size: 0.8rem;
  }

  .about-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .about-section {
    padding: 3rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .about-graph {
    min-height: 300px;
  }
}
</style>
