<template>
  <div>
    <h1>{{ product.description }}</h1>
    <div v-if="product.images && product.images.length">
      <img v-for="image in product.images" :src="getImageUrl(image)" :key="image" alt="Product Image" />
    </div>
    <p>Price: ${{ product.price }}</p>
    <div v-if="isAdmin">
      <button @click="uploadNewProduct">Upload New Product</button>
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

    const fetchProductDetails = async (productId: number) => {
      try {
        const response = await axios.get(`/api/products/${productId}`)
        product.value = response.data
      } catch (error) {
        console.error('Failed to fetch product details:', error)
      }
    }

    const getImageUrl = (imagePath: string) => {
      return `http://127.0.0.1:8082/storage/${imagePath}`
    }

    onMounted(() => {
      const productId = parseInt(route.params.id as string)
      fetchProductDetails(productId)
    })

    const uploadNewProduct = () => {
      // Logic for uploading new product
    }

    return { product, isAdmin, uploadNewProduct, getImageUrl }
  }
})
</script>

<style scoped>
/* Add your styles here */
</style>
