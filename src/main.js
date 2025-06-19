import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import * as ElIcons from '@element-plus/icons-vue'
const app = createApp(App)
for (const name in ElIcons) {
  app.component(name, ElIcons[name])
}
app.use(router)
console.log("API Base URL:", process.env.VUE_APP_API_BASE_URL);
app.mount('#app')