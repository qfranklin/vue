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
  color: #ffffff;
  text-decoration: none;
  font-size: 12px;
  margin-bottom: 10px;
  display: inline-block;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: rgba(255,255,255,0.18);
  border-radius: 12px;
  padding: 0.5em 1.2em;
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.18);
  transition: background 0.3s, color 0.3s;
}

.add-product-link:hover {
  background: rgba(0,191,255,0.13);
  color: #fff;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.product-card {
  background: linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(0,191,255,0.10) 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  border: 1.5px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
}

.product-card:hover {
  transform: scale(1.04);
  box-shadow: 0 12px 40px 0 rgba(0,191,255,0.18);
}

.product-image {
  position: relative;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(0,191,255,0.10);
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0;
}

.product-details {
  padding: 18px;
  position: relative;
}

.product-price {
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0,191,255,0.10);
}

.delete-product-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.7);
  border: none;
  color: #ff3b3b;
  cursor: pointer;
  font-size: 18px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(31,38,135,0.10);
  transition: background 0.2s, color 0.2s;
  padding: 0.3em 0.5em;
}

.delete-product-button:hover {
  background: rgba(255,0,0,0.15);
  color: #fff;
}

@media (max-width: 600px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .product-details {
    padding: 12px;
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
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(120deg, rgba(255,255,255,0.92) 0%, rgba(0,191,255,0.13) 100%);
  padding: 28px 20px 20px 20px;
  border: 1.5px solid rgba(0,191,255,0.18);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
}

.close {
  color: #00bfff;
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;
}

.close:hover,
.close:focus {
  color: #ff3b3b;
  text-decoration: none;
}

.modal-button {
  margin: 0 10px;
  padding: 0.5em 1.5em;
  border-radius: 12px;
  border: none;
  background: rgba(0,191,255,0.13);
  color: #00bfff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px rgba(31,38,135,0.10);
}

.modal-button:hover {
  background: #00bfff;
  color: #fff;
}
</style>
