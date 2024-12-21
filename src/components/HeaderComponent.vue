<template>
  <header class="header">
    <nav class="left-nav">
      <router-link to="/">Home</router-link>
      <router-link to="/products">Glass</router-link>
      <router-link v-if="isAdmin" to="/users">Users</router-link>
    </nav>
    <nav class="right-nav">
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
      <span v-if="isLoggedIn" class="user-email">{{ userEmail }}</span>
      <button v-if="isLoggedIn" @click="logout">Logout</button>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'HeaderComponent',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const userEmail = computed(() => userStore.email)
    const isAdmin = computed(() => userStore.isAdmin)

    const logout = () => {
      userStore.logout()
      if (router.currentRoute.value.path === '/admin') {
        router.push('/login')
      }
    }

    return {
      isLoggedIn,
      userEmail,
      isAdmin,
      logout
    }
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.left-nav {
  display: flex;
  gap: 1rem;
}
.right-nav {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}
nav a {
  text-decoration: none;
  color: #007bff;
}
.user-email {
  font-size: 0.8rem;
  margin-right: 1rem;
}
button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
}
</style>
