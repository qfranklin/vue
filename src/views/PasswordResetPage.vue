<template>
  <div class="password-reset-page">
    <form @submit.prevent="handlePasswordReset">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div>
        <label for="password">New Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div>
        <label for="passwordConfirmation">Confirm Password:</label>
        <input type="password" id="passwordConfirmation" v-model="passwordConfirmation" required>
      </div>
      <button type="submit">Reset Password</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'PasswordResetPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const passwordConfirmation = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')
    const route = useRoute()
    const router = useRouter()

    const handlePasswordReset = async () => {
      try {
        const token = route.params.token
        const response = await axios.post('/api/password/reset', {
          email: email.value,
          password: password.value,
          password_confirmation: passwordConfirmation.value,
          token: token
        })
        if (response.status === 200) {
          successMessage.value = 'Password reset successful. You can now log in with your new password.'
          errorMessage.value = ''
          router.push('/login')
        } else {
          throw new Error('Password reset failed.')
        }
      } catch (error) {
        errorMessage.value = (error as Error).message
        successMessage.value = ''
      }
    }

    return {
      email,
      password,
      passwordConfirmation,
      errorMessage,
      successMessage,
      handlePasswordReset
    }
  }
})
</script>

<style scoped>
.password-reset-page {
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

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>
