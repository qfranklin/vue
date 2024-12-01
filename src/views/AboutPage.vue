<template>
  <section>
    <div v-if="isLoggedIn">
      <SMAChartComponent />
      <NotesComponent />
      <LifepathComponent />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import NotesComponent from '@/components/NotesComponent.vue'
import SMAChartComponent from '@/components/SMAChartComponent.vue'
import LifepathComponent from '@/components/LifepathComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'AboutPage',
  components: {
    NotesComponent,
    SMAChartComponent,
    LifepathComponent
  },
  setup() {
    const userStore = useUserStore()
    const isLoggedIn = computed(() => userStore.isLoggedIn)

    return {
      isLoggedIn
    }
  }
})
</script>

