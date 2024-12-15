<template>
  <div>
    <h1>Generate STL File</h1>
    <form @submit.prevent="generateSTL">
      <div>
        <label for="text">Text:</label>
        <input type="text" id="text" v-model="text" required>
      </div>
      <button type="submit">Generate STL</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'GenerateSTLPage',
  setup() {
    const text = ref('')

    const generateSTL = async () => {
      try {
        const response = await axios.post('/api/generate-stl', { text: text.value }, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'generated.stl')
        document.body.appendChild(link)
        link.click()
      } catch (error) {
        console.error('Failed to generate STL:', error)
      }
    }

    return {
      text,
      generateSTL
    }
  }
})
</script>