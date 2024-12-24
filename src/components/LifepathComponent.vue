<template>
  <div class="lifepath-info">
    <div>
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
        <strong>Daily Compatibility:</strong> {{ dailyCompatibilityMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import axios from '@/axiosConfig'
import { useUserStore } from '@/stores/user'

export interface Lifepath {
  id: number;
  description: string;
}

export default defineComponent({
  name: 'LifepathComponent',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const loading = ref(true)
    const dailyCompatibility = ref('')
    const dailyCompatibilityMessage = ref('')
    const lifePathNumber = ref(null)
    const universalDayNumber = ref(null)
    const personalDayNumber = ref(null)
    const showTooltip = ref('')
    const dateInput = ref<HTMLInputElement | null>(null)

    const fetchUserData = async () => {
      try {
        if (userStore.userId !== props.userId && !userStore.isAdmin) {
          throw new Error('Unauthorized')
        }

        const response = await axios.get(`/api/user/${props.userId}`)
        if (response.status === 200) {
          const user = response.data
          dailyCompatibility.value = user.numerology.daily_compatibility
          dailyCompatibilityMessage.value = `Today is a ${dailyCompatibility.value} day for you.`
          lifePathNumber.value = user.numerology.life_path_number
          universalDayNumber.value = user.numerology.universal_day_number
          personalDayNumber.value = user.numerology.personal_day_number
        } else {
          throw new Error('Failed to fetch user data.')
        }
      } catch (error) {
        if ((error as Error).message === 'Unauthorized') {
          console.error('You are not authorized to view this user\'s details.')
        } else {
          console.error('Failed to fetch user data:', error)
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserData()
    })

    watch(() => props.userId, () => {
      fetchUserData()
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
      loading,
      dailyCompatibilityMessage,
      lifePathNumber,
      universalDayNumber,
      personalDayNumber,
      showTooltip,
      toggleTooltip,
      lifePathTooltip,
      universalDayTooltip,
      personalDayTooltip,
      dateInput
    }
  }
})
</script>

<style scoped>
.lifepath-info {
  max-width: 600px;
  text-align: left;
}
.loading-spinner {
  margin-top: 1rem;
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
  top: 125%;
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
