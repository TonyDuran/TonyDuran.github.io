<script lang="ts" setup>
const thoughts = [
  {
    id: 1,
    title: 'Understanding Stack Overflow Exploitation',
    category: 'exploit-dev',
    date: '2025-12-15',
    excerpt: 'Deep dive into classic stack overflow techniques and modern mitigations.',
    tags: ['Exploit Dev', 'Memory Safety', 'x86-64']
  },
  {
    id: 2,
    title: 'CTF Writeup: HackTheBox Challenge',
    category: 'ctf',
    date: '2025-11-20',
    excerpt: 'Complete walkthrough of an interesting web-based CTF challenge with live exploitation.',
    tags: ['CTF', 'Web Security', 'Writeup']
  },
  {
    id: 3,
    title: 'Thoughts on Modern Web Security',
    category: 'thoughts',
    date: '2025-10-10',
    excerpt: 'Reflections on the evolving landscape of web vulnerabilities and defensive strategies.',
    tags: ['Security', 'Web Dev', 'Opinion']
  }
]

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'exploit-dev': 'accent-tertiary',
    'ctf': 'accent-primary',
    'thoughts': 'accent-secondary'
  }
  return colors[category] || 'accent-primary'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'exploit-dev': 'Exploit Dev',
    'ctf': 'CTF Writeup',
    'thoughts': 'Thoughts'
  }
  return labels[category] || category
}
</script>

<template>
  <div class="thoughts-page">
    <section class="thoughts-hero">
      <div class="container">
        <h1>thoughts & writeups</h1>
        <p class="section-subtitle">
          exploring vulnerabilities, exploits, and security concepts
        </p>
      </div>
    </section>

    <section class="thoughts-list">
      <div class="container">
        <div v-if="thoughts.length > 0" class="thoughts-grid">
          <article v-for="thought in thoughts" :key="thought.id" class="thought-card">
            <div class="card-top">
              <div class="card-meta">
                <span :class="['category-badge', getCategoryColor(thought.category)]">
                  {{ getCategoryLabel(thought.category) }}
                </span>
                <span class="date text-muted">{{ thought.date }}</span>
              </div>
              <h3 class="thought-title">{{ thought.title }}</h3>
            </div>

            <p class="thought-excerpt">{{ thought.excerpt }}</p>

            <div class="thought-tags">
              <span v-for="tag in thought.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>

            <div class="card-footer">
              <a href="#" class="read-more">read more →</a>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <p class="text-muted">thoughtful content coming soon...</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.thoughts-page {
  width: 100%;
}

.thoughts-hero {
  padding: 4rem 0;
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.05) 0%,
    rgba(180, 19, 245, 0.05) 100%
  );
  border-bottom: 1px solid var(--border-color);
}

.thoughts-hero h1 {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
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

.thoughts-list {
  padding: 4rem 0;
}

.thoughts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.thought-card {
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.thought-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
  transform: translateY(-4px);
}

.card-top {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.category-badge.accent-primary {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.category-badge.accent-secondary {
  color: var(--accent-secondary);
  border-color: var(--accent-secondary);
}

.category-badge.accent-tertiary {
  color: var(--accent-tertiary);
  border-color: var(--accent-tertiary);
}

.date {
  font-size: 0.85rem;
}

.thought-title {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.thought-excerpt {
  color: var(--text-secondary);
  margin: 0;
  flex: 1;
  line-height: 1.8;
}

.thought-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.read-more {
  color: var(--accent-tertiary);
  font-weight: 600;
  transition: all 0.3s ease;
}

.read-more:hover {
  color: var(--accent-primary);
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

@media (max-width: 768px) {
  .thoughts-hero {
    padding: 2rem 0;
  }

  .thoughts-hero h1 {
    font-size: 2.5rem;
  }

  .thoughts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
