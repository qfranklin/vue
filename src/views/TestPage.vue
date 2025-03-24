<template>
  <div class="practice-test-page">
    <h1>EPA Section 608 Practice Test</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="(question, index) in questions" :key="index" class="question">
        <p>{{ question.text }}</p>
        <ul>
          <li v-for="(answer, idx) in question.answers" :key="idx">{{ answer }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from '@/axiosConfig'

interface Question {
  text: string;
  answers: string[];
}

export default defineComponent({
  name: 'TestPage',
  setup() {
    const loading = ref(true)
    const questions = ref<Question[]>([])

    onMounted(async () => {
      try {
        const response = await axios.get('/api/test/epa608')
        questions.value = response.data
      } catch (error) {
        console.error('Error fetching practice test questions:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      questions,
      loading
    }
  }
})
</script>

<style scoped>
.practice-test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.question {
  margin-bottom: 20px;
}
</style>
