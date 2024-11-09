import { createRouter, createWebHistory } from 'vue-router'
import AboutPage from '../views/AboutPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'

const routes = [
  {
    path: '/',
    name: 'AboutPage',
    component: AboutPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
