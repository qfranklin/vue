<template>
  <div class="register-page">
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="birthday">Birthday</label>
        <input type="date" id="birthday" v-model="birthday" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="passwordConfirmation">Confirm Password</label>
        <input type="password" id="passwordConfirmation" v-model="passwordConfirmation" required />
      </div>
      <div class="form-group">
        <input type="checkbox" id="emailConsent" v-model="emailConsent" required />
        <label for="emailConsent">I agree to receive emails for password resets and other notifications.</label>
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from '@/axiosConfig'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const name = ref('')
    const email = ref('')
    const birthday = ref('')
    const password = ref('')
    const passwordConfirmation = ref('')
    const emailConsent = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const handleRegister = async () => {
      if (password.value !== passwordConfirmation.value) {
        errorMessage.value = 'Passwords do not match.'
        return
      }

      try {
        const response = await axios.post('/api/register', {
          name: name.value,
          email: email.value,
          birthday: birthday.value,
          password: password.value,
          emailConsent: emailConsent.value
        })

        if (response.status === 200) {
          successMessage.value = 'Registration successful. Please check your email for verification.'
          errorMessage.value = ''
        } else {
          throw new Error('Registration failed.')
        }
      } catch (error) {
        errorMessage.value = (error as Error).message
        successMessage.value = ''
      }
    }

    return {
      name,
      email,
      birthday,
      password,
      passwordConfirmation,
      emailConsent,
      errorMessage,
      successMessage,
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
