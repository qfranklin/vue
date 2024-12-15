<template>
  <div>
    <h1>{{ product.description }}</h1>
    <img :src="product.images[0]" alt="Product Image" />
    <p>{{ product.price }}</p>
    <div v-if="isAdmin">
      <button @click="uploadNewProduct">Upload New Product</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'ProductDetailComponent',
  setup() {
    const route = useRoute()
    const product = ref({ id: 0, description: '', images: [''], price: '' })
    const userStore = useUserStore()
    const isAdmin = ref(userStore.isAdmin)

    onMounted(() => {
      const productId = route.params.id
      // Fetch product details based on productId
      product.value = { id: productId, description: `Glass Product ${productId}`, images: ['image.jpg'], price: `$${productId * 10}` }
    })

    const uploadNewProduct = () => {
      // Logic for uploading new product
    }

    return { product, isAdmin, uploadNewProduct }
  }
})
</script>

<style scoped>
/* Add your styles here */
</style>