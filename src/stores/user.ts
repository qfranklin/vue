import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    token: '',
    isAdmin: false,
    birthday: '',
    numerology: '',
    astrology: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    login(email: string, token: string, isAdmin: boolean, birthday: string) {
      this.email = email
      this.token = token
      this.isAdmin = isAdmin
      this.birthday = birthday
      this.calculateNumerology()
      this.calculateAstrology()
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_email', email)
      localStorage.setItem('is_admin', JSON.stringify(isAdmin))
      localStorage.setItem('birthday', birthday)
    },
    logout() {
      this.email = ''
      this.token = ''
      this.isAdmin = false
      this.birthday = ''
      this.numerology = ''
      this.astrology = ''
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      localStorage.removeItem('is_admin')
      localStorage.removeItem('birthday')
    },
    loadFromLocalStorage() {
      const token = localStorage.getItem('auth_token')
      const email = localStorage.getItem('user_email')
      const isAdmin = JSON.parse(localStorage.getItem('is_admin') || 'false')
      const birthday = localStorage.getItem('birthday')
      if (token && email && birthday) {
        this.token = token
        this.email = email
        this.isAdmin = isAdmin
        this.birthday = birthday
        this.calculateNumerology()
        this.calculateAstrology()
      }
    },
    calculateNumerology() {
      // Add your numerology calculation logic here
      this.numerology = 'Numerology result based on birthday'
    },
    calculateAstrology() {
      // Add your astrology calculation logic here
      this.astrology = 'Astrology result based on birthday'
    }
  }
})
