<template>
  <UserDetailsComponent />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UserDetailsComponent from '@/components/UserDetailsComponent.vue'

export default defineComponent({
  name: 'UserDetailsPage',
  components: {
    UserDetailsComponent
  }
})
</script>
