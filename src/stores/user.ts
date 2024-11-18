import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    token: '',
    userId: null as number | null,
    isAdmin: false,
    birthday: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    login(email: string, token: string, userId: number, isAdmin: boolean) {
      this.email = email
      this.token = token
      this.userId = userId
      this.isAdmin = isAdmin
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_email', email)
      localStorage.setItem('user_id', userId.toString())
      localStorage.setItem('is_admin', JSON.stringify(isAdmin))
    },
    logout() {
      this.email = ''
      this.token = ''
      this.userId = null
      this.isAdmin = false
      this.birthday = ''
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_id')
      localStorage.removeItem('is_admin')
      localStorage.removeItem('birthday')
    },
    loadFromLocalStorage() {
      const token = localStorage.getItem('auth_token')
      const email = localStorage.getItem('user_email')
      const userId = localStorage.getItem('user_id')
      const isAdmin = localStorage.getItem('is_admin')
      const birthday = localStorage.getItem('birthday')
      if (token && email && userId && isAdmin) {
        this.token = token
        this.email = email
        this.userId = parseInt(userId)
        this.isAdmin = JSON.parse(isAdmin)
        if (birthday) {
          this.birthday = birthday
        }
      }
    },
    setBirthday(birthday: string) {
      this.birthday = birthday
      localStorage.setItem('birthday', birthday)
    }
  }
})
