import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@element-plus/icons-vue'
import '@/assets/styles/index.scss'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 引入移动端工具
import { optimizeMobilePerformance, optimizeMobileStorage } from '@/utils/mobile'

// 引入配置文件
import '@/config'
// 引入配置管理器
import { initConfig } from '@/utils/configManager'

// 开发环境下不启用反调试工具
if (process.env.NODE_ENV === 'production') {
  // 禁用开发者工具
  import('disable-devtool').then(module => {
    module.default()
  })
}

const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: zhCn
})

// 在应用挂载前初始化配置
initConfig().then(() => {
  console.log('应用配置初始化完成')
  
  // 应用移动端优化
  if (window.innerWidth <= 768) {
    optimizeMobilePerformance()
    optimizeMobileStorage()
  }
  
  app.mount('#app')
}).catch(error => {
  console.error('应用配置初始化失败:', error)
  // 即使配置初始化失败，也挂载应用（使用默认配置）
  app.mount('#app')
})
