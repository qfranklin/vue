<template>
  <ProductDetailComponent />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProductDetailComponent from '@/components/ProductDetailComponent.vue'

export default defineComponent({
  name: 'ProductDetailPage',
  components: {
    ProductDetailComponent
  }
})
</script>