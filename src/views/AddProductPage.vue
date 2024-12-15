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
        <label for="images">Image:</label>
        <input type="file" id="images" @change="handleImageUpload" multiple required />
      </div>
      <button type="submit">Add Product</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from '@/axiosConfig'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'AddProductPage',
  setup() {
    const description = ref('')
    const price = ref('')
    const images = ref<File[]>([])
    const router = useRouter()
    const userStore = useUserStore()

    const handleImageUpload = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        images.value = Array.from(target.files)
      }
    }

    const handleSubmit = async () => {
      const formData = new FormData()
      formData.append('description', description.value)
      formData.append('price', price.value)
      images.value.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      try {
        await axios.post('/api/products', formData, {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        })
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
