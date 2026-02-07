<script setup lang="ts">
defineProps<{ theme: string }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="theme-toggle">
    <input
      type="checkbox"
      id="darkmode-toggle"
      :checked="theme === 'light'"
      @change="emit('toggle')"
    />
    <label id="theme-label" for="darkmode-toggle">
      <span class="toggle-icon dark">◐</span>
      <span class="toggle-icon light">◑</span>
    </label>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: inline-block;
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
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.05);
}

#theme-label:hover {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.1);
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
</style>
