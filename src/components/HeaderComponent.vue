<template>
  <header class="header">
    <nav class="left-nav">
      <router-link to="/">Glass</router-link>
      <router-link v-if="isAdmin" to="/users">Users</router-link>
      <router-link v-if="isLoggedIn" to="/test">Test</router-link>
    </nav>
    <nav class="right-nav">
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
      <div v-if="isLoggedIn" class="dropdown">
        <span class="user-name">{{ firstName }}</span>
        <div class="dropdown-content">
          <router-link :to="`/user/${userId}`">My Page</router-link>
          <button @click="logout">Logout</button>
        </div>
      </div>
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
    const firstName = computed(() => userStore.name.split(' ')[0])
    const isAdmin = computed(() => userStore.isAdmin)
    const userId = computed(() => userStore.userId)

    const logout = () => {
      userStore.logout()
      router.push('/login')
    }

    return {
      isLoggedIn,
      firstName,
      isAdmin,
      userId,
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
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.05); /* Translucent background */
  backdrop-filter: blur(10px); /* Glass effect */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow */
}

.left-nav, .right-nav {
  display: flex;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  color: #ffffff;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.user-name {
  color: #ffffff;
  cursor: pointer;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 8px;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content a, .dropdown-content button {
  color: #ffffff;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dropdown-content a:hover, .dropdown-content button:hover {
  background-color: rgba(0, 191, 255, 0.2);
  border-radius: 8px;
}

</style>
