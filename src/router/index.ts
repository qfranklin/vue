import { createRouter, createWebHistory } from 'vue-router'
import AboutPage from '../views/AboutPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import AdminPage from '../views/AdminPage.vue'
import ProductsPage from '../views/ProductsPage.vue'
import ProductDetailPage from '../views/ProductDetailPage.vue'
import AddProductPage from '../views/AddProductPage.vue'
import { useUserStore } from '@/stores/user'

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
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsPage
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetailPage
  },
  {
    path: '/products/add',
    name: 'AddProduct',
    component: AddProductPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login' })
    } else if (to.matched.some(record => record.meta.requiresAdmin) && !userStore.isAdmin) {
      next({ name: 'AboutPage' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
