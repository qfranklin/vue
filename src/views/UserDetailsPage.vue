<template>
  <UserDetailsComponent :identifier="identifier" />
  <LifepathComponent :userId="userId" />
  <CalendarComponent />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import UserDetailsComponent from '@/components/UserDetailsComponent.vue'
import LifepathComponent from '@/components/LifepathComponent.vue'
import CalendarComponent from '@/components/CalendarComponent.vue'

export default defineComponent({
  name: 'UserDetailsPage',
  components: {
    UserDetailsComponent,
    LifepathComponent,
    CalendarComponent
  },
  setup() {
    const route = useRoute()
    const userId = ref<number>(0)
    const identifier = ref<string | number>('')

    onMounted(() => {
      userId.value = parseInt(route.params.id as string, 10) || 0
      identifier.value = route.params.identifier as string
    })

    watch(() => route.params.identifier, (newIdentifier) => {
      identifier.value = newIdentifier as string
    })

    return {
      userId,
      identifier
    }
  }
})
</script>
