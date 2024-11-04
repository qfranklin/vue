<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <section class="about">
        <img src="/profile.jpg" alt="Profile Picture" class="profile-image">
        <div class="description">
          <p>Welcome to our website! This platform allows customers to register their glass blown pendants. We take pride in our unique and handcrafted products. Register your product to make it only accessible to you.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

export default defineComponent({
  name: 'AboutPage',
  components: {
    HeaderComponent
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
