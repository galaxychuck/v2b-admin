import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    message: {
      hello: '你好世界'
    }
  },
  'en': {
    message: {
      hello: 'Hello World'
    }
  }
}

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})

export default i18n
