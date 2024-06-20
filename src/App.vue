<script setup lang="ts">
import { onBeforeMount, provide } from 'vue';
import NavBar from "@/components/NavBar.vue"
import { useStorage } from "@vueuse/core";

const LIGHT_THEME = "/light-mode.css"
const DARK_THEME = "/dark-mode.css"
const theme = useStorage("current-theme", "dark");

//in case I decide to expand the app. Can make styles available
provide("theme", theme.value);

onBeforeMount(async () => {
  loadTheme();
});

function setLightTheme() {
  const themeElement = document.getElementById("theme");
  themeElement?.setAttribute("href", LIGHT_THEME)
}
function setDarkTheme() {
  const themeElement = document.getElementById("theme");
  themeElement?.setAttribute("href", DARK_THEME)
}

function toggleTheme(){
  if (theme.value == "light"){
    theme.value = "dark";
    setDarkTheme();
  } else {
    theme.value = "dark";
    setLightTheme();
  }
}

function loadTheme() {
  if (theme.value == "light"){
    setDarkTheme();
  } else {
    setDarkTheme();
  }

}

</script>

<template>
  <div id="app">
    <label>
    </label>
    <NavBar  :theme="theme" @toggle-theme="toggleTheme" />
    <router-view />
  </div>
</template>
