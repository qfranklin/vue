<template>
  <div>
    <h1>Register Page</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div>
        <label for="password_confirmation">Confirm Password:</label>
        <input type="password" id="password_confirmation" v-model="passwordConfirmation" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div>
        <label for="birthday">birthday:</label>
        <input type="date" id="birthday" v-model="birthday" required>
      </div>
      <button type="submit">Register</button>
    </form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const name = ref('')
    const password = ref('')
    const passwordConfirmation = ref('')
    const email = ref('')
    const birthday = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')

    const handleRegister = async () => {
      try {
        const response = await axios.post('/api/register', {
          name: name.value,
          password: password.value,
          password_confirmation: passwordConfirmation.value,
          email: email.value,
          birthday: birthday.value
        })
        console.log('Registration successful:', response.data)
        successMessage.value = 'Registration successful!'
        errorMessage.value = ''
        // Clear form fields
        name.value = ''
        password.value = ''
        passwordConfirmation.value = ''
        email.value = ''
        birthday.value = ''
      } catch (error) {
        console.error('Registration failed:', error)
        errorMessage.value = 'Registration failed. Please try again.'
        successMessage.value = ''
      }
    }

    return {
      name,
      password,
      passwordConfirmation,
      email,
      birthday,
      errorMessage,
      successMessage,
      handleRegister
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

.error-message {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: green;
  margin-top: 1rem;
  text-align: center;
}
</style>
