<template>
  <div>
    <h1>Add Product</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="description">Description:</label>
        <input type="text" id="description" v-model="description" required />
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="text" id="price" v-model="price" required />
      </div>
      <div>
        <label for="image">Image:</label>
        <input type="file" id="image" @change="handleImageUpload" required />
      </div>
      <button type="submit">Add Product</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from '@/axiosConfig'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AddProductPage',
  setup() {
    const description = ref('')
    const price = ref('')
    const image = ref<File | null>(null)
    const router = useRouter()

    const handleImageUpload = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        image.value = target.files[0]
      }
    }

    const handleSubmit = async () => {
      const formData = new FormData()
      formData.append('description', description.value)
      formData.append('price', price.value)
      if (image.value) {
        formData.append('image', image.value)
      }

      try {
        await axios.post('/api/products', formData)
        router.push('/products')
      } catch (error) {
        console.error('Failed to add product:', error)
      }
    }

    return { description, price, handleImageUpload, handleSubmit }
  }
})
</script>

<style scoped>
/* Add your styles here */
</style>