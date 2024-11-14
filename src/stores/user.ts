import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    token: '',
    isAdmin: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    login(email: string, token: string, isAdmin: boolean) {
      this.email = email
      this.token = token
      this.isAdmin = isAdmin
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_email', email)
      localStorage.setItem('is_admin', JSON.stringify(isAdmin))
    },
    logout() {
      this.email = ''
      this.token = ''
      this.isAdmin = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      localStorage.removeItem('is_admin')
    },
    loadFromLocalStorage() {
      const token = localStorage.getItem('auth_token')
      const email = localStorage.getItem('user_email')
      const isAdmin = JSON.parse(localStorage.getItem('is_admin') || 'false')
      if (token && email) {
        this.token = token
        this.email = email
        this.isAdmin = isAdmin
      }
    }
  }
})
