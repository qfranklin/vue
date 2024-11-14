<template>
  <div>
    <HeaderComponent />
    <div class="admin-content">
      <h1>Admin Page</h1>
      <p>Welcome, Admin!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

export default defineComponent({
  name: 'AdminPage',
  components: {
    HeaderComponent
  }
})
</script>

<style scoped>
.admin-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}
</style>
