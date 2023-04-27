import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
// import { useCounterStore } from './store'

const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
