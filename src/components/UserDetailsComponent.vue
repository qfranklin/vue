<template>
  <div class="user-profile-edit">
    <form @submit.prevent="updateProfile">
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
      <button type="submit">Save</button>
    </form>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import axios from '@/axiosConfig'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'UserDetailsComponent',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const name = ref('')
    const email = ref('')
    const birthday = ref('')
    const successMessage = ref('')
    const errorMessage = ref('')

    const fetchUserDetails = async () => {
      try {
        if (userStore.userId !== props.userId && !userStore.isAdmin) {
          throw new Error('Unauthorized')
        }

        const response = await axios.get(`/api/user/${props.userId}`)
        if (response.status === 200) {
          const user = response.data
          name.value = user.name
          email.value = user.email
          birthday.value = user.birthday.split('T')[0]
        } else {
          throw new Error('Some required fields are missing.')
        }
      } catch (error) {
        if ((error as Error).message === 'Unauthorized') {
          errorMessage.value = 'You are not authorized to view this user\'s details.'
        } else {
          errorMessage.value = (error as Error).message
        }
      }
    }

    watch(() => props.userId, () => {
      fetchUserDetails()
    })

    const updateProfile = async () => {
      try {
        const response = await axios.post(`/api/user/update/${props.userId}`, {
          name: name.value,
          email: email.value,
          birthday: birthday.value
        })

        if (response.status === 200) {
          userStore.name = name.value
          userStore.email = email.value
          userStore.birthday = birthday.value
          userStore.setBirthday(birthday.value)
          localStorage.setItem('user_name', name.value)
          localStorage.setItem('user_email', email.value)
          successMessage.value = 'Profile updated successfully.'
          errorMessage.value = ''
        } else {
          throw new Error('Failed to update profile.')
        }
      } catch {
        errorMessage.value = 'Failed to update profile. Please try again later.'
        successMessage.value = ''
      }
    }

    return {
      name,
      email,
      birthday,
      updateProfile,
      successMessage,
      errorMessage
    }
  }
})
</script>

<style scoped>
.user-profile-edit {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
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
