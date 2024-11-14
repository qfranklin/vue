import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    token: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    login(email: string, token: string) {
      this.email = email
      this.token = token
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_email', email)
    },
    logout() {
      this.email = ''
      this.token = ''
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
    },
    loadFromLocalStorage() {
      const token = localStorage.getItem('auth_token')
      const email = localStorage.getItem('user_email')
      if (token && email) {
        this.token = token
        this.email = email
      }
    }
  }
})
