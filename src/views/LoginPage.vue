<!-- src/views/Login.vue -->
<template>
  <div>
    <h1>Login Page</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" v-model="username">
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" v-model="password">
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const username = ref('')
    const password = ref('')

    const handleLogin = async () => {
      try {
        const response = await axios.post('/api/login', {
          username: username.value,
          password: password.value
        })
        console.log('Login successful:', response.data)
        // Handle successful login (e.g., redirect to a different page)
      } catch (error) {
        console.error('Login failed:', error)
        // Handle login error
      }
    }

    return {
      username,
      password,
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
