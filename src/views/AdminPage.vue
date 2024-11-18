<template>
  <div>
    <HeaderComponent />
    <div class="admin-content">
      <h1>Admin Page</h1>
      <p>Welcome, Admin!</p>
      <div v-if="loading">Loading...</div>
      <table v-else-if="analytics.length">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Event Type</th>
            <th>Product ID</th>
            <th>Page URL</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="analytic in analytics" :key="analytic.session_id">
            <td>{{ analytic.session_id }}</td>
            <td>{{ analytic.user_name }}</td>
            <td>{{ analytic.user_email }}</td>
            <td>{{ analytic.event_type }}</td>
            <td>{{ analytic.product_id }}</td>
            <td>{{ analytic.page_url }}</td>
            <td>{{ analytic.created_at }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No analytics data for today.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from '@/axiosConfig'
import HeaderComponent from '@/components/HeaderComponent.vue'

interface Analytic {
  session_id: string
  user_name: string
  user_email: string
  event_type: string
  product_id: string
  page_url: string
  created_at: string
}

export default defineComponent({
  name: 'AdminPage',
  components: {
    HeaderComponent
  },
  setup() {
    const analytics = ref<Analytic[]>([])
    const loading = ref(true)

    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/analytics/today')
        analytics.value = response.data
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchAnalytics()
    })

    return {
      analytics,
      loading
    }
  }
})
</script>

<style scoped>
.admin-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>
