<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  theme: {
    type: String,
    required: true,
  }
})
console.log(props.theme)
const emit = defineEmits(["toggleTheme"]);

const isChecked = computed(() => {
  return props.theme === 'dark';
});

</script>
<template>
    <input type="checkbox" id="darkmode-toggle" :checked="isChecked" @click="emit('toggleTheme')"/>
    <label id="theme-label" for="darkmode-toggle"/>
</template>

<style>
label#theme-label {
  width:500px;
  height:200px;
  position: relative;
  display: block;
  background: #ebebeb;
  border-radius: 200px;
  box-shadow: inset 0px 5px 15px rgba(0,0,0,0.4), inset 0px -5px 15px rgba(255,255,255,0.4);
  cursor: pointer;
  transition: 0.3s;
}
label#theme-label:after {
  content: "";
  width: 180px;
  height: 180px;
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(180deg, #ffcc89, #d8860b);
  border-radius: 180px;
  box-shadow: 0px 5px 10px rgba(0,0,0,0.2);
  transition: 0.3s;
}
input {
  width: 0;
  height: 0;
  visibility: hidden;
}

input:checked + label#theme-label {
  background: #242424;
}
input:checked + label#theme-label:after {
  left: 490px;
  transform: translateX(-100%);
  background: linear-gradient(180deg, #777, #3a3a3a)
}
</style>
