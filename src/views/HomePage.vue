<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'

const builderRoles = [
  'Software Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Product Engineer'
]

const breakerRoles = [
  'Application Security Engineer',
  'Security Researcher',
  'CTF Player',
  'Malware Developer'
]

const separators = ['and', '&&', '∨', 'or', '||']

const currentBuilderIndex = ref(0)
const currentBreakerIndex = ref(0)
const currentSeparatorIndex = ref(0)
const isBuilderHovered = ref(false)
const isBreakerHovered = ref(false)
const isSeparatorHovered = ref(false)

let builderInterval: ReturnType<typeof setInterval> | null = null
let breakerInterval: ReturnType<typeof setInterval> | null = null
let separatorInterval: ReturnType<typeof setInterval> | null = null

const startBuilderRotation = () => {
  isBuilderHovered.value = true
  if (builderInterval) clearInterval(builderInterval)

  builderInterval = setInterval(() => {
    currentBuilderIndex.value = (currentBuilderIndex.value + 1) % builderRoles.length
  }, 1000)
}

const stopBuilderRotation = () => {
  isBuilderHovered.value = false
  if (builderInterval) {
    clearInterval(builderInterval)
    builderInterval = null
  }
}

const startBreakerRotation = () => {
  isBreakerHovered.value = true
  if (breakerInterval) clearInterval(breakerInterval)

  breakerInterval = setInterval(() => {
    currentBreakerIndex.value = (currentBreakerIndex.value + 1) % breakerRoles.length
  }, 1000)
}

const stopBreakerRotation = () => {
  isBreakerHovered.value = false
  if (breakerInterval) {
    clearInterval(breakerInterval)
    breakerInterval = null
  }
}

const startSeparatorRotation = () => {
  if (separatorInterval) clearInterval(separatorInterval)
  separatorInterval = setInterval(() => {
    currentSeparatorIndex.value = (currentSeparatorIndex.value + 1) % separators.length
  }, 2000)
}

const stopSeparatorRotation = () => {
  if (separatorInterval) {
    clearInterval(separatorInterval)
    separatorInterval = null
  }
}

watch([isBuilderHovered, isBreakerHovered, isSeparatorHovered], () => {
  if (isBuilderHovered.value || isBreakerHovered.value || isSeparatorHovered.value) {
    stopSeparatorRotation()
  } else {
    startSeparatorRotation()
  }
})

onMounted(() => {
  startSeparatorRotation()
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-name">Tony Duran is a</h1>
          <h2 class="hero-title">
            <div class="roles-container">
              <span
                class="role-text builder"
                @mouseenter="startBuilderRotation"
                @mouseleave="stopBuilderRotation"
              >
                <span v-if="!isBuilderHovered">Builder</span>
                <span v-else class="rotating-role">{{ builderRoles[currentBuilderIndex] }}</span>
              </span>
              <span
                class="separator"
                @mouseenter="isSeparatorHovered = true"
                @mouseleave="isSeparatorHovered = false"
              >
                {{ separators[currentSeparatorIndex] }}
              </span>
              <span
                class="role-text breaker"
                @mouseenter="startBreakerRotation"
                @mouseleave="stopBreakerRotation"
              >
                <span v-if="!isBreakerHovered">Breaker</span>
                <span v-else class="rotating-role">{{ breakerRoles[currentBreakerIndex] }}</span>
              </span>
            </div>
          </h2>
          <div class="hero-cta">
            <router-link to="/projects" class="btn">explore projects</router-link>
            <router-link to="/thoughts" class="btn btn-secondary">read thoughts</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container">
        <h2>about</h2>
        <div class="about-grid">
          <div class="about-card">
            <h3><span class="accent-primary">→</span> software engineer</h3>
            <p>
              Full-stack developer with experience in TypeScript, Vue.js, and modern web
              architectures. Passionate about clean code and scalable systems.
            </p>
          </div>
          <div class="about-card">
            <h3><span class="accent-secondary">→</span> security hobbyist</h3>
            <p>
              CTF competitor and exploit development enthusiast. Exploring vulnerabilities,
              writing exploits, and learning the darker arts of security.
            </p>
          </div>
          <div class="about-card">
            <h3><span class="accent-tertiary">→</span> always learning</h3>
            <p>
              Currently exploring Three.js, WebAssembly, and advanced exploit techniques.
              Believer in continuous growth and hands-on experimentation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Projects Section -->
    <section class="latest-projects">
      <div class="container">
        <div class="section-header">
          <h2>latest projects</h2>
          <router-link to="/projects" class="view-all">view all →</router-link>
        </div>
        <p class="section-intro">
          selected works showcasing my journey as both an engineer and security enthusiast
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* Hero Section */
.hero {
  padding: 6rem 0;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.08) 0%,
    rgba(255, 0, 255, 0.08) 100%
  );
  border-bottom: 2px solid var(--accent-primary);
  box-shadow: inset 0 0 30px rgba(0, 255, 255, 0.05);
}

.hero-content {
  display: flex;
  align-items: center;
  min-height: 800px;
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

.hero-title {
  margin: 2rem 0;
  line-height: 1.2;
  letter-spacing: -2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-name {
  font-size: 6rem;
  margin-bottom: 3rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
}

.roles-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.role-text {
  display: inline-block;
  transition: all 0.5s ease;
  white-space: nowrap;
}

.role-text span {
  font-size: 5.8rem;
  font-weight: 700;
}

.rotating-role {
  font-size: 3.8rem !important;
}

.role-text.builder {
  color: var(--accent-primary);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  width: 700px;
  text-align: right;
}

.role-text.builder:hover {
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
}

.role-text.breaker {
  color: var(--accent-secondary);
  text-shadow: 0 0 8px rgba(255, 0, 255, 0.3);
  width: 700px;
  text-align: left;
}

.role-text.breaker:hover {
  text-shadow: 0 0 15px rgba(255, 0, 255, 0.6);
}

.separator {
  display: inline-block;
  margin: 0 1.5rem;
  color: var(--text-secondary);
  font-size: 5.5rem;
  font-weight: 700;
}


.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border: 2px solid var(--accent-primary);
  color: var(--accent-primary);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: lowercase;
  display: inline-block;
}

.btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  border-color: var(--accent-secondary);
  color: var(--accent-secondary);
}

.btn-secondary:hover {
  background: var(--accent-secondary);
  box-shadow: 0 0 20px rgba(180, 19, 245, 0.4);
}

/* About Section */
.about {
  padding: 4rem 0;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.about-card {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--accent-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1), inset 0 0 15px rgba(0, 255, 255, 0.05);
}

.about-card:hover {
  border-color: var(--accent-secondary);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), 0 0 20px rgba(255, 0, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1);
  transform: translateY(-4px);
}

.about-card h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--accent-primary);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.about-card p {
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Latest Projects Section */
.latest-projects {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.view-all {
  color: var(--accent-tertiary);
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(255, 255, 0, 0.3);
}

.view-all:hover {
  color: var(--accent-primary);
  transform: translateX(4px);
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.section-intro {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 0;
  }

  .hero-content {
    min-height: 300px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

