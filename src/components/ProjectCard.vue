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
  border: 2px solid var(--accent-primary);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05);
}

.project-card:hover {
  border-color: var(--accent-secondary);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.4), 0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 15px rgba(0, 255, 255, 0.1);
  transform: translateY(-4px);
}

.project-card.featured {
  border: 2px solid var(--accent-secondary);
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
  box-shadow: 0 0 25px rgba(255, 0, 255, 0.3), inset 0 0 15px rgba(255, 0, 255, 0.05);
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
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  background: var(--accent-secondary);
  color: #000;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
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
  background: rgba(0, 255, 255, 0.05);
  color: var(--accent-primary);
  border-radius: 4px;
  border: 1px solid var(--accent-primary);
  transition: all 0.2s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.tag:hover {
  background: rgba(0, 255, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
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
