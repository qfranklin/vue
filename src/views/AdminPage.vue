<template>
  <div>
    <HeaderComponent />
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
