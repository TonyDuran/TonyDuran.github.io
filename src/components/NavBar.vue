<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  theme: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['toggleTheme'])
const router = useRouter()

const isChecked = computed(() => {
  return props.theme === 'light'
})

const isActive = (path: string) => {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="navbar-left">
        <div class="logo">
          <router-link to="/" class="logo-text">&lt;TonyDuran /&gt;</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/" :class="['nav-link', { active: isActive('/') }]">
            home
          </router-link>
          <router-link to="/projects" :class="['nav-link', { active: isActive('/projects') }]">
            projects
          </router-link>
          <router-link to="/thoughts" :class="['nav-link', { active: isActive('/thoughts') }]">
            thoughts
          </router-link>
          <router-link to="/playground" :class="['nav-link', { active: isActive('/playground') }]">
            playground
          </router-link>
        </div>
      </div>
      <div class="navbar-right">
        <div class="theme-toggle-wrapper">
          <input type="checkbox" id="darkmode-toggle" :checked="isChecked" @change="emit('toggleTheme')" />
          <label id="theme-label" for="darkmode-toggle">
            <span class="toggle-icon dark">◐</span>
            <span class="toggle-icon light">◑</span>
          </label>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  background-color: rgba(10, 14, 39, 0.95);
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -1px;
}

.logo-text {
  color: var(--accent-primary);
  transition: all 0.3s ease;
}

.logo-text:hover {
  text-shadow: 0 0 10px var(--accent-primary);
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;
  text-transform: lowercase;
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-link.active {
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-primary), transparent);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.theme-toggle-wrapper {
  position: relative;
}

#theme-label {
  width: 60px;
  height: 30px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid var(--accent-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#theme-label:hover {
  box-shadow: var(--shadow-glow);
}

#theme-label::after {
  content: '';
  width: 24px;
  height: 24px;
  position: absolute;
  background: var(--accent-primary);
  border-radius: 50%;
  transition: all 0.3s ease;
  left: 3px;
}

input[type="checkbox"] {
  display: none;
}

input:checked + #theme-label {
  background: var(--bg-secondary);
}

input:checked + #theme-label::after {
  left: calc(100% - 27px);
}

.toggle-icon {
  position: absolute;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;
}

.toggle-icon.light {
  left: 6px;
  opacity: 1;
  color: var(--accent-tertiary);
}

.toggle-icon.dark {
  right: 6px;
  opacity: 0;
  color: var(--accent-primary);
}

input:checked + #theme-label .toggle-icon.light {
  opacity: 0;
}

input:checked + #theme-label .toggle-icon.dark {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-content {
    padding: 1rem 1.5rem;
    gap: 1rem;
  }

  .navbar-left {
    gap: 1.5rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.8rem;
  }

  .logo-text {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .navbar-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-links {
    gap: 0.75rem;
  }

  .nav-link {
    font-size: 0.75rem;
  }
}
</style>
