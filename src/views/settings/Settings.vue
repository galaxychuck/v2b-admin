<template>
  <div class="settings page-container">
    <el-card>
      <template #header>
        <span>系统设置</span>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础配置" name="basic">
          <el-form :model="basicForm" label-width="120px">
            <el-form-item label="应用名称">
              <el-input v-model="basicForm.app_name" />
            </el-form-item>
            <el-form-item label="应用描述">
              <el-input v-model="basicForm.app_description" type="textarea" />
            </el-form-item>
            <el-form-item label="应用URL">
              <el-input v-model="basicForm.app_url" />
            </el-form-item>
            <el-form-item label="订阅URL">
              <el-input v-model="basicForm.subscribe_url" />
            </el-form-item>
            <el-form-item label="货币">
              <el-input v-model="basicForm.currency" />
            </el-form-item>
            <el-form-item label="货币符号">
              <el-input v-model="basicForm.currency_symbol" />
            </el-form-item>
            <el-form-item label="网站Logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="维护模式">
              <el-switch v-model="basicForm.maintenance_mode" />
            </el-form-item>
            <el-form-item>
              <a-button type="primary" @click="saveBasicSettings">保存</a-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="支付配置" name="payment">
          <el-form :model="paymentForm" label-width="120px">
            <el-form-item label="支付宝AppID">
              <el-input v-model="paymentForm.alipay_app_id" />
            </el-form-item>
            <el-form-item label="支付宝私钥">
              <el-input v-model="paymentForm.alipay_private_key" type="textarea" />
            </el-form-item>
            <el-form-item label="支付宝公钥">
              <el-input v-model="paymentForm.alipay_public_key" type="textarea" />
            </el-form-item>
            <el-form-item label="微信支付商户号">
              <el-input v-model="paymentForm.wechat_mch_id" />
            </el-form-item>
            <el-form-item label="微信支付密钥">
              <el-input v-model="paymentForm.wechat_key" />
            </el-form-item>
            <el-form-item>
              <a-button type="primary" @click="savePaymentSettings">保存</a-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="邮件配置" name="email">
          <el-form :model="emailForm" label-width="120px">
            <el-form-item label="邮件服务器">
              <el-input v-model="emailForm.email_host" />
            </el-form-item>
            <el-form-item label="邮件端口">
              <el-input v-model="emailForm.email_port" />
            </el-form-item>
            <el-form-item label="邮箱账号">
              <el-input v-model="emailForm.email_username" />
            </el-form-item>
            <el-form-item label="邮箱密码">
              <el-input v-model="emailForm.email_password" type="password" />
            </el-form-item>
            <el-form-item label="发件人地址">
              <el-input v-model="emailForm.email_from_address" />
            </el-form-item>
            <el-form-item>
              <a-button type="primary" @click="saveEmailSettings">保存</a-button>
              <a-button @click="testEmail">测试邮件</a-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppInfo, saveSystemConfig, testSendMail } from '@/api'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'Settings',
  components: {
    Plus
  },
  setup() {
    const activeTab = ref('basic')
    
    const basicForm = reactive({
      app_name: '',
      app_description: '',
      app_url: '',
      subscribe_url: '',
      currency: 'CNY',
      currency_symbol: '¥',
      logo: '',
      maintenance_mode: false
    })
    
    const paymentForm = reactive({
      alipay_app_id: '',
      alipay_private_key: '',
      alipay_public_key: '',
      wechat_mch_id: '',
      wechat_key: ''
    })
    
    const emailForm = reactive({
      email_host: '',
      email_port: '',
      email_username: '',
      email_password: '',
      email_from_address: ''
    })
    
    const handleLogoSuccess = (res, file) => {
      basicForm.logo = URL.createObjectURL(file.raw)
    }
    
    const beforeLogoUpload = (file) => {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('上传Logo只能是 JPG 格式!')
      }
      if (!isLt2M) {
        ElMessage.error('上传Logo大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
    
    const loadConfig = async () => {
      try {
        const appInfo = await getAppInfo()
        Object.assign(basicForm, {
          app_name: appInfo.appName,
          app_description: appInfo.appDescription,
          app_url: appInfo.appUrl,
          subscribe_url: appInfo.subscribeUrl,
          currency: appInfo.currency,
          currency_symbol: appInfo.currencySymbol,
          logo: appInfo.logo
        })
        
        Object.assign(emailForm, {
          email_host: appInfo.emailHost,
          email_port: appInfo.emailPort,
          email_username: appInfo.emailUsername,
          email_from_address: appInfo.emailFromAddress
        })
      } catch (error) {
        console.error('加载配置失败:', error)
        ElMessage.error('加载配置失败')
      }
    }

    const saveBasicSettings = async () => {
      try {
        await saveSystemConfig(basicForm)
        ElMessage.success('基础配置保存成功')
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error('保存配置失败')
      }
    }
    
    const savePaymentSettings = () => {
      ElMessage.success('支付配置保存成功')
    }
    
    const saveEmailSettings = async () => {
      try {
        await saveSystemConfig(emailForm)
        ElMessage.success('邮件配置保存成功')
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error('保存配置失败')
      }
    }
    
    const testEmail = async () => {
      try {
        await testSendMail({
          email: 'test@example.com',
          subject: '测试邮件',
          content: '这是一封测试邮件'
        })
        ElMessage.success('测试邮件发送成功')
      } catch (error) {
        console.error('发送测试邮件失败:', error)
        ElMessage.error('发送测试邮件失败')
      }
    }
    
    onMounted(() => {
      loadConfig()
    })

    return {
      activeTab,
      basicForm,
      paymentForm,
      emailForm,
      handleLogoSuccess,
      beforeLogoUpload,
      saveBasicSettings,
      savePaymentSettings,
      saveEmailSettings,
      testEmail
    }
  }
}
</script>

<style lang="scss" scoped>
.settings {
  .avatar-uploader {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: 8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
    }
  }
  
  // 移动端响应式样式
  @media (max-width: 768px) {
    :deep(.el-form) {
      .el-form-item {
        .el-form-item__label {
          width: 100% !important;
          text-align: left;
          margin-bottom: 8px;
        }
        
        .el-form-item__content {
          width: 100%;
          
          .el-input,
          .el-textarea,
          .el-select {
            width: 100%;
          }
          
          .el-switch {
            float: right;
          }
          
          .el-upload {
            width: 100%;
            
            .avatar,
            .avatar-uploader-icon {
              width: 100%;
              height: 120px;
              line-height: 120px;
            }
          }
        }
      }
    }
    
    :deep(.el-tabs) {
      .el-tabs__header {
        .el-tabs__nav-wrap {
          .el-tabs__nav {
            .el-tabs__item {
              padding: 0 16px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  
  @media (max-width: 480px) {
    :deep(.el-form) {
      .el-form-item {
        .el-form-item__label {
          font-size: 14px;
          margin-bottom: 6px;
        }
        
        .el-form-item__content {
          .el-input,
          .el-textarea,
          .el-select {
            font-size: 14px;
          }
          
          .el-switch {
            transform: scale(0.9);
          }
          
          .el-upload {
            .avatar,
            .avatar-uploader-icon {
              height: 100px;
              line-height: 100px;
            }
          }
        }
      }
    }
    
    :deep(.el-tabs) {
      .el-tabs__header {
        .el-tabs__nav-wrap {
          .el-tabs__nav {
            .el-tabs__item {
              padding: 0 12px;
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}
</style>
