<template>
  <div>
    <main class="main-content">
      <section class="about">
        <div class="profile-section">
          <div class="profile-info">
            <h1>Lifepath</h1>
            <div>
              <strong>Birthday:</strong>
              <div class="editable-field">
                <span>{{ formattedBirthday }}</span>
                <span class="edit-icon" @click="startEdit">✏️</span>
              </div>
              <br>
              <div class="tooltip">
                <strong>Life Path Number:</strong> {{ lifePathNumber }}
                <a href="#" class="tooltip-icon" @click.prevent="toggleTooltip('lifePath')">?</a>
                <span v-if="showTooltip === 'lifePath'" class="tooltiptext">{{ lifePathTooltip }}</span>
              </div>
              <br>
              <div class="tooltip">
                <strong>Universal Day Number:</strong> {{ universalDayNumber }}
                <a href="#" class="tooltip-icon" @click.prevent="toggleTooltip('universalDay')">?</a>
                <span v-if="showTooltip === 'universalDay'" class="tooltiptext">{{ universalDayTooltip }}</span>
              </div>
              <br>
              <div class="tooltip">
                <strong>Personal Day Number:</strong> {{ personalDayNumber }}
                <a href="#" class="tooltip-icon" @click.prevent="toggleTooltip('personalDay')">?</a>
                <span v-if="showTooltip === 'personalDay'" class="tooltiptext">{{ personalDayTooltip }}</span>
              </div>
              <br>
              <div v-if="loading" class="loading-spinner">Loading...</div>
              <div v-else>
                <strong>Daily Prediction:</strong> {{ dailyPredictionMessage }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="isLoggedIn">
          <NotesComponent />
        </div>
        <SMAChartComponent />
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import axios from '@/axiosConfig'
import NotesComponent from '@/components/NotesComponent.vue'
import SMAChartComponent from '@/components/SMAChartComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'AboutPage',
  components: {
    NotesComponent,
    SMAChartComponent
  },
  setup() {
    const userStore = useUserStore()
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const birthday = computed(() => userStore.birthday)
    const editableBirthday = ref(userStore.birthday.split('T')[0])
    const isEditing = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    const loading = ref(true)
    const dailyPrediction = ref('')
    const dailyPredictionMessage = ref('')
    const lifePathNumber = ref(null)
    const universalDayNumber = ref(null)
    const personalDayNumber = ref(null)
    const showTooltip = ref('')

    watch(() => userStore.birthday, (newBirthday) => {
      editableBirthday.value = newBirthday.split('T')[0]
    })

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th'
      switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }

    const formattedBirthday = computed(() => {
      if (!userStore.birthday) return ''
      const date = new Date(userStore.birthday)
      const day = date.getUTCDate()
      const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
      const year = date.getUTCFullYear()
      return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`
    })

    const startEdit = () => {
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      editableBirthday.value = userStore.birthday.split('T')[0]
    }

    const submitEdit = async () => {
      console.log('Submitting edit...')
      try {
        const formattedDate = new Date(editableBirthday.value).toISOString().split('T')[0]
        await axios.post('/api/user/update', {
          birthday: formattedDate
        })
        userStore.setBirthday(formattedDate)
        successMessage.value = 'Birthday updated successfully!'
        errorMessage.value = ''
        isEditing.value = false
      } catch {
        errorMessage.value = 'Failed to update birthday. Please try again.'
        successMessage.value = ''
      }
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user')
        userStore.setBirthday(response.data.birthday)
        dailyPrediction.value = response.data.numerology.daily_prediction
        dailyPredictionMessage.value = `Today is a ${dailyPrediction.value} day for you.`
        lifePathNumber.value = response.data.numerology.life_path_number
        universalDayNumber.value = response.data.numerology.universal_day_number
        personalDayNumber.value = response.data.numerology.personal_day_number
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (isLoggedIn.value) {
        fetchUserData()
      } else {
        loading.value = false
      }
    })

    const toggleTooltip = (tooltip: string) => {
      showTooltip.value = showTooltip.value === tooltip ? '' : tooltip
    }

    const lifePathTooltip = computed(() => {
      const date = new Date(userStore.birthday)
      const year = date.getUTCFullYear().toString().split('').join(' + ')
      const month = (date.getUTCMonth() + 1).toString().split('').join(' + ')
      const day = date.getUTCDate().toString().split('').join(' + ')
      const sum = year.split(' + ').reduce((acc, num) => acc + parseInt(num), 0) +
                  month.split(' + ').reduce((acc, num) => acc + parseInt(num), 0) +
                  day.split(' + ').reduce((acc, num) => acc + parseInt(num), 0)
      const reducedSum = lifePathNumber.value
      return `Sum the digits of your birth date (${year} + ${month} + ${day} = ${sum}) then reduce to a single digit (${reducedSum}).`
    })

    const universalDayTooltip = computed(() => {
      const date = new Date()
      const year = date.getUTCFullYear().toString().split('').join(' + ')
      const month = (date.getUTCMonth() + 1).toString().split('').join(' + ')
      const day = date.getUTCDate().toString().split('').join(' + ')
      const sum = year.split(' + ').reduce((acc, num) => acc + parseInt(num), 0) +
                  month.split(' + ').reduce((acc, num) => acc + parseInt(num), 0) +
                  day.split(' + ').reduce((acc, num) => acc + parseInt(num), 0)
      const reducedSum = universalDayNumber.value
      return `Sum the digits of the current date (${year} + ${month} + ${day} = ${sum}) then reduce to a single digit (${reducedSum}).`
    })

    const personalDayTooltip = computed(() => {
      const lifePath = lifePathNumber.value ?? 0
      const universalDay = universalDayNumber.value ?? 0
      return `Sum your Life Path Number (${lifePath}) and the Universal Day Number (${universalDay}) then reduce to a single digit (${personalDayNumber.value}).`
    })

    return {
      isLoggedIn,
      birthday,
      editableBirthday,
      isEditing,
      successMessage,
      errorMessage,
      loading,
      dailyPredictionMessage,
      lifePathNumber,
      universalDayNumber,
      personalDayNumber,
      startEdit,
      cancelEdit,
      submitEdit,
      formattedBirthday,
      showTooltip,
      toggleTooltip,
      lifePathTooltip,
      universalDayTooltip,
      personalDayTooltip
    }
  }
})
</script>

<style scoped>
.main-content {
  padding-top: 4rem;
}
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-info {
  max-width: 600px;
  text-align: left;
}
.editable-field {
  display: inline-flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
}
.edit-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #888;
}
.submit-link {
  color: blue;
  cursor: pointer;
  margin-left: 0.5rem;
}
.cancel-link {
  color: red;
  cursor: pointer;
  margin-left: 0.5rem;
}
.success-message {
  color: green;
}
.error-message {
  color: red;
}
.loading-spinner {
  margin-top: 1rem;
}
.good-day {
  color: green;
}
.bad-day {
  color: red;
}
.neutral-day {
  color: gray;
}
.tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltip .tooltip-icon {
  margin-left: 5px;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 220px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -110px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltip-icon:focus + .tooltiptext,
.tooltip .tooltip-icon:active + .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
