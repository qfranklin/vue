<template>
  <button v-if="isAdmin && !isEditing" @click="toggleEditMode" class="edit-button">✏️</button>

  <div v-if="isMobile && product.images && product.images.length" class="carousel-container">
    <div class="carousel-wrapper"
      v-touch:swipeleft="nextImage"
      v-touch:swiperight="prevImage"
    >
      <div
        class="carousel-inner"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(image, index) in product.images"
          :key="index"
          class="carousel-item"
        >
          <img :src="getImageUrl(image)" alt="Product Image" class="carousel-image" />
          <button v-if="isEditing" @click="removeImage(index)" class="delete-image-button">🗑️</button>
        </div>
      </div>

      <button
        class="carousel-nav carousel-prev"
        @click="prevImage"
        v-if="currentIndex > 0"
      >
        &larr;
      </button>
      <button
        class="carousel-nav carousel-next"
        @click="nextImage"
        v-if="currentIndex < product.images.length - 1"
      >
        &rarr;
      </button>
    </div>

    <div class="carousel-dots">
      <span
        v-for="(image, index) in product.images"
        :key="index"
        class="dot"
        :class="{ active: currentIndex === index }"
        @click="setCurrentIndex(index)"
      ></span>
    </div>
  </div>

  <div v-else-if="product.images && product.images.length" class="product-images">
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
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
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
    const currentIndex = ref(0)
    const isMobile = computed(() => window.innerWidth <= 768)

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

      deletedImages.value.forEach((image, index) => {
        formData.append(`deletedImages[${index}]`, image)
      })

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

    const prevImage = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
      }
    }

    const nextImage = () => {
      if (currentIndex.value < product.value.images.length - 1) {
        currentIndex.value++
      }
    }

    const setCurrentIndex = (index: number) => {
      currentIndex.value = index
    }

    onMounted(() => {
      const productId = parseInt(route.params.id as string)
      fetchProductDetails(productId)
    })

    return {
      product,
      isAdmin,
      isEditing,
      toggleEditMode,
      handleImageUpload,
      removeImage,
      saveChanges,
      getImageUrl,
      prevImage,
      nextImage,
      currentIndex,
      setCurrentIndex,
      isMobile,
    }
  }
})
</script>


<style scoped>

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

.carousel-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.carousel-wrapper {
  position: relative;
}

.carousel-inner {
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.carousel-item {
  flex: 0 0 100%;
  text-align: center;
}

.carousel-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 30px;
  height: 70px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
}

.carousel-prev {
  left: 10px;
}

.carousel-next {
  right: 10px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  padding-bottom: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: grey;
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background-color: blue;
}
</style>
