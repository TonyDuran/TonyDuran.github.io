<script lang="ts" setup>
import ProjectCard from '@/components/ProjectCard.vue'

const projects = [
  {
    id: 1,
    title: 'This Portfolio',
    description: 'A minimalist, cyberpunk-themed portfolio built with Vue 3 and TypeScript. Showcasing my work as both an engineer and security enthusiast.',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Cyberpunk'],
    featured: true
  },
  {
    id: 2,
    title: 'Exploit Development Suite',
    description: 'Collection of exploit development tools and techniques. Currently exploring modern vulnerability classes and bypass methods.',
    tags: ['Security', 'Exploit Dev', 'Python', 'x86-64'],
    featured: false
  },
  {
    id: 3,
    title: 'CTF Solutions',
    description: 'Write-ups and solutions from various CTF competitions. Detailed walkthroughs of interesting challenges and techniques.',
    tags: ['CTF', 'Security', 'Writeups'],
    featured: false
  }
]
</script>

<template>
  <div class="projects-page">
    <section class="projects-hero">
      <div class="container">
        <h1>projects</h1>
        <p class="section-subtitle">
          experiments in security, web development, and everything in between
        </p>
      </div>
    </section>

    <section class="projects-grid">
      <div class="container">
        <div class="grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :title="project.title"
            :description="project.description"
            :tags="project.tags"
            :featured="project.featured"
          />
        </div>
      </div>
    </section>

    <section class="empty-state">
      <div class="container">
        <p class="text-muted">
          more projects coming soon. currently building some cool stuff with Three.js and
          WebAssembly...
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.projects-page {
  width: 100%;
}

.projects-hero {
  padding: 4rem 0;
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.05) 0%,
    rgba(180, 19, 245, 0.05) 100%
  );
  border-bottom: 1px solid var(--border-color);
}

.projects-hero h1 {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
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

.projects-grid {
  padding: 4rem 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.empty-state {
  padding: 4rem 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.empty-state .text-muted {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .projects-hero {
    padding: 2rem 0;
  }

  .projects-hero h1 {
    font-size: 2.5rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
