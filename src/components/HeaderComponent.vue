<template>
  <header class="header">
    <nav class="left-nav">
      <router-link to="/">Home</router-link>
      <router-link to="/products">Glass</router-link>
      <router-link to="/generate-stl">QR Code</router-link>
      <router-link v-if="isAdmin" to="/users">Users</router-link>
    </nav>
    <nav class="right-nav">
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
      <div v-if="isLoggedIn" class="dropdown">
        <span class="user-name">{{ firstName }}</span>
        <div class="dropdown-content">
          <router-link to="/user-details">My Page</router-link>
          <hr />
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

    const logout = () => {
      userStore.logout()
      if (router.currentRoute.value.path === '/admin') {
        router.push('/login')
      }
    }

    return {
      isLoggedIn,
      firstName,
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
  cursor: pointer;
}
.user-name {
  color: #007bff;
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
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown-content a, .dropdown-content button {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}
.dropdown-content hr {
  margin: 0;
  border: 0;
  border-top: 1px solid #ccc;
}
.dropdown-content a:hover, .dropdown-content button:hover {
  background-color: #f1f1f1;
}
</style>
