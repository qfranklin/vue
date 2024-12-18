<template>
  <div class="product-detail-container">
    <button v-if="isAdmin && !isEditing" @click="toggleEditMode" class="edit-button">✏️</button>
    <div v-if="product.images && product.images.length" class="product-images">
      <div v-for="(image, index) in product.images" :key="index" class="product-image">
        <img :src="getImageUrl(image)" alt="Product Image" />
        <button v-if="isEditing" @click="removeImage(index)" class="delete-image-button">🗑️</button>
      </div>
    </div>
    <div v-if="isEditing" class="upload-new-image">
      <input type="file" @change="handleImageUpload" multiple />
    </div>
    <p class="product-price" v-if="!isEditing">Price: ${{ product.price }}</p>
    <input v-if="isEditing" type="text" v-model="product.price" class="edit-input" placeholder="Price" />
    <p class="product-description" v-if="!isEditing">{{ product.description }}</p>
    <textarea v-if="isEditing" v-model="product.description" class="edit-textarea" placeholder="Description"></textarea>
    <div v-if="isEditing" class="edit-actions">
      <a @click="saveChanges" class="save-link">Save</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/axiosConfig'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'ProductDetailComponent',
  setup() {
    const route = useRoute()
    const product = ref({ id: 0, description: '', images: [], price: '' })
    const userStore = useUserStore()
    const isAdmin = ref(userStore.isAdmin)
    const isEditing = ref(false)
    const newImages = ref<File[]>([])
    const deletedImages = ref<string[]>([])

    const fetchProductDetails = async (productId: number) => {
      try {
        const response = await axios.get(`/api/products/${productId}`)
        product.value = response.data
      } catch (error) {
        console.error('Failed to fetch product details:', error)
      }
    }

    const getImageUrl = (imagePath: string) => {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://qfranklin.xyz/storage'
        : 'http://127.0.0.1:8082/storage'
      return `${baseUrl}/${imagePath}`
    }

    const toggleEditMode = () => {
      isEditing.value = !isEditing.value
    }

    const handleImageUpload = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        newImages.value = Array.from(target.files)
      }
    }

    const removeImage = (index: number) => {
      const image = product.value.images[index]
      if (typeof image === 'string') {
        deletedImages.value.push(image)
      }
      product.value.images.splice(index, 1)
    }

    const saveChanges = async () => {
      const formData = new FormData()
      formData.append('description', product.value.description)
      formData.append('price', product.value.price)

      // Append deleted image names
      deletedImages.value.forEach((image, index) => {
        formData.append(`deletedImages[${index}]`, image)
      })

      // Append new images
      newImages.value.forEach((image, index) => {
        formData.append(`newImages[${index}]`, image)
      })

      try {
        await axios.post(`/api/products/${product.value.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        isEditing.value = false
        newImages.value = []
      } catch (error) {
        console.error('Failed to update product:', error)
      }
    }

    onMounted(() => {
      const productId = parseInt(route.params.id as string)
      fetchProductDetails(productId)
    })

    return { product, isAdmin, isEditing, toggleEditMode, handleImageUpload, removeImage, saveChanges, getImageUrl }
  }
})
</script>

<style scoped>
.product-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.edit-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  z-index: 10;
}

.edit-actions {
  text-align: center;
  margin-bottom: 20px;
}

.save-link {
  color: #007BFF;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
}

.save-link:hover {
  text-decoration: underline;
  color: #0056b3;
  text-decoration: underline;
}

.product-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.product-image {
  position: relative;
}

.product-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.delete-image-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  z-index: 10;
}

.upload-new-image {
  margin-top: 10px;
  margin-bottom: 10px;
}

.product-price {
  font-size: 20px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.product-description {
  font-size: 16px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
</style>
