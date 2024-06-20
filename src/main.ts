//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/router/index'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

const DARK_THEME = "/dark-mode.css";
const LIGHT_THEME = "/light-mode.css";

function addCss(id: string, fileName: string) {
    const head = document.head;
    const link = document.createElement("link");

    link.id = id;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;

    head.appendChild(link);
}
let theme = DARK_THEME;

if (localStorage.getItem("current-theme") == null){
    localStorage.setItem("current-theme", "dark");
} else if (localStorage.getItem("current-theme") == "light"){
    theme = LIGHT_THEME;
}

addCss("theme", theme);
