<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <section class="about">
        <img src="/profile.jpg" alt="Profile Picture" class="profile-image">
        <div class="description">
          <p v-if="isLoggedIn">
            <strong>Birthday:</strong> {{ formattedBirthday }}<br>
            <strong>Numerology:</strong> {{ numerology }}<br>
            <strong>Astrology:</strong> {{ astrology }}
          </p>
          <p v-else>
            Welcome to our website! Please register or login to view your astrological and numerical daily predictions.
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
    const birthday = computed(() => userStore.birthday)

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th'
      switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }

    const formattedBirthday = computed(() => {
      if (!userStore.birthday) return ''
      const date = new Date(userStore.birthday)
      const day = date.getUTCDate()
      const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
      const year = date.getUTCFullYear()
      return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`
    })

    const numerology = computed(() => userStore.numerology)
    const astrology = computed(() => userStore.astrology)
    return {
      isLoggedIn,
      birthday,
      formattedBirthday,
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
