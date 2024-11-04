<!-- src/views/Login.vue -->
<template>
  <div>
    <h1>Login Page</h1>
    <form>
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username">
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password">
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
export default {
  name: 'LoginPage',
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
}

div {
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
