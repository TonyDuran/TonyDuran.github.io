import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
    {
      path: '/',
      name: 'home',
      component: Home
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

router.beforeEach((to, from, next) => {

  const routeExists = routes.some(route => route.path === to.path);
  if (!routeExists) {
    // document.title = 'Home'; //examples on how to set the chrome tab title
    next({ path: '/', replace: true });
  } else {
    // document.title = to.meta.title as string || 'The Portfolio';
    next();
  }
});

export default router;
