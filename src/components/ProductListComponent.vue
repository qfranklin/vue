<template>
  <div>
    <a v-if="isAdmin" @click="addProduct" class="add-product-link">Add Product</a>
    <div class="product-list">
      <div v-for="product in products" :key="product.id" class="product-card" @click="viewProduct(product.id)">
        <div class="product-image" v-if="product.images && product.images.length">
          <img v-for="image in product.images" :src="getImageUrl(image)" :key="image" alt="Product Image" />
        </div>
        <div class="product-details">
          <p class="product-price">${{ product.price }}</p>
        </div>
      </div>
    </div>
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

    const getImageUrl = (imagePath: string) => {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://qfranklin.xyz/storage'
        : 'http://127.0.0.1:8082/storage'
      return `${baseUrl}/${imagePath}`
    }

    const addProduct = () => {
      router.push('/products/add')
    }

    const viewProduct = (productId: number) => {
      router.push(`/products/${productId}`)
    }

    onMounted(() => {
      fetchProducts()
    })

    return { products, isAdmin, addProduct, viewProduct, getImageUrl }
  }
})
</script>

<style scoped>

.add-product-link {
  color: #007BFF;
  text-decoration: none;
  font-size: 16px;
  margin-bottom: 20px;
  display: inline-block;
  cursor: pointer;
}

.add-product-link:hover {
  text-decoration: underline;
  color: #0056b3;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: scale(1.05);
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
}

.product-details {
  padding: 15px;
}

.product-price {
  font-size: 16px;
  color: #888;
}

@media (max-width: 600px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

</style>
