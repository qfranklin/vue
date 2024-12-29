<template>
  <div class="calendar-container">
    <vue-cal
      class="vuecal--rounded-theme vuecal--blue-theme"
      xsmall
      hide-view-selector
      :time="false"
      active-view="month"
      :disable-views="['week']"
      style="width: 170px;height: 300px"
      :events="notes"
      @cell-click="handleCellClick"
      @view-change="handleViewChange"
    />
    <div class="notes-card">
      <div class="notes-header">
        <a href="#" @click.prevent="showAddNote = true">Add notes</a>
      </div>
      <div v-if="showAddNote" class="add-note">
        <textarea v-model="newNoteContent" placeholder="Enter note content"></textarea>
        <a href="#" @click.prevent="submitNote">Submit</a>
      </div>
      <div v-if="selectedNotes.length === 0" class="no-notes">
        <p><i>No notes</i></p>
      </div>
      <div v-else>
        <div v-for="note in selectedNotes" :key="note.start" class="note">
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
    const selectedNotes = ref<Event[]>([])
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const showAddNote = ref(false)
    const newNoteContent = ref('')

    const getMonthRange = (date: Date) => {
      const start = new Date(date)
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
        filterNotesForSelectedDate()
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      }
    }

    const filterNotesForSelectedDate = () => {
      selectedNotes.value = notes.value.filter(note => note.start === selectedDate.value)
    }

    const handleCellClick = (date: Date) => {
      selectedDate.value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
      console.log('selectedDate:', selectedDate.value)
      filterNotesForSelectedDate()
    }

    const handleViewChange = (view: { startDate: Date }) => {
      const { start, end } = getMonthRange(view.startDate)
      fetchNotes(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    }

    const addNote = async ({ start }: { start: Date }) => {

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
          filterNotesForSelectedDate()
        } catch (error) {
          console.error('Failed to add note:', error)
        }
      }
    }

    const submitNote = async () => {
      if (newNoteContent.value) {
        try {
          const response = await axios.post('/api/notes', { content: newNoteContent.value, date: selectedDate.value })
          notes.value.push({
            start: response.data.date,
            end: response.data.date,
            title: response.data.content
          })
          filterNotesForSelectedDate()
          newNoteContent.value = ''
          showAddNote.value = false
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
      const { start, end } = getMonthRange(new Date())
      fetchNotes(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    })

    return {
      notes,
      selectedNotes,
      selectedDate,
      showAddNote,
      newNoteContent,
      handleCellClick,
      handleViewChange,
      addNote,
      submitNote,
      formatDate,
      groupedNotes
    }
  }
})
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
}

.notes-card {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
}

.notes-card a {
  font-size: 0.875rem;
}

.notes-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.add-note {
  margin-top: 10px;
}

.add-note textarea {
  width: 100%;
  height: 60px;
}

@media (min-width: 768px) {
  .calendar-container {
    flex-direction: row;
  }

  .notes-card {
    margin-left: 20px;
    margin-top: 0;
    width: 300px;
  }
}
</style>
