<template>
  <div class="users-container">
    <h1>Users</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div v-for="user in users" :key="user.id" class="user-card" @click="viewUserDetails(user.id)">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Birthday:</strong> {{ formatBirthday(user.birthday) }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axiosConfig'

interface User {
  id: number
  name: string
  email: string
  birthday: string
}

export default defineComponent({
  name: 'UsersPage',
  setup() {
    const users = ref<User[]>([])
    const loading = ref(true)
    const router = useRouter()

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users')
        users.value = response.data
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        loading.value = false
      }
    }

    const viewUserDetails = (userId: number) => {
      router.push(`/user/${userId}`)
    }

    const formatBirthday = (birthday: string) => {
      const date = new Date(birthday)
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      loading,
      viewUserDetails,
      formatBirthday
    }
  }
})
</script>

<style scoped>
.users-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
}

.user-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
}
</style>
