<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <section class="about">
        <img src="/profile.jpg" alt="Profile Picture" class="profile-image">
        <div class="description">
          <div v-if="isLoggedIn">
            <strong>Birthday:</strong>
            <div class="editable-field">
              <input
                v-if="isEditing"
                type="date"
                v-model="editableBirthday"
              />
              <span v-else @click="startEdit">{{ formattedBirthday }}</span>
              <span v-if="!isEditing" class="edit-icon" @click="startEdit">✏️</span>
            </div>
            <a v-if="isEditing" @click="submitEdit" class="submit-link">Submit</a>
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <br>
            <strong>Numerology:</strong> {{ numerology }}<br>
            <strong>Astrology:</strong> {{ astrology }}
          </div>
          <p v-else>
            Welcome to our website! Please register or login to view your astrological and numerical daily predictions.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import axios from '@/axiosConfig'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'AboutPage',
  components: {
    HeaderComponent
  },
  setup() {
    const userStore = useUserStore()
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const birthday = computed(() => userStore.birthday)
    const editableBirthday = ref(userStore.birthday.split('T')[0])
    const isEditing = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

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
      editableBirthday.value = userStore.birthday.split('T')[0] // Ensure the date input is correctly formatted
    }

    const submitEdit = async () => {
      console.log('Submitting edit...')
      try {
        const response = await axios.post('/api/user/update', {
          birthday: editableBirthday.value
        })
        userStore.birthday = editableBirthday.value
        successMessage.value = 'Birthday updated successfully!'
        errorMessage.value = ''
        isEditing.value = false
      } catch (error) {
        errorMessage.value = 'Failed to update birthday. Please try again.'
        successMessage.value = ''
      }
    }

    const numerology = computed(() => userStore.numerology)
    const astrology = computed(() => userStore.astrology)
    return {
      isLoggedIn,
      birthday,
      editableBirthday,
      isEditing,
      formattedBirthday,
      numerology,
      astrology,
      startEdit,
      submitEdit,
      successMessage,
      errorMessage
    }
  }
})
</script>

<style scoped>
.main-content {
  padding-top: 4rem; /* Adjust this value based on the height of your header */
}
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
}
.description {
  max-width: 600px;
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
  color: #888; /* Greyed out color */
}
.submit-link {
  color: blue;
  cursor: pointer;
  margin-left: 0.5rem;
}
.success-message {
  color: green;
}
.error-message {
  color: red;
}
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .profile-image {
    margin-right: 2rem;
  }
  .description {
    text-align: left;
  }
}
</style>
