<template>
  <div id="app">
    <HeaderComponent />
    <router-view />
    <div v-if="showPrivacyNotice" class="privacy-notice">
      <p>We use analytics to improve your experience on our site. By continuing to use our site, you consent to our use of analytics. <a href="/privacy-policy">Learn more</a>.</p>
      <button @click="acceptAnalytics">Accept</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const showPrivacyNotice = ref(false)

    const acceptAnalytics = () => {
      localStorage.setItem('analyticsAccepted', 'true')
      showPrivacyNotice.value = false
    }

    onMounted(() => {
      if (!localStorage.getItem('analyticsAccepted')) {
        showPrivacyNotice.value = true
      }
    })

    return {
      showPrivacyNotice,
      acceptAnalytics
    }
  }
})
</script>

<style scoped>
.privacy-notice {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
