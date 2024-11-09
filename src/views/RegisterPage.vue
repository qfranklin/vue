<template>
  <div>
    <h1>Register Page</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const username = ref('')
    const password = ref('')
    const email = ref('')

    const handleRegister = async () => {
      try {
        const response = await axios.post('/api/register', {
          username: username.value,
          password: password.value,
          email: email.value
        })
        console.log('Registration successful:', response.data)
        // Handle successful registration (e.g., redirect to a different page)
      } catch (error) {
        console.error('Registration failed:', error)
        // Handle registration error
      }
    }

    return {
      username,
      password,
      email,
      handleRegister
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
