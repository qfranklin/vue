<!-- src/components/QRCodeGeneratorComponent.vue -->
<template>
  <div class="qr-code-generator">
    <h2>Generate QR Code STL</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="textInput">Enter Text:</label>
        <input type="text" id="textInput" v-model="textInput" required />
      </div>
      <button type="submit">Generate STL</button>
    </form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from '@/axiosConfig'

export default defineComponent({
  name: 'QRCodeGeneratorComponent',
  setup() {
    const textInput = ref('')
    const errorMessage = ref('')

    const handleSubmit = async () => {
      try {
        const response = await axios.post('/api/generate-stl', { text: textInput.value }, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'qrcode.stl')
        document.body.appendChild(link)
        link.click()
        link.remove()
        errorMessage.value = ''
      } catch (error) {
        console.error('Failed to generate STL:', error)
        errorMessage.value = 'Failed to generate STL. Please try again.'
      }
    }

    return {
      textInput,
      errorMessage,
      handleSubmit
    }
  }
})
</script>

<style scoped>
.qr-code-generator {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
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

.error-message {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>
