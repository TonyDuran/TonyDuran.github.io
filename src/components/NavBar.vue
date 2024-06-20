<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    required: true
  }
})
console.log(props.theme)
const emit = defineEmits(['toggleTheme'])

const isChecked = computed(() => {
  return props.theme === 'dark'
})
</script>

<template>
  <input type="checkbox" id="darkmode-toggle" :checked="isChecked" @click="emit('toggleTheme')" />
  <label id="theme-label" for="darkmode-toggle">
    <img src="/hacker.svg" class="dark" alt="Dark Mode Image" />
    <img src="/too_bright.svg" class="light" alt="Light Mode Image" />
  </label>
</template>

<style>
label#theme-label {
  width: 500px;
  height: 200px;
  position: relative;
  display: block;
  background: #ebebeb;
  border-radius: 200px;
  box-shadow:
    inset 0px 5px 15px rgba(0, 0, 0, 0.4),
    inset 0px -5px 15px rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: 0.3s;
}
label#theme-label:after {
  content: '';
  width: 180px;
  height: 180px;
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(180deg, #FADD63, #d8860b);
  border-radius: 180px;
  box-shadow: 0px 5px 10px rgba(123, 122, 122, 0.2);
  transition: 0.3s;
}
label#theme-label:active::after {
  width: 260px;
}
input {
  width: 0;
  height: 0;
  visibility: hidden;
}

input:checked + label#theme-label {
  background: #aeaaaa;
}
input:checked + label#theme-label:after {
  left: 490px;
  transform: translateX(-100%);
  background: linear-gradient(180deg, #777, #8f8989);
}

label img {
  position: absolute;
  width: 120px;
  top: 40px;
  z-index: 100;
}
label img.light {
  left: 40px;
  transition: 0.3s;
  display: block; /* Default visible */
}

label img.dark {
  left: 340px;
  transition: 0.3s;
  display: none; /* Default hidden */
}

input:checked + label#theme-label img.light {
  display: none;
}

input:checked + label#theme-label img.dark {
  display: block;
}
</style>
