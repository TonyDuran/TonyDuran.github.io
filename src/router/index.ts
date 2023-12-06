import { createRouter, createWebHistory } from 'vue-router'
// import { Timeline } from './views/TimelineView.vue'

const router = createRouter({
  history: createWebHistory("/TonyDuran.github.io/"),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: 
    // },
    // {
    //   path: '/TonyDuran.github.io/',
    //   name: 'Home',
    //   component: Timeline
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
