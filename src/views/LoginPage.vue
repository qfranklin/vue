<!-- src/views/Login.vue -->
<template>
  <div>
    <HeaderComponent />
    <div class="main-content">
      <h1>Login Page</h1>
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'LoginPage',
  components: {
    HeaderComponent
  },
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
        const { token, is_admin } = response.data
        userStore.login(email.value, token, is_admin)
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
.main-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}
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
