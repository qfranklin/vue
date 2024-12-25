<template>
  <section>
    <FinancialChartComponent />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import FinancialChartComponent from '@/components/FinancialChartComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'HomePage',
  components: {
    FinancialChartComponent
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

