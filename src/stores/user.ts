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
      if (token && email) {
        this.token = token
        this.email = email
        this.isAdmin = isAdmin
        if (birthday) {
          this.birthday = birthday
          this.calculateNumerology()
          this.calculateAstrology()
        }
      }
    },
    setBirthday(birthday: string) {
      this.birthday = birthday
      this.calculateNumerology()
      this.calculateAstrology()
      localStorage.setItem('birthday', birthday)
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
