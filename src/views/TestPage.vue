<template>
  <div class="practice-test-page">
    <h1>EPA Section 608 Practice Test</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="(question, index) in questions" :key="index" class="question">
        <p>{{ question.question }}</p>
        <ul>
          <li>
            <input type="radio" :name="'question' + index" :value="question.option_a" v-model="userAnswers[index]" @change="checkAnswer(index)" />
            {{ question.option_a }}
          </li>
          <li>
            <input type="radio" :name="'question' + index" :value="question.option_b" v-model="userAnswers[index]" @change="checkAnswer(index)" />
            {{ question.option_b }}
          </li>
          <li>
            <input type="radio" :name="'question' + index" :value="question.option_c" v-model="userAnswers[index]" @change="checkAnswer(index)" />
            {{ question.option_c }}
          </li>
          <li>
            <input type="radio" :name="'question' + index" :value="question.option_d" v-model="userAnswers[index]" @change="checkAnswer(index)" />
            {{ question.option_d }}
          </li>
        </ul>
        <p v-if="results[index] !== undefined">
          {{ results[index] ? 'Correct!' : 'Incorrect. The correct answer is: ' + question.correct_answer }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from '@/axiosConfig'

interface Question {
  id: number;
  question: string;
  question_type: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_at: string;
  updated_at: string;
}

export default defineComponent({
  name: 'TestPage',
  setup() {
    const loading = ref(true)
    const questions = ref<Question[]>([])
    const userAnswers = ref<string[]>([])
    const results = ref<boolean[]>([])

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

    const checkAnswer = (index: number) => {
      if (userAnswers.value[index] === questions.value[index].correct_answer) {
        results.value[index] = true
      } else {
        results.value[index] = false
      }
    }

    return {
      questions,
      loading,
      userAnswers,
      results,
      checkAnswer
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
