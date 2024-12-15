<template>
  <ProductListComponent />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProductListComponent from '@/components/ProductListComponent.vue'

export default defineComponent({
  name: 'ProductsPage',
  components: {
    ProductListComponent
  }
})
</script>