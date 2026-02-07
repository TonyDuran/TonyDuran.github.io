<script lang="ts" setup>
</script>

<template>
  <div class="playground-page">
    <section class="playground-hero">
      <div class="container">
        <h1>playground</h1>
        <p class="section-subtitle">
          interactive experiments with Three.js, WebAssembly, and cutting-edge web technologies
        </p>
      </div>
    </section>

    <section class="playground-content">
      <div class="container">
        <div class="empty-state">
          <div class="empty-icon">◆</div>
          <h2>coming soon</h2>
          <p class="text-muted">
            building interactive experiences with Three.js and WebAssembly. stay tuned for
            some cool stuff.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.playground-page {
  width: 100%;
}

.playground-hero {
  padding: 4rem 0;
  background: linear-gradient(
    135deg,
    rgba(255, 214, 10, 0.05) 0%,
    rgba(0, 217, 255, 0.05) 100%
  );
  border-bottom: 1px solid var(--border-color);
}

.playground-hero h1 {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent-tertiary), var(--accent-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0;
}

.playground-content {
  padding: 8rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--accent-primary);
  margin-bottom: 1rem;
  display: block;
  animation: pulse 2s ease-in-out infinite;
}

.empty-state h2 {
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.empty-state .text-muted {
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .playground-hero {
    padding: 2rem 0;
  }

  .playground-hero h1 {
    font-size: 2.5rem;
  }

  .playground-content {
    padding: 4rem 0;
  }

  .empty-icon {
    font-size: 2.5rem;
  }
}
</style>
