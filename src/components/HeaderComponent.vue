<template>
  <header class="header">
    <nav>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
      <span v-if="isLoggedIn" class="user-email">{{ userEmail }}</span>
      <button v-if="isLoggedIn" @click="logout">Logout</button>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'HeaderComponent',
  setup() {
    const userStore = useUserStore()
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const userEmail = computed(() => userStore.email)

    const logout = () => {
      userStore.logout()
    }

    return {
      isLoggedIn,
      userEmail,
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

nav {
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
