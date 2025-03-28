import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import AdminPage from '../views/AdminPage.vue'
import ProductsPage from '../views/ProductsPage.vue'
import ProductDetailPage from '../views/ProductDetailPage.vue'
import AddProductPage from '../views/AddProductPage.vue'
import UsersPage from '../views/UsersPage.vue'
import UserDetailsPage from '../views/UserDetailsPage.vue'
import PasswordResetPage from '@/views/PasswordResetPage.vue'
import TestPage from '../views/TestPage.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Products',
    component: ProductsPage
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
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetailPage
  },
  {
    path: '/products/add',
    name: 'AddProduct',
    component: AddProductPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/user/:identifier',
    name: 'UserDetails',
    component: UserDetailsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/password/reset/:token',
    name: 'PasswordReset',
    component: PasswordResetPage
  },
  {
    path: '/test',
    name: 'Test',
    component: TestPage,
    meta: { requiresAuth: true }
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
      next({ name: 'HomePage' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
