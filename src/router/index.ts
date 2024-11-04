import { createRouter, createWebHistory } from 'vue-router'
import AboutPage from '../views/AboutPage.vue'

const routes = [
  {
    path: '/',
    name: 'AboutPage',
    component: AboutPage
  },
  {
    path: '/login',
    name: 'Login',
    // Lazy load the login component
    component: () => import('../views/LoginPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
