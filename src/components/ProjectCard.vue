<script setup lang="ts">
interface Props {
  title: string
  description: string
  tags: string[]
  link?: string
  featured?: boolean
}

defineProps<Props>()
</script>

<template>
  <div :class="['project-card', { featured }]">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <span v-if="featured" class="badge">featured</span>
    </div>
    <p class="card-description">{{ description }}</p>
    <div class="card-tags">
      <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <div class="card-footer">
      <a v-if="link" :href="link" target="_blank" class="card-link">
        explore →
      </a>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.project-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
  transform: translateY(-4px);
}

.project-card.featured {
  border: 2px solid var(--accent-primary);
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(180, 19, 245, 0.1));
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-title {
  margin: 0;
  color: var(--accent-primary);
  font-size: 1.25rem;
}

.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  background: var(--accent-secondary);
  color: var(--bg-primary);
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.card-description {
  color: var(--text-secondary);
  margin: 0;
  flex: 1;
}

.card-tags {
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
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.card-link {
  color: var(--accent-tertiary);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.card-link:hover {
  color: var(--accent-primary);
  transform: translateX(4px);
}
</style>
