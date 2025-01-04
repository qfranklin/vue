<!-- src/views/Login.vue -->
<template>
  <div>
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
    <button @click="handlePasswordReset">Forgot Password?</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
  </div>
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
    const successMessage = ref('')
    const router = useRouter()
    const userStore = useUserStore()

    const handleLogin = async () => {
      try {
        const response = await axios.post('/api/login', {
          email: email.value,
          password: password.value
        })
        console.log('Login successful:', response.data)
        const { token, user_id, name, is_admin } = response.data
        userStore.login(name, email.value, token, user_id, is_admin)
        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        errorMessage.value = 'Login failed. Please try again.'
      }
    }

    const handlePasswordReset = async () => {
      try {
        const response = await axios.post('/api/password/email', {
          email: email.value
        })
        if (response.status === 200) {
          successMessage.value = 'Password reset email sent. Please check your inbox.'
          errorMessage.value = ''
        } else {
          throw new Error('Failed to send password reset email.')
        }
      } catch (error) {
        errorMessage.value = (error as Error).message
        successMessage.value = ''
      }
    }

    return {
      email,
      password,
      errorMessage,
      successMessage,
      handleLogin,
      handlePasswordReset
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

button:hover {
  background-color: #0056b3;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>
