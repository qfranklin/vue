<template>
  <div id="app">
    <HeaderComponent />
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
