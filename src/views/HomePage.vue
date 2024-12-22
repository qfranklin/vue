<template>
  <section>
    <div v-if="isLoggedIn">
      <NotesComponent />
      <LifepathComponent />
    </div>
    <FinancialChartComponent />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import NotesComponent from '@/components/NotesComponent.vue'
import FinancialChartComponent from '@/components/FinancialChartComponent.vue'
import LifepathComponent from '@/components/LifepathComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'HomePage',
  components: {
    NotesComponent,
    FinancialChartComponent,
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

