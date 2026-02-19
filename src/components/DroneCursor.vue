<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDroneCursor } from '@/composables/useDroneCursor'

const router = useRouter()
const { droneX, droneY, isMobile, isLocked, getInnerOrbitPosition, getOuterOrbitPosition } = useDroneCursor()

// --- Inner orbit: social links ---
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/TonyDuran', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/tonyduran1', icon: 'linkedin' },
  { label: 'Email', href: 'mailto:tony-duran@outlook.com', icon: 'email' },
  { label: 'X', href: 'https://x.com/_TonyDuran', icon: 'x' },
]

const innerStyles = computed(() =>
  socialLinks.map((_, i) => {
    const pos = getInnerOrbitPosition(i, socialLinks.length)
    return { transform: `translate(${pos.x}px, ${pos.y}px)` }
  })
)

// --- Outer orbit: nav links ---
const navLinks = [
  { label: 'AI Experiments', route: '/experiments' },
]

const outerStyles = computed(() =>
  navLinks.map((_, i) => {
    const pos = getOuterOrbitPosition(i, navLinks.length)
    return { transform: `translate(${pos.x}px, ${pos.y}px)` }
  })
)

function navigateTo(route: string) {
  router.push(route)
}
</script>

<template>
  <!-- Desktop: dual-orbit drone cursor -->
  <div
    v-if="!isMobile"
    class="drone-cursor"
    :class="{ locked: isLocked }"
    :style="{ transform: `translate(${droneX}px, ${droneY}px)` }"
  >
    <!-- Orbit rings -->
    <div class="orbit-ring inner-ring"></div>
    <div class="orbit-ring outer-ring"></div>
    <div class="center-reticle"></div>

    <div v-if="!isLocked" class="click-hint">click to pin</div>

    <!-- Inner orbit: social links -->
    <a
      v-for="(link, i) in socialLinks"
      :key="link.label"
      :href="link.href"
      :aria-label="link.label"
      target="_blank"
      rel="noopener noreferrer"
      class="orbit-item orbit-link social-link"
      :style="innerStyles[i]"
    >
      <!-- GitHub -->
      <svg v-if="link.icon === 'github'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      <!-- LinkedIn -->
      <svg v-if="link.icon === 'linkedin'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      <!-- Email -->
      <svg v-if="link.icon === 'email'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/></svg>
      <!-- X -->
      <svg v-if="link.icon === 'x'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>

    <!-- Outer orbit: nav links -->
    <button
      v-for="(link, i) in navLinks"
      :key="link.label"
      class="orbit-item orbit-link nav-link"
      :style="outerStyles[i]"
      @click="navigateTo(link.route)"
    >
      {{ link.label }}
    </button>
  </div>

  <!-- Mobile: fixed floating controls -->
  <div v-else class="mobile-controls">
    <div class="mobile-social-row">
      <a href="https://github.com/TonyDuran" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="mobile-link">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>
      <a href="https://linkedin.com/in/tonyduran1" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="mobile-link">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href="mailto:tony-duran@outlook.com" aria-label="Email" class="mobile-link">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/></svg>
      </a>
      <a href="https://x.com/_TonyDuran" target="_blank" rel="noopener noreferrer" aria-label="X" class="mobile-link">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
    <button class="mobile-link nav-btn" @click="navigateTo('/experiments')">Experiments</button>
  </div>
</template>

<style scoped>
.drone-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  will-change: transform;
}

/* --- Orbit rings --- */
.orbit-ring {
  position: absolute;
  border: 1px dashed var(--accent-primary);
  border-radius: 50%;
  opacity: 0.12;
  transition: opacity 0.3s ease, border-style 0.3s ease, box-shadow 0.3s ease;
}

.inner-ring {
  width: 100px;
  height: 100px;
  top: -50px;
  left: -50px;
}

.outer-ring {
  width: 240px;
  height: 240px;
  top: -120px;
  left: -120px;
  border-color: var(--accent-secondary);
  opacity: 0.08;
}

.drone-cursor.locked .orbit-ring {
  border-style: solid;
  opacity: 0.3;
}

.drone-cursor.locked .inner-ring {
  box-shadow: 0 0 12px var(--accent-primary), inset 0 0 12px rgba(0, 255, 255, 0.05);
}

.drone-cursor.locked .outer-ring {
  box-shadow: 0 0 12px var(--accent-secondary), inset 0 0 12px rgba(255, 0, 255, 0.05);
}

/* --- Center dot --- */
.center-reticle {
  position: absolute;
  width: 6px;
  height: 6px;
  top: -3px;
  left: -3px;
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: 0.3;
  box-shadow: 0 0 6px var(--accent-primary);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.drone-cursor.locked .center-reticle {
  opacity: 0.6;
  transform: scale(1.4);
}

/* --- Click hint --- */
.click-hint {
  position: absolute;
  top: -140px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--accent-primary);
  opacity: 0.5;
  white-space: nowrap;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
}

/* --- Orbit items (shared) --- */
.orbit-item {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  pointer-events: none;
  opacity: 0.35;
  transition: opacity 0.3s ease;
}

.drone-cursor.locked .orbit-item {
  pointer-events: auto;
  opacity: 1;
}

/* --- Social links (inner orbit) --- */
.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-top: -17px;
  margin-left: -17px;
  border: 1.5px solid var(--accent-primary);
  border-radius: 50%;
  color: var(--accent-primary);
  background: var(--bg-primary);
  text-decoration: none;
  transition: opacity 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.drone-cursor.locked .social-link:hover {
  box-shadow: 0 0 12px var(--accent-primary);
  color: var(--text-primary);
  border-color: var(--text-primary);
}

/* --- Nav links (outer orbit) --- */
.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  margin-top: -14px;
  margin-left: -42px;
  padding: 0 12px;
  border: 1.5px solid var(--accent-secondary);
  border-radius: 14px;
  color: var(--accent-secondary);
  background: var(--bg-primary);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.drone-cursor.locked .nav-link:hover {
  box-shadow: 0 0 12px var(--accent-secondary);
  color: var(--text-primary);
  border-color: var(--text-primary);
}

/* --- Mobile fallback --- */
.mobile-controls {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.mobile-social-row {
  display: flex;
  gap: 0.5rem;
}

.mobile-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1.5px solid var(--accent-primary);
  border-radius: 50%;
  color: var(--accent-primary);
  background: var(--bg-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.mobile-link:hover {
  box-shadow: 0 0 10px var(--accent-primary);
}

.nav-btn {
  width: auto;
  padding: 0 14px;
  border-radius: 19px;
  border-color: var(--accent-secondary);
  color: var(--accent-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
}

.nav-btn:hover {
  box-shadow: 0 0 10px var(--accent-secondary);
}
</style>
