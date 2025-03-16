<template>
  <a v-if="isAdmin" @click="addProduct" class="add-product-link">Add Product</a>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-card">
      <div class="product-image" v-if="product.images && product.images.length" @click="viewProduct(product.id)">
        <img v-for="image in product.images" :src="getImageUrl(image)" :key="image" alt="Product Image" />
        <button v-if="isAdmin" @click.stop="showDeleteModal(product.id)" class="delete-product-button">🗑️</button>
      </div>
      <div class="product-details">
        <p class="product-price">${{ product.price }}</p>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="hideDeleteModal">&times;</span>
      <p>Are you sure you want to delete this product?</p>
      <button @click="confirmDeleteProduct" class="modal-button">Yes</button>
      <button @click="hideDeleteModal" class="modal-button">No</button>
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
    const showModal = ref(false)
    const productIdToDelete = ref<number | null>(null)

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

    const showDeleteModal = (productId: number) => {
      productIdToDelete.value = productId
      showModal.value = true
    }

    const hideDeleteModal = () => {
      showModal.value = false
      productIdToDelete.value = null
    }

    const confirmDeleteProduct = async () => {
      if (productIdToDelete.value !== null) {
        try {
          await axios.delete(`/api/products/${productIdToDelete.value}`)
          products.value = products.value.filter(product => product.id !== productIdToDelete.value)
          hideDeleteModal()
        } catch (error) {
          console.error('Failed to delete product:', error)
        }
      }
    }

    onMounted(() => {
      fetchProducts()
    })

    return { products, isAdmin, addProduct, viewProduct, showDeleteModal, hideDeleteModal, confirmDeleteProduct, showModal, getImageUrl }
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

.product-image {
  position: relative;
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
}

.product-details {
  padding: 15px;
  position: relative;
}

.product-price {
  font-size: 16px;
  color: #888;
}

.delete-product-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 16px;
  display: block;
}

@media (max-width: 600px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  text-align: center;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.modal-button {
  margin: 0 10px;
}
</style>
