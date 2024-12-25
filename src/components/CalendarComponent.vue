<template>
  <div>
    <vue-cal
      class="vuecal--rounded-theme vuecal--blue-theme"
      xsmall
      hide-view-selector
      :time="false"
      active-view="month"
      :disable-views="['week']"
      style="width: 270px;height: 300px"
      :events="notes"
      @cell-click="handleCellClick"
    />
    <div class="notes-list">
      <div v-for="(notes, date) in groupedNotes" :key="date" class="note-group">
        <small class="note-date">{{ formatDate(date) }}</small>
        <div v-for="note in notes" :key="note.start" class="note">
          <p>{{ note.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import axios from '@/axiosConfig'

interface Note {
  date: string
  content: string
}

export interface Event {
  start: string
  end: string
  title: string
}

export default defineComponent({
  name: 'CalendarComponent',
  components: { VueCal },
  setup() {
    const notes = ref<Event[]>([])

    const getMonthRange = () => {
      const start = new Date()
      start.setDate(1)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      return { start, end }
    }

    const fetchNotes = async (start_date: string, end_date: string) => {
      try {
        const response = await axios.get('/api/notes', { params: { start_date, end_date } })
        notes.value = response.data.map((note: Note) => ({
          start: note.date,
          end: note.date,
          title: note.content
        }))
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      }
    }

    const handleCellClick = (date: Date) => {
      addNote({ start: date })
    }

    const addNote = async ({ start }: { start: Date }) => {
      console.log('start:', start)

      const content = prompt('Enter note content:')
      if (content) {
        try {
          console.log('content:', content)
          const formattedDate = start.toISOString().split('T')[0] // Format the date to 'YYYY-MM-DD'
          const response = await axios.post('/api/notes', { content, date: formattedDate })
          notes.value.push({
            start: response.data.date,
            end: response.data.date,
            title: response.data.content
          })
        } catch (error) {
          console.error('Failed to add note:', error)
        }
      }
    }

    const formatDate = (date: string) => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      const formattedDate = new Date(date).toLocaleDateString(undefined, options)
      const day = new Date(date).getDate()
      const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'
      return formattedDate.replace(/\d+/, day + suffix)
    }

    const groupedNotes = computed(() => {
      return notes.value.reduce((acc: Record<string, Event[]>, note) => {
        const date = note.start.split('T')[0]
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(note)
        return acc
      }, {})
    })

    onMounted(() => {
      const { start, end } = getMonthRange()
      fetchNotes(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    })

    return {
      notes,
      handleCellClick,
      formatDate,
      groupedNotes
    }
  }
})
</script>

<style scoped>
.notes-list {
  margin-top: 20px;
}

.note-group {
  margin-bottom: 1rem;
}

.note-date {
  color: #888;
}

.note {
  margin-left: 1rem;
}
</style>
