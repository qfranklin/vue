<template>
  <div>
    <button v-if="!showTextBox" @click="showTextBox = true" class="notes-button">Add notes</button>
    <div v-else>
      <textarea v-model="newNote" ref="noteTextBox" class="notes-textbox"></textarea>
      <button @click="saveNote" class="notes-button">Save</button>
    </div>
    <div v-for="note in notes" :key="note.id" class="note">
      <p>{{ note.content }}</p>
      <small>{{ formatTime(note.created_at) }}</small>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

interface Note {
  id: number
  content: string
  created_at: string
}

export default defineComponent({
  name: 'NotesComponent',
  data() {
    return {
      showTextBox: false,
      newNote: '',
      notes: [] as Note[]
    }
  },
  mounted() {
    this.fetchNotes()
  },
  methods: {
    async fetchNotes() {
      try {
        const response = await axios.get('/api/notes')
        this.notes = response.data
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      }
    },
    async saveNote() {
      if (!this.newNote.trim()) return

      try {
        const response = await axios.post('/api/notes', { content: this.newNote })
        this.notes.unshift(response.data)
        this.newNote = ''
        this.showTextBox = false
      } catch (error) {
        console.error('Failed to save note:', error)
      }
    },
    formatTime(time: string) {
      const date = new Date(time)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  },
  watch: {
    showTextBox(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          (this.$refs.noteTextBox as HTMLTextAreaElement).focus()
        })
      }
    }
  }
})
</script>

<style scoped>
.notes-button {
  color: #007bff;
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.notes-textbox {
  width: 100%;
  height: 100px;
}

.note {
  margin-bottom: 1rem;
}
</style>
