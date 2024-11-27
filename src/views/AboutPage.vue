<template>
  <section class="about">
    <div class="profile-section">
      <LifepathComponent />
    </div>
    <div v-if="isLoggedIn">
      <NotesComponent />
    </div>
    <SMAChartComponent />
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

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
