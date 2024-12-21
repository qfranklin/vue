<!-- src/views/Login.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <div>
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required>
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required>
    </div>
    <button type="submit">Login</button>
  </form>
  <p v-if="errorMessage">{{ errorMessage }}</p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const router = useRouter()
    const userStore = useUserStore()

    const handleLogin = async () => {
      try {
        const response = await axios.post('/api/login', {
          email: email.value,
          password: password.value
        })
        console.log('Login successful:', response.data)
        const { token, user_id, is_admin } = response.data
        userStore.login(email.value, token, user_id, is_admin)
        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        errorMessage.value = 'Login failed. Please try again.'
      }
    }

    return {
      email,
      password,
      errorMessage,
      handleLogin
    }
  }
})
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
}

div {
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
