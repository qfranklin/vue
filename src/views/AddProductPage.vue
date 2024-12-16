<template>
  <div class="add-product-container">
    <h1>Add Product</h1>
    <form @submit.prevent="handleSubmit" class="add-product-form">
      <div class="form-group">
        <label for="description">Description:</label>
        <input type="text" id="description" v-model="description" required />
      </div>
      <div class="form-group">
        <label for="price">Price:</label>
        <input type="text" id="price" v-model="price" required />
      </div>
      <div class="form-group">
        <label for="images">Image:</label>
        <input type="file" id="images" @change="handleImageUpload" multiple required />
      </div>
      <button type="submit" class="submit-button">Add Product</button>
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
    const images = ref<File[]>([])
    const router = useRouter()

    const handleImageUpload = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files) {
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
            'Content-Type': 'multipart/form-data',
          },
        })
        router.push('/products')
      } catch (error) {
        console.error(error)
      }
    }

    return {
      description,
      price,
      images,
      handleImageUpload,
      handleSubmit,
    }
  },
})
</script>

<style scoped>
.add-product-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.add-product-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="file"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-button {
  background-color: #007BFF;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>
