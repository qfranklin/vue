import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import Vue3TouchEvents from 'vue3-touch-events';
import router from './router'
import { useUserStore } from '@/stores/user'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const userStore = useUserStore()
userStore.loadFromLocalStorage()

app.use(router)
app.use(Vue3TouchEvents)

app.mount('#app')
