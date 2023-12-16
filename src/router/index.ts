import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import NewPost from '@/views/NewPost.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      //TODO: Move learning app to a separate path & start portfolio layout
      path: '/',
     name: 'home',
      component: Home
    },
    {
      path: '/posts/new',
      component: NewPost
    },
  ]
})

export default router
