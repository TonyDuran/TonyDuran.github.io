import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import Projects from '@/views/ProjectsView.vue'
import Thoughts from '@/views/ThoughtsView.vue'
import Playground from '@/views/PlaygroundView.vue'
import MarkdownView from '@/views/MarkdownView.vue'

const routes = [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    },
    {
      path: '/thoughts',
      name: 'thoughts',
      component: Thoughts
    },
    {
      path: '/thoughts/:category/:slug',
      name: 'markdown',
      component: MarkdownView
    },
    {
      path: '/playground',
      name: 'playground',
      component: Playground
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
  const routeExists = routes.some(route => {
    if (route.path === to.path) return true
    // Check if it matches a dynamic route pattern
    if (route.path === '/thoughts/:category/:slug' && to.path.startsWith('/thoughts/')) {
      return true
    }
    return false
  });
  if (!routeExists) {
    next({ path: '/', replace: true });
  } else {
    next();
  }
});

export default router;
