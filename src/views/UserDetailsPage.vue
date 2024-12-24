<template>
  <UserDetailsComponent :userId="userId" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import UserDetailsComponent from '@/components/UserDetailsComponent.vue'

export default defineComponent({
  name: 'UserDetailsPage',
  components: {
    UserDetailsComponent
  },
  setup() {
    const route = useRoute()
    const userId = ref<number>(0)

    onMounted(() => {
      userId.value = parseInt(route.params.id as string, 10) || 0
    })

    watch(() => route.params.id, (newId) => {
      userId.value = parseInt(newId as string, 10) || 0
    })

    return {
      userId
    }
  }
})
</script>
