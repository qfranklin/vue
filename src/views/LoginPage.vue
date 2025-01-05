<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="login-button">Login</button>
        <button type="button" class="password-reset-button" @click="handlePasswordReset">Forgot Password?</button>
      </div>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
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
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
  margin: auto;
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

div {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1rem;
}

button:hover {
  color: #0056b3;
}

.login-button {
  align-self: flex-start;
}

.password-reset-button {
  align-self: flex-end;
  font-size: 0.875rem;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>
