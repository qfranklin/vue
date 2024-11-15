<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <section class="about">
        <img src="/profile.jpg" alt="Profile Picture" class="profile-image">
        <div class="description">
          <p>Welcome to our website! This platform allows customers to register their glass blown pendants. We take pride in our unique and handcrafted products. Register your product to make it only accessible to you.</p>
          <p v-if="isLoggedIn">
            <strong>Numerology:</strong> {{ numerology }}
          </p>
          <p v-if="isLoggedIn">
            <strong>Astrology:</strong> {{ astrology }}
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'AboutPage',
  components: {
    HeaderComponent
  },
  setup() {
    const userStore = useUserStore()
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const numerology = computed(() => userStore.numerology)
    const astrology = computed(() => userStore.astrology)
    return {
      isLoggedIn,
      numerology,
      astrology
    }
  }
})
</script>

<style scoped>
.main-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}

.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.description {
  max-width: 600px;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .profile-image {
    margin-right: 2rem;
  }

  .description {
    text-align: left;
  }
}
</style>
