<template>
  <QRCodeGeneratorComponent />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import QRCodeGeneratorComponent from '@/components/QRCodeGeneratorComponent.vue'

export default defineComponent({
  name: 'QRCodePage',
  components: {
    QRCodeGeneratorComponent
  }
})
</script>
