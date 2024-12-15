<template>
  <div>
    <h1>Glass</h1>
    <div v-for="product in products" :key="product.id" @click="viewProduct(product.id)">
      <img :src="product.images[0]" alt="Product Image" />
      <p>{{ product.description }}</p>
      <p>{{ product.price }}</p>
    </div>
    <button v-if="isAdmin" @click="addProduct">Add Product</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axiosConfig'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'ProductListComponent',
  setup() {
    const router = useRouter()
    const products = ref([])
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

    onMounted(() => {
      fetchProducts()
    })

    return { products, viewProduct, isAdmin, addProduct }
  }
})
</script>

<style scoped>
/* Add your styles here */
</style>