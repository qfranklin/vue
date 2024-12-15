<template>
  <div>
    <div v-for="product in products" :key="product.id" @click="viewProduct(product.id)">
      <h2>{{ product.description }}</h2>
      <p>Price: ${{ product.price }}</p>
      <div v-if="product.images && product.images.length">
        <img v-for="image in product.images" :src="getImageUrl(image)" :key="image" alt="Product Image" />
      </div>
    </div>
    <button v-if="isAdmin" @click="addProduct">Add Product</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axiosConfig'
import { useUserStore } from '@/stores/user'

export interface Product {
  id: number;
  description: string;
  price: number;
  images: string[];
}

export default defineComponent({
  name: 'ProductListComponent',
  setup() {
    const router = useRouter()

    const products = ref<Product[]>([])
    const userStore = useUserStore()
    const isAdmin = ref(userStore.isAdmin)

    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products')
        products.value = response.data
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }

    const viewProduct = (id: number) => {
      router.push(`/products/${id}`)
    }

    const addProduct = () => {
      router.push('/products/add')
    }

    const getImageUrl = (imagePath: string) => {
      return `http://127.0.0.1:8082/storage/${imagePath}`
    }

    onMounted(() => {
      fetchProducts()
    })

    return { products, viewProduct, isAdmin, addProduct, getImageUrl }
  }
})
</script>

<style scoped>
/* Add your styles here */
</style>
