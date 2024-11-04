<template>
  <div>
    <header>
      <h1>About Page</h1>
      <nav>
        <a href="/login">Login</a>
      </nav>
    </header>
    <main>
      <p>Welcome to the About page!</p>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPage',
})
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
}

nav a {
  text-decoration: none;
  color: #007bff;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
