<template>
  <div class="user-details-container">
    <h1>User Details</h1>
    <LifepathComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LifepathComponent from '@/components/LifepathComponent.vue'

export default defineComponent({
  name: 'UserDetailsPage',
  components: {
    LifepathComponent
  }
})
</script>

<style scoped>
.user-details-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>