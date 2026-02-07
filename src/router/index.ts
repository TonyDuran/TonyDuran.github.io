import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'

const routes = [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/experiments',
      name: 'experiments',
      component: () => import('@/views/ExperimentsPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
