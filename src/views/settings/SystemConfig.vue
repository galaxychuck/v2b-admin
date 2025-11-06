<template>
  <div class="system-config page-container">
    <el-card class="config-card">
      <!-- 第一行：标签导航 -->
      <div class="tab-navigation">
        <div 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 第二行：配置内容 -->
      <div class="config-content">

        <div class="config-table">
          <div 
            v-for="item in currentConfigItems" 
            :key="item.key"
            class="config-row"
          >
            <!-- 左侧标题和描述 -->
            <div class="config-label">
              <div class="config-title">{{ item.title }}</div>
              <div class="config-description">{{ item.description }}</div>
            </div>
            
            <!-- 右侧输入控件 -->
            <div class="config-control">
              <!-- 文本输入框 -->
              <el-input
                v-if="item.type === 'input'"
                v-model="configData[item.key]"
                :placeholder="item.placeholder"
                @change="() => handleConfigChange(item.key)"
              />
              
              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="configData[item.key]"
                :min="item.min"
                :max="item.max"
                @change="() => handleConfigChange(item.key)"
              />
              
              <!-- 开关按钮 -->
              <el-switch
                v-else-if="item.type === 'switch'"
                v-model="configData[item.key]"
                @change="() => handleConfigChange(item.key)"
              />
              
              <!-- 下拉选择 -->
              <div v-else-if="item.type === 'select'" class="select-with-refresh">
                <el-select
                  v-model="configData[item.key]"
                  :placeholder="item.placeholder"
                  @change="() => handleConfigChange(item.key)"
                >
                  <el-option
                    v-for="option in item.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>

              </div>
              
              <!-- 文本域 -->
              <el-input
                v-else-if="item.type === 'textarea'"
                v-model="configData[item.key]"
                type="textarea"
                :rows="3"
                :placeholder="item.placeholder"
                @change="() => handleConfigChange(item.key)"
              />
              
              <!-- 按钮 -->
              <a-button v-else-if="item.type === 'button'"
                type="primary"
                @click="handleButtonClick(item)"
              >
                {{ item.buttonText }}
              </a-button>
            </div>
          </div>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

import { getConfig, saveConfig, setTelegramWebhook, testSendMail } from '@/api/settings'
import { getPlanList } from '@/api/plan'

export default {
  name: 'SystemConfig',
  setup() {
    const activeTab = ref('site')
    const configData = reactive({})
    const autoSaveTimer = ref(null)
    const lastSavedData = ref({})
    const planOptions = ref([])
    const isTabSwitching = ref(false)

    // 标签页配置
    const tabs = [
      { key: 'site', label: '站点' },
      { key: 'safe', label: '安全' },
      { key: 'subscribe', label: '订阅' },
      { key: 'invite', label: '邀请&佣金' },
      { key: 'frontend', label: '个性化' },
      { key: 'server', label: '节点' },
      { key: 'email', label: '邮件' },
      { key: 'telegram', label: 'Telegram' },
      { key: 'app', label: 'APP' }
    ]

    // 配置项定义
    const configItems = {
      site: [
        {
          key: 'app_name',
          title: '站点名称',
          description: '用于显示需要站点名称的地方。',
          type: 'input',
          placeholder: '请输入站点名称'
        },
        {
          key: 'app_description',
          title: '站点描述',
          description: '用于显示需要站点描述的地方。',
          type: 'input',
          placeholder: '请输入站点描述'
        },
        {
          key: 'app_url',
          title: '站点网址',
          description: '当前网站最新网址,将会在邮件等需要用于网址处体现。',
          type: 'input',
          placeholder: '请输入站点网址'
        },
        {
          key: 'force_https',
          title: '强制HTTPS',
          description: '当站点没有使用HTTPS,CDN或反代开启强制HTTPS时需要开启。',
          type: 'switch'
        },
        {
          key: 'logo',
          title: 'LOGO',
          description: '用于显示需要LOGO的地方。',
          type: 'input',
          placeholder: '请输入LOGO URL,末尾不要/'
        },
        {
          key: 'subscribe_url',
          title: '订阅URL',
          description: '用于订阅所使用,留空则为站点URL。如需多个订阅URL随机获取请使用逗号进行分割。',
          type: 'textarea',
          placeholder: '请输入订阅URL，每行一个URL'
        },
        {
          key: 'tos_url',
          title: '用户条款(TOS) URL',
          description: '用于跳转到用户条款(TOS)',
          type: 'input',
          placeholder: '请输入用户条款URL,末尾不要/'
        },
        {
          key: 'stop_register',
          title: '停止新用户注册',
          description: '开启后任何人都将无法进行注册。',
          type: 'switch'
        },
        {
          key: 'try_out_plan_id',
          title: '注册试用',
          description: '选择需要试用的订阅,如果没有选项请先前往订阅管理添加。',
          type: 'select',
          options: () => planOptions.value,
          placeholder: '请选择试用订阅计划'
        },
        {
          key: 'currency',
          title: '货币单位',
          description: '仅用于展示使用,更改后系统中所有的货币单位都将发生变更。',
          type: 'input',
          placeholder: '请输入货币单位'
        },
        {
          key: 'currency_symbol',
          title: '货币符号',
          description: '仅用于展示使用,更改后系统中所有的货币单位都将发生变更。',
          type: 'input',
          placeholder: '请输入货币符号'
        }
      ],
      safe: [
        {
          key: 'email_verify',
          title: '邮箱验证',
          description: '开启后将会强制要求用户进行邮箱验证。',
          type: 'switch'
        },
        {
          key: 'email_gmail_limit_enable',
          title: '禁止使用Gmail多别名',
          description: '开启后Gmail多别名将无法注册。',
          type: 'switch'
        },
        {
          key: 'safe_mode_enable',
          title: '安全模式',
          description: '开启后除了站点URL以外的绑定本站点的域名访问都将会被403。',
          type: 'switch'
        },
        {
          key: 'secure_path',
          title: '后台路径',
          description: '后台管理路径,修改后将会改变原有的admin路径。',
          type: 'input',
          placeholder: '请输入后台路径'
        },
        {
          key: 'email_whitelist_enable',
          title: '邮箱后缀白名单',
          description: '开启后在名单中的邮箱后缀才允许进行注册。',
          type: 'switch'
        },
        {
          key: 'recaptcha_enable',
          title: '防机器人',
          description: '开启后将会使用Google reCAPTCHA防止机器人。',
          type: 'switch'
        },
        {
          key: 'register_limit_by_ip_enable',
          title: 'IP注册限制',
          description: '开启后如果IP注册账户达到规则要求将会被限制注册,请注意IP判断可能因为CDN或前置代理导致问题。',
          type: 'switch'
        },
        {
          key: 'password_limit_enable',
          title: '防爆破限制',
          description: '开启后如果该账户尝试登陆失败次数过多将会被限制。',
          type: 'switch'
        }
      ],
      subscribe: [
        {
          key: 'plan_change_enable',
          title: '允许用户更改订阅',
          description: '开启后用户将会可以对订阅计划进行变更。',
          type: 'switch'
        },
        {
          key: 'reset_traffic_method',
          title: '月流量重置方式',
          description: '全局流量重置方式,默认每月1号。可以在订阅管理为订阅单独设置。',
          type: 'select',
          options: [
            { label: '每月1号', value: 0 },
            { label: '按月重置', value: 1 },
            { label: '不重置', value: 2 },
            { label: '每年1月1日', value: 3 },
            { label: '按年重置', value: 4 }
          ]
        },
        {
          key: 'surplus_enable',
          title: '开启折抵方案',
          description: '开启后用户更换订阅将会由系统对原有订阅进行折抵,方案参考文档。',
          type: 'switch'
        },
        {
          key: 'new_order_event_id',
          title: '当订阅新购时触发事件',
          description: '新购订阅完成时将触发该任务。',
          type: 'select',
          options: [
            { label: '重置用户流量', value: 1 },
            { label: '不执行任何动作', value: 0 }
          ]
        },
        {
          key: 'renew_order_event_id',
          title: '当订阅续费时触发事件',
          description: '续费订阅完成时将触发该任务。',
          type: 'select',
          options: [
            { label: '重置用户流量', value: 1 },
            { label: '不执行任何动作', value: 0 }
          ]
        },
        {
          key: 'change_order_event_id',
          title: '当订阅变更时触发事件',
          description: '变更订阅完成时将触发该任务。',
          type: 'select',
          options: [
            { label: '重置用户流量', value: 1 },
            { label: '不执行任何动作', value: 0 }
          ]
        },
        {
          key: 'show_info_to_server_enable',
          title: '在订阅中展示订阅信息',
          description: '开启后将会在用户订阅节点时输出订阅信息。',
          type: 'switch'
        }
      ],
      invite: [
        {
          key: 'invite_force',
          title: '开启强制邀请',
          description: '开启后只有被邀请的用户才可以进行注册。',
          type: 'switch'
        },
        {
          key: 'invite_commission',
          title: '邀请佣金百分比',
          description: '默认全局的佣金分配比例,你可以在用户管理单独配置单个比例。',
          type: 'number',
          min: 0,
          max: 100
        },
        {
          key: 'invite_gen_limit',
          title: '用户可创建邀请码上限',
          description: '用户可创建的邀请码数量限制。',
          type: 'number',
          min: 0,
          max: 100
        },
        {
          key: 'invite_never_expire',
          title: '邀请码永不失效',
          description: '开启后邀请码被使用后将不会失效,否则使用过后即失效。',
          type: 'switch'
        },
        {
          key: 'commission_first_time_enable',
          title: '佣金仅首次发放',
          description: '开启后被邀请人首次支付时才会产生佣金,可以在用户管理对用户进行单独配置。',
          type: 'switch'
        },
        {
          key: 'commission_auto_check_enable',
          title: '佣金自动确认',
          description: '开启后佣金将会在订单完成3日后自动进行确认。',
          type: 'switch'
        },
        {
          key: 'commission_withdraw_limit',
          title: '提现单申请门槛(元)',
          description: '小于门槛金额的提现单将不会被提交。',
          type: 'number',
          min: 0
        },
        {
          key: 'commission_withdraw_method',
          title: '提现方式',
          description: '可以支持的提现方式。',
          type: 'textarea',
          placeholder: '请输入提现方式，用逗号分隔'
        },
        {
          key: 'withdraw_close_enable',
          title: '关闭提现',
          description: '关闭后将禁止用户申请提现,且邀请佣金将会直接进入用户余额。',
          type: 'switch'
        },
        {
          key: 'commission_distribution_enable',
          title: '三级分销',
          description: '开启后将佣金将按照设置的3成比例进行分成、三成比例合计请不要>100%。',
          type: 'switch'
        }
      ],
      frontend: [
        {
          key: 'frontend_theme_sidebar',
          title: '边栏风格',
          description: '后台管理面板边栏样式。',
          type: 'select',
          options: [
            { label: '亮', value: 'light' },
            { label: '暗', value: 'dark' }
          ],
          placeholder: '请选择边栏风格'
        },
        {
          key: 'frontend_theme_header',
          title: '头部风格',
          description: '后台管理面板头部样式。',
          type: 'select',
          options: [
            { label: '亮', value: 'light' },
            { label: '暗', value: 'dark' }
          ],
          placeholder: '请选择头部风格'
        },
        {
          key: 'frontend_theme_color',
          title: '主题色',
          description: '后台管理面板主题颜色。',
          type: 'select',
          options: [
            { label: '默认', value: 'default' },
            { label: '深蓝', value: 'darkblue' },
            { label: '黑色', value: 'black' },
            { label: '绿色', value: 'green' }
          ]
        },
        {
          key: 'frontend_background_url',
          title: '背景',
          description: '将会在后台登录页面进行展示。',
          type: 'input',
          placeholder: '请输入背景图片URL'
        }
      ],
      server: [
        {
          key: 'server_token',
          title: '通讯密钥',
          description: 'V2board与节点通讯的密钥,以便数据不会被他人获取。',
          type: 'input',
          placeholder: '请输入通讯密钥'
        },
        {
          key: 'server_pull_interval',
          title: '节点拉取动作轮询间隔',
          description: '节点从面板获取数据的间隔频率。',
          type: 'number',
          min: 10,
          max: 300
        },
        {
          key: 'server_push_interval',
          title: '节点推送动作轮询间隔',
          description: '节点推送数据到面板的间隔频率。',
          type: 'number',
          min: 10,
          max: 300
        }
      ],
      email: [
        {
          key: 'email_host',
          title: 'SMTP服务器地址',
          description: '由邮件服务商提供的服务地址',
          type: 'input',
          placeholder: '请输入SMTP服务器地址'
        },
        {
          key: 'email_port',
          title: 'SMTP服务端口',
          description: '常见的端口有25, 465, 587',
          type: 'input',
          placeholder: '请输入SMTP服务端口'
        },
        {
          key: 'email_encryption',
          title: 'SMTP加密方式',
          description: '465端口加密方式一般为SSL,587端口加密方式一般为TLS',
          type: 'input',
          placeholder: '请输入'
        },
        {
          key: 'email_username',
          title: 'SMTP账号',
          description: '由邮件服务商提供的账号',
          type: 'input',
          placeholder: '请输入SMTP账号'
        },
        {
          key: 'email_password',
          title: 'SMTP密码',
          description: '由邮件服务商提供的密码',
          type: 'input',
          placeholder: '请输入SMTP密码'
        },
        {
          key: 'email_from_address',
          title: '发件地址',
          description: '由邮件服务商提供的发件地址',
          type: 'input',
          placeholder: '请输入发件地址'
        },
        {
          key: 'email_template',
          title: '邮件模板',
          description: '你可以在文档查看如何自定义邮件模板',
          type: 'select',
          options: [
            { label: '经典', value: 'classic' },
            { label: '默认', value: 'default' }
          ]
        },
        {
          key: 'test_email',
          title: '发送测试邮件',
          description: '邮件将会发送到当前登陆用户邮箱',
          type: 'button',
          buttonText: '发送测试邮件'
        }
      ],
      telegram: [
        {
          key: 'telegram_bot_token',
          title: '机器人Token',
          description: '请输入由Botfather提供的token.',
          type: 'input',
          placeholder: '请输入机器人Token'
        },
        {
          key: 'set_webhook',
          title: '设置Webhook',
          description: '对机器人进行Webhook设置,不设置将无法收到Telegram通知,',
          type: 'button',
          buttonText: '一键设置'
        },
        {
          key: 'telegram_bot_enable',
          title: '开启机器人通知',
          description: '开启后bot将会对綁定了telegram的管理员和用户进行基础通知。',
          type: 'switch'
        },
        {
          key: 'telegram_discuss_link',
          title: '群组地址',
          description: '填写后将会在用户端展示,或者被用于需要的地方。',
          type: 'input',
          placeholder: '请输入群组地址'
        }
      ],
      app: [
        {
          key: 'windows_version',
          title: 'Windows版本号',
          description: 'Windows端版本号及下载地址',
          type: 'input',
          placeholder: '请输入版本号'
        },
        {
          key: 'windows_download_url',
          title: 'Windows下载地址',
          description: 'Windows端版本号及下载地址',
          type: 'input',
          placeholder: '请输入下载地址'
        },
        {
          key: 'macos_version',
          title: 'macOS版本号',
          description: 'macOS端版本号及下载地址',
          type: 'input',
          placeholder: '请输入版本号'
        },
        {
          key: 'macos_download_url',
          title: 'macOS下载地址',
          description: 'macOS端版本号及下载地址',
          type: 'input',
          placeholder: '请输入下载地址'
        },
        {
          key: 'android_version',
          title: 'Android版本号',
          description: 'Android版本号及下载地址',
          type: 'input',
          placeholder: '请输入版本号'
        },
        {
          key: 'android_download_url',
          title: 'Android下载地址',
          description: 'Android版本号及下载地址',
          type: 'input',
          placeholder: '请输入下载地址'
        }
      ]
    }

    // 计算当前标签页的配置项
    const currentConfigItems = computed(() => {
      const items = configItems[activeTab.value] || []
      
      // 处理每个配置项，确保options是数组
      return items.map(item => {
        if (item.type === 'select') {
          let options = []
          if (typeof item.options === 'function') {
            options = item.options()
          } else if (Array.isArray(item.options)) {
            options = item.options
          } else if (item.options && Array.isArray(item.options.value)) {
            options = item.options.value
          }
          
          return {
            ...item,
            options: options
          }
        }
        return item
      })
    })

    // 切换标签页
    const switchTab = (tabKey) => {
      isTabSwitching.value = true
      activeTab.value = tabKey
      
      // 延迟重置标志，确保响应式更新完成
      setTimeout(() => {
        isTabSwitching.value = false
      }, 100)
    }

    // 处理配置变更 - 自动保存
    const handleConfigChange = (key) => {
      // 如果正在切换标签页，跳过保存
      if (isTabSwitching.value) {
        return
      }
      
      // 清除之前的定时器
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value)
      }
      
      // 检查数据是否有变化
      const hasChanged = JSON.stringify(configData) !== JSON.stringify(lastSavedData.value)
      if (!hasChanged) {
        return
      }
      
      // 额外检查：确保变化不是由于响应式更新引起的
      const currentValue = configData[key]
      const lastValue = lastSavedData.value[key]
      
      // 如果值相同，说明是其他原因触发的更新
      if (JSON.stringify(currentValue) === JSON.stringify(lastValue)) {
        return
      }
      
      // 设置新的定时器，延迟1.5秒后自动保存
      autoSaveTimer.value = setTimeout(async () => {
        const success = await autoSaveConfig(configData)
        if (success) {
          lastSavedData.value = JSON.parse(JSON.stringify(configData))
          ElMessage.success('配置已自动保存')
        } else {
          ElMessage.error('自动保存失败，请检查网络连接或联系管理员')
        }
      }, 1500)
    }

    // 处理按钮点击
    const handleButtonClick = async (item) => {
      if (item.key === 'test_email') {
        try {
          await testSendMail()
          ElMessage.success('测试邮件发送成功')
        } catch (error) {
          ElMessage.error('测试邮件发送失败')
        }
      } else if (item.key === 'set_webhook') {
        try {
          await setTelegramWebhook({ telegram_bot_token: configData.telegram_bot_token })
          ElMessage.success('Webhook设置成功')
        } catch (error) {
          ElMessage.error('Webhook设置失败')
        }
      }
    }

    // 自动保存配置
    const autoSaveConfig = async (data) => {
      try {
        // 格式化数据，确保符合后端API要求
        const formattedData = {}
        
        // 将配置数据按类别分组
        Object.keys(data).forEach(key => {
          let value = data[key]
          
          // 对于switch类型的配置项，将布尔值转换为数字
          if (['force_https', 'stop_register', 'email_verify', 'email_gmail_limit_enable', 'safe_mode_enable', 'email_whitelist_enable', 'recaptcha_enable', 'register_limit_by_ip_enable', 'password_limit_enable', 'plan_change_enable', 'surplus_enable', 'invite_never_expire', 'commission_first_time_enable', 'commission_auto_check_enable', 'withdraw_close_enable', 'commission_distribution_enable', 'telegram_webhook_enable'].includes(key)) {
            value = value === true ? 1 : 0
          }
          
          // 根据配置项的类型进行分组
          if (['app_name', 'app_description', 'app_url', 'force_https', 'logo', 'subscribe_url', 'tos_url', 'stop_register', 'try_out_plan_id', 'currency', 'currency_symbol'].includes(key)) {
            if (!formattedData.site) formattedData.site = {}
            formattedData.site[key] = value
          } else if (['email_verify', 'email_gmail_limit_enable', 'safe_mode_enable', 'secure_path', 'email_whitelist_enable', 'recaptcha_enable', 'register_limit_by_ip_enable', 'password_limit_enable'].includes(key)) {
            if (!formattedData.safe) formattedData.safe = {}
            formattedData.safe[key] = value
          } else if (['plan_change_enable', 'reset_traffic_method', 'surplus_enable', 'new_order_event_id', 'renew_order_event_id', 'change_order_event_id'].includes(key)) {
            if (!formattedData.subscribe) formattedData.subscribe = {}
            formattedData.subscribe[key] = value
          } else if (['invite_commission_rate', 'invite_gen_limit', 'invite_never_expire', 'commission_first_time_enable', 'commission_auto_check_enable', 'commission_withdraw_limit', 'commission_withdraw_method', 'withdraw_close_enable', 'commission_distribution_enable'].includes(key)) {
            if (!formattedData.invite) formattedData.invite = {}
            formattedData.invite[key] = value
          } else if (['frontend_theme_sidebar', 'frontend_theme_header', 'frontend_theme_color', 'frontend_background_url'].includes(key)) {
            if (!formattedData.frontend) formattedData.frontend = {}
            formattedData.frontend[key] = value
          } else if (['server_token', 'server_pull_interval'].includes(key)) {
            if (!formattedData.server) formattedData.server = {}
            formattedData.server[key] = value
          } else if (['email_host', 'email_port', 'email_username', 'email_password', 'email_encryption', 'email_from_address', 'email_from_name'].includes(key)) {
            if (!formattedData.email) formattedData.email = {}
            formattedData.email[key] = value
          } else if (['telegram_bot_token', 'telegram_bot_username', 'telegram_bot_webhook_token', 'telegram_discuss_id', 'telegram_channel_id', 'telegram_webhook_enable'].includes(key)) {
            if (!formattedData.telegram) formattedData.telegram = {}
            formattedData.telegram[key] = value
          } else if (['app_name_ios', 'app_name_android', 'app_version_ios', 'app_version_android', 'app_url_ios', 'app_url_android'].includes(key)) {
            if (!formattedData.app) formattedData.app = {}
            formattedData.app[key] = value
          }
        })
        
        // 发送扁平化数据以确保所有配置项都能正确保存
        const flatData = {
          ...formattedData,
          ...data
        }
        
        await saveConfig(flatData)
        return true
      } catch (error) {
        console.error('自动保存失败:', error)
        
        // 处理422错误（数据验证失败）
        if (error.response?.status === 422) {
          const errorData = error.response.data
          if (errorData && errorData.message) {
            ElMessage.error(`数据验证失败: ${errorData.message}`)
          } else {
            ElMessage.error('数据格式不正确，请检查输入内容')
          }
        } else if (error.response?.status === 401) {
          ElMessage.error('认证失败，请重新登录')
        } else if (error.response?.status === 403) {
          ElMessage.error('权限不足，无法保存配置')
        } else {
          ElMessage.error('保存失败，请稍后重试')
        }
        
        return false
      }
    }

    // 加载订阅计划列表
    const loadPlanOptions = async () => {
      try {
        const response = await getPlanList()
        const plans = response.data || []
        
        // 构建选项列表，包含"关闭"选项
        planOptions.value = [
          { label: '关闭', value: 0 }
        ]
        
        // 添加订阅计划选项
        if (Array.isArray(plans)) {
          plans.forEach(plan => {
            if (plan && plan.id && plan.name) {
              planOptions.value.push({
                label: plan.name,
                value: plan.id
              })
            }
          })
        }
        
      } catch (error) {
        ElMessage.warning('加载订阅计划失败，请检查网络连接')
        // 如果加载失败，至少提供关闭选项
        planOptions.value = [
          { label: '关闭', value: 0 }
        ]
      }
    }

    // 加载配置数据
    const loadConfig = async () => {
      try {
        const response = await getConfig()
        const data = response.data
        
        // 将配置数据合并到configData中
        Object.keys(data).forEach(key => {
          if (data[key] && typeof data[key] === 'object') {
            Object.keys(data[key]).forEach(subKey => {
              let value = data[key][subKey]
              
              // 对于select类型的配置项，确保值是数字类型
              if (subKey === 'try_out_plan_id') {
                value = parseInt(value) || 0
                configData[subKey] = value
                return
              }
              
              // 对于数字select类型的配置项，确保值是数字类型
              if (subKey === 'reset_traffic_method') {
                value = parseInt(value) || 0
                configData[subKey] = value
                return
              }
              
              // 对于事件ID配置项，保持数字类型
              if (['new_order_event_id', 'renew_order_event_id', 'change_order_event_id'].includes(subKey)) {
                value = parseInt(value) || 0
                configData[subKey] = value
                return
              }
              
              // 对于select类型的配置项，保持字符串值
              if (['frontend_theme_sidebar', 'frontend_theme_header'].includes(subKey)) {
                configData[subKey] = value
                return
              }
              
              if (typeof value === 'string') {
                if (value === 'true' || value === '1') {
                  value = true
                } else if (value === 'false' || value === '0') {
                  value = false
                }
              } else if (typeof value === 'number') {
                // 处理数字类型的开关值：1为true，0为false
                if (value === 1) {
                  value = true
                } else if (value === 0) {
                  value = false
                }
              }
              
              configData[subKey] = value
            })
          }
        })
        
        // 设置默认值
        if (configData.try_out_plan_id === undefined || configData.try_out_plan_id === null) {
          configData.try_out_plan_id = 0
        }
        if (configData.reset_traffic_method === undefined || configData.reset_traffic_method === null) {
          configData.reset_traffic_method = 0
        }
        
        // 初始化最后保存的数据
        lastSavedData.value = JSON.parse(JSON.stringify(configData))
      } catch (error) {
        ElMessage.error('加载配置失败，请刷新页面重试')
      }
    }

    // 组件挂载时加载数据
    onMounted(async () => {
      await Promise.all([
        loadConfig(),
        loadPlanOptions()
      ])
    })

    // 组件卸载时清理定时器
    onUnmounted(() => {
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value)
      }
    })

          return {
        activeTab,
        tabs,
        configData,
        currentConfigItems,
        isTabSwitching,
        planOptions,
        switchTab,
        handleConfigChange,
        handleButtonClick
      }
  }
}
</script>

<style lang="scss" scoped>
.system-config {
  padding: 20px;
  
  .config-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .tab-navigation {
      display: flex;
      border-bottom: 1px solid #e4e7ed;
      margin-bottom: 20px;
      
      .tab-item {
        padding: 12px 24px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;
        font-size: 14px;
        color: #606266;
        
        &:hover {
          color: #409eff;
        }
        
        &.active {
          color: #409eff;
          border-bottom-color: #409eff;
        }
      }
    }
    
    .config-content {

      .config-table {
        .config-row {
          display: flex;
          align-items: flex-start;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .config-label {
            flex: 0 0 300px;
            padding-right: 20px;
            
            .config-title {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .config-description {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
            }
          }
          
                      .config-control {
              flex: 1;
              display: flex;
              justify-content: flex-end;
              padding-right: 20px;
              
              :deep(.el-input),
              :deep(.el-input-number),
              :deep(.el-textarea) {
                width: 300px;
              }
              
              :deep(.el-select) {
                width: 300px;
              }
              
              .select-with-refresh {
                :deep(.el-select) {
                  width: 300px;
                }
              }
              
              :deep(.el-switch) {
                margin-right: 0;
              }
            
            :deep(.el-button) {
              margin-right: 0;
              background-color: #0665d0;
              border-color: #0665d0;
              
              &:hover {
                background-color: #0556b3;
                border-color: #0556b3;
              }
              
              &:active {
                background-color: #044a9a;
                border-color: #044a9a;
              }
            }
            
            :deep(.el-switch) {
              margin-right: 0;
              
              &.is-checked {
                .el-switch__core {
                  background-color: #0665d0;
                  border-color: #0665d0;
                }
              }
              
              &:not(.is-checked) {
                .el-switch__label {
                  color: rgba(0, 0, 0, 0.65);
                }
              }
            }
          }
        }
      }
    }

  }
}

// 响应式设计
@media (max-width: 768px) {
  .system-config {
    padding: 10px;
    
    .config-card {
      .tab-navigation {
        flex-wrap: wrap;
        
        .tab-item {
          padding: 8px 16px;
          font-size: 13px;
        }
      }
      
      .config-content {
        .config-table {
          .config-row {
            flex-direction: column;
            
            .config-label {
              flex: none;
              width: 100%;
              margin-bottom: 12px;
            }
            
            .config-control {
              flex: none;
              width: 100%;
              justify-content: flex-end;
              padding-right: 0;
              min-height: 40px;
              display: flex;
              align-items: center;
              
              :deep(.el-input),
              :deep(.el-input-number),
              :deep(.el-textarea),
              :deep(.el-select) {
                width: 100%;
                min-height: 40px;
              }
              
              .select-with-refresh {
                width: 100%;
                
                :deep(.el-select) {
                  width: 100%;
                  min-width: 280px;
                }
              }
              
              :deep(.el-switch) {
                align-self: flex-end;
                margin-left: auto;
              }
              
              :deep(.el-button) {
                min-height: 40px;
                padding: 8px 16px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .system-config {
    padding: 8px;
    
    .config-card {
      .tab-navigation {
        .tab-item {
          padding: 6px 12px;
          font-size: 12px;
        }
      }
      
      .config-content {
        .config-table {
          .config-row {
            .config-label {
              margin-bottom: 8px;
              
              .config-title {
                font-size: 14px;
              }
              
              .config-description {
                font-size: 12px;
              }
            }
            
            .config-control {
              min-height: 44px;
              
              :deep(.el-input),
              :deep(.el-input-number),
              :deep(.el-textarea),
              :deep(.el-select) {
                font-size: 14px;
                min-height: 44px;
              }
              
              .select-with-refresh {
                width: 100%;
                
                :deep(.el-select) {
                  width: 100%;
                  min-width: 300px;
                }
              }
              
              :deep(.el-switch) {
                transform: scale(0.9);
              }
              
              :deep(.el-button) {
                min-height: 44px;
                padding: 10px 18px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
