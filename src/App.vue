<template>
  <HeaderComponent />
  <div class="main-content">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeaderComponent
  }
})
</script>

<style scoped>
.main-content {
  padding-top: 50px;
}
</style>
