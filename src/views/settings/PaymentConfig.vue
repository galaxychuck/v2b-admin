<template>
  <div class="payment-config page-container">
    <el-card class="payment-card">
      <div class="card-header">
        <a-button type="primary" @click="showAddModal">
          <el-icon><Plus /></el-icon>
          添加支付方式
        </el-button>
      </div>
      
      <div class="payment-table mobile-payment-table">
        <AntTable :data-source="paymentList" :loading="loading" style="width: 100%">

        </AntTable>
      </div>
    </el-card>

    <!-- 添加/编辑支付方式模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑支付方式' : '添加支付方式'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="160px"
        v-loading="formLoading"
        class="payment-form"
      >
        <el-form-item label="显示名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="用于前端显示使用"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="图标URL (选填)" prop="icon">
          <el-input
            v-model="formData.icon"
            placeholder="用于前端显示使用 (https://x.com/icon.svg)"
          />
        </el-form-item>
        
        <el-form-item label="自定义通知域名 (选填)" prop="notify_domain">
          <el-input
            v-model="formData.notify_domain"
            placeholder="网关的通知将会发送到该域名 (https://x.com)"
          />
        </el-form-item>
        
        <el-form-item label="手续费设置" class="fee-form-item">
          <div class="fee-inputs">
            <el-form-item prop="handling_fee_percent" class="fee-item">
              <el-input
                v-model="formData.handling_fee_percent"
                placeholder="在订单金额基础上附加手续费"
                type="number"
                min="0"
                max="100"
                step="0.1"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>
            <el-form-item prop="handling_fee_fixed" class="fee-item">
              <el-input
                v-model="formData.handling_fee_fixed"
                placeholder="在订单金额基础上附加手续费"
                type="number"
                min="0"
                step="0.01"
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>
        
        <el-form-item label="接口文件" prop="payment">
          <el-select
            v-model="formData.payment"
            placeholder="请选择支付接口"
            @change="loadPaymentForm"
            style="width: 100%"
          >
            <el-option
              v-for="method in paymentMethods"
              :key="method"
              :label="method"
              :value="method"
            />
          </el-select>
        </el-form-item>
        
        <!-- 动态表单字段 -->
        <template v-if="paymentFormFields.length > 0">
          <el-form-item
            v-for="field in paymentFormFields"
            :key="field.key"
            :label="field.label"
            :prop="`config.${field.key}`"
          >
            <el-input
              v-if="field.type === 'input'"
              v-model="formData.config[field.key]"
              :placeholder="field.description || `请输入${field.label}`"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData.config[field.key]"
              type="textarea"
              :rows="3"
              :placeholder="field.description || `请输入${field.label}`"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData.config[field.key]"
              :placeholder="`请选择${field.label}`"
              style="width: 100%"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <a-button @click="modalVisible = false">取消</a-button>
        <a-button type="primary" @click="savePayment" :loading="saveLoading">
          {{ isEdit ? '保存' : '添加' }}
        </a-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled, Rank } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import {
  getPaymentList,
  getPaymentMethods,
  getPaymentForm,
  savePayment,
  deletePayment,
  togglePayment,
  sortPayments
} from '@/api/payment'
import { getConfig } from '@/api/settings'

export default {
  name: 'PaymentConfig',
  components: {
    Plus,
    QuestionFilled,
    Rank
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const paymentList = ref([])
    const paymentMethods = ref([])
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const formLoading = ref(false)
    const saveLoading = ref(false)
    const formRef = ref(null)
    const paymentFormFields = ref([])
    const systemConfig = ref({})
    
    // 表单数据
    const formData = reactive({
      id: null,
      name: '',
      icon: '',
      payment: '',
      notify_domain: '',
      handling_fee_percent: '',
      handling_fee_fixed: '',
      config: {}
    })
    
    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '显名称不能为空示', trigger: 'blur' }
      ],
      payment: [
        { required: true, message: '请选择支付接口', trigger: 'change' }
      ],
      notify_domain: [
        { type: 'url', message: '自定义通知域名格式有误', trigger: 'blur' }
      ],
      handling_fee_percent: [
        { type: 'number', min: 0, max: 100, message: '百分比手续费范围须在0-100之间', trigger: 'blur' }
      ],
      handling_fee_fixed: [
        { type: 'number', min: 0, message: '固定手续费不能为负数', trigger: 'blur' }
      ]
    }
    
    // 加载支付方式列表
    const loadPaymentList = async () => {
      loading.value = true
      try {
        const response = await getPaymentList()
        const data = response.data || []
        
        // 处理数据，确保enable字段为布尔值
        paymentList.value = data.map(item => ({
          ...item,
          enable: Boolean(item.enable),
          toggleLoading: false
        }))
        
        // 初始化拖拽排序
        initSortable()
      } catch (error) {
        ElMessage.error('加载支付方式列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 加载支付接口选项
    const loadPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods()
        paymentMethods.value = response.data || []
      } catch (error) {
        ElMessage.error('加载支付接口选项失败')
      }
    }
    
    // 加载系统设置
    const loadSystemConfig = async () => {
      try {
        const response = await getConfig()
        systemConfig.value = response.data || {}
      } catch (error) {
        console.error('加载系统设置失败:', error)
      }
    }
    
    // 获取支付图标URL
    const getPaymentIconUrl = (iconPath) => {
      if (!iconPath) return ''
      
      // 如果已经是完整URL，直接返回
      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath
      }
      
      // 如果是相对路径，拼接系统设置的app_url
      const appUrl = systemConfig.value.site?.app_url || ''
      if (appUrl && iconPath.startsWith('/')) {
        return `${appUrl}${iconPath}`
      }
      
      return iconPath
    }
    
    // 处理图标加载错误
    const handleIconError = (event) => {
      // 隐藏加载失败的图标
      event.target.style.display = 'none'
    }
    
    // 加载支付表单字段
    const loadPaymentForm = async () => {
      if (!formData.payment) {
        paymentFormFields.value = []
        return
      }
      
      formLoading.value = true
      try {
        const response = await getPaymentForm({
          payment: formData.payment,
          id: formData.id
        })
        
        const form = response.data || {}
        paymentFormFields.value = Object.keys(form).map(key => ({
          key,
          ...form[key]
        }))
        
        // 如果是编辑模式，填充现有配置
        if (isEdit.value && formData.config) {
          Object.keys(form).forEach(key => {
            if (form[key].value !== undefined) {
              formData.config[key] = form[key].value
            }
          })
        }
      } catch (error) {
        ElMessage.error('加载支付表单失败')
      } finally {
        formLoading.value = false
      }
    }
    
    // 显示添加模态框
    const showAddModal = () => {
      isEdit.value = false
      resetForm()
      modalVisible.value = true
    }
    
    // 显示编辑模态框
    const showEditModal = (row) => {
      isEdit.value = true
      resetForm()
      
      // 填充表单数据
      formData.id = row.id
      formData.name = row.name
      formData.icon = row.icon || ''
      formData.payment = row.payment
      formData.notify_domain = row.notify_domain || ''
      formData.handling_fee_percent = row.handling_fee_percent || ''
      formData.handling_fee_fixed = row.handling_fee_fixed || ''
      formData.config = { ...row.config }
      
      modalVisible.value = true
      
      // 加载支付表单字段
      loadPaymentForm()
    }
    
    // 重置表单
    const resetForm = () => {
      formData.id = null
      formData.name = ''
      formData.icon = ''
      formData.payment = ''
      formData.notify_domain = ''
      formData.handling_fee_percent = ''
      formData.handling_fee_fixed = ''
      formData.config = {}
      paymentFormFields.value = []
      
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }
    
    // 保存支付方式
    const savePaymentData = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
      } catch (error) {
        return
      }
      
      saveLoading.value = true
      try {
        const data = {
          name: formData.name,
          icon: formData.icon,
          payment: formData.payment,
          notify_domain: formData.notify_domain,
          handling_fee_percent: formData.handling_fee_percent ? parseFloat(formData.handling_fee_percent) : null,
          handling_fee_fixed: formData.handling_fee_fixed ? parseFloat(formData.handling_fee_fixed) : null,
          config: formData.config
        }
        
        if (isEdit.value) {
          data.id = formData.id
        }
        
        await savePayment(data)
        
        ElMessage.success(isEdit.value ? '支付方式更新成功' : '支付方式添加成功')
        modalVisible.value = false
        loadPaymentList()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        saveLoading.value = false
      }
    }
    
    // 删除支付方式
    const deletePaymentData = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除支付方式"${row.name}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await deletePayment({ id: row.id })
        ElMessage.success('删除成功')
        loadPaymentList()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    // 切换支付方式状态
    const togglePaymentStatus = async (row) => {
      row.toggleLoading = true
      try {
        await togglePayment({ id: row.id })
        // 重新加载数据以获取最新的状态
        await loadPaymentList()
        ElMessage.success('状态更新成功')
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        row.toggleLoading = false
      }
    }
    
    // 初始化拖拽排序
    const initSortable = () => {
      nextTick(() => {
        const tbody = document.querySelector('.payment-table .el-table__body-wrapper tbody')
        if (tbody) {
          // 销毁之前的实例
          if (tbody.sortable) {
            tbody.sortable.destroy()
          }
          
          tbody.sortable = Sortable.create(tbody, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: async (evt) => {
              const { oldIndex, newIndex } = evt
              if (oldIndex !== newIndex) {
                try {
                  // 获取新的排序ID数组
                  const newOrder = paymentList.value.map((item, index) => item.id)
                  
                  // 调用排序API
                  await sortPayments({ ids: newOrder })
                  ElMessage.success('排序更新成功')
                  
                  // 重新加载数据以确保排序正确
                  await loadPaymentList()
                } catch (error) {
                  ElMessage.error('排序更新失败')
                  // 重新加载数据恢复原顺序
                  await loadPaymentList()
                }
              }
            }
          })
        }
      })
    }
    
    // 组件挂载时加载数据
    onMounted(async () => {
      await loadSystemConfig()
      await Promise.all([
        loadPaymentList(),
        loadPaymentMethods()
      ])
    })
    
    return {
      loading,
      paymentList,
      paymentMethods,
      modalVisible,
      isEdit,
      formLoading,
      saveLoading,
      formRef,
      paymentFormFields,
      formData,
      formRules,
      systemConfig,
      loadPaymentList,
      loadPaymentMethods,
      loadSystemConfig,
      loadPaymentForm,
      showAddModal,
      showEditModal,
      resetForm,
      savePayment: savePaymentData,
      deletePayment: deletePaymentData,
      togglePayment: togglePaymentStatus,
      initSortable,
      getPaymentIconUrl,
      handleIconError
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-config {
  padding: 20px;
  
  .payment-card {
    .card-header {
      margin-bottom: 20px;
    }
    
    .payment-table,
    .mobile-payment-table {
      .drag-handle {
        transition: color 0.2s;
        
        &:hover {
          color: #0665d0;
        }
      }
      
      .el-table__row {
        cursor: move;
        
        &:hover {
          background-color: #f5f7fa;
        }
      }
      
      // 拖拽样式
      .sortable-ghost {
        opacity: 0.5;
        background-color: #f0f0f0;
      }
      
      .sortable-chosen {
        background-color: #e6f7ff;
      }
      
      .sortable-drag {
        opacity: 0.8;
        transform: rotate(5deg);
      }
      
      .id-badge {
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background-color: #f0f0f0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .payment-name {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .payment-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
      }
      
      .notify-url {
        display: inline-block;
        color: #666;
        font-size: 12px;
        word-break: break-all;
        line-height: 1.4;
      }
      
      .help-icon {
        margin-left: 4px;
        color: #909399;
        cursor: help;
      }
      
      // 移动端响应式样式
      @media (max-width: 768px) {
        // 移动端表格容器优化
        width: 100vw !important;
        margin-left: calc(-50vw + 50%) !important;
        margin-right: calc(-50vw + 50%) !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        
        :deep(.el-table) {
          min-width: 800px !important;
          width: 100% !important;
          
          .el-table__header-wrapper {
            .el-table__header {
              .el-table__cell {
                padding: 8px 4px !important;
                font-size: 12px !important;
                white-space: nowrap !important;
                
                // 排序列/ID列表头优化（第一列）
                &:first-child {
                  min-width: 60px !important;
                  width: 60px !important;
                  max-width: 60px !important;
                }
                
                // 启用列表头优化（第二列）- 作为操作列的一部分
                &:nth-child(2) {
                  min-width: 80px !important;
                  width: 80px !important;
                  max-width: 80px !important;
                  position: sticky !important;
                  right: 100px !important;
                  background-color: #f5f7fa !important;
                  z-index: 998 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  font-weight: bold !important;
                }
                
                // 操作列表头优化（最后一列）- 始终显示
                &:last-child {
                  min-width: 100px !important;
                  width: 100px !important;
                  max-width: 100px !important;
                  position: sticky !important;
                  right: 0 !important;
                  background-color: #f5f7fa !important;
                  z-index: 999 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  font-weight: bold !important;
                }
              }
            }
          }
          
          .el-table__body-wrapper {
            .el-table__body {
              .el-table__row {
                .el-table__cell {
                  padding: 8px 4px !important;
                  font-size: 12px !important;
                  white-space: nowrap !important;
                }
                
                // 排序列/ID列优化（第一列）
                .el-table__cell:first-child {
                  min-width: 60px !important;
                  width: 60px !important;
                  max-width: 60px !important;
                }
                
                // 启用列优化（第二列）- 作为操作列的一部分
                .el-table__cell:nth-child(2) {
                  min-width: 80px !important;
                  width: 80px !important;
                  max-width: 80px !important;
                  position: sticky !important;
                  right: 100px !important;
                  background-color: #fff !important;
                  z-index: 998 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                }
                
                // 操作列固定在右侧 - 始终显示
                .el-table__cell:last-child {
                  position: sticky !important;
                  right: 0 !important;
                  background-color: #fff !important;
                  z-index: 999 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  min-width: 100px !important;
                  width: 100px !important;
                  max-width: 100px !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  
                  .el-button {
                    padding: 4px 8px !important;
                    font-size: 11px !important;
                    min-height: 28px !important;
                    margin: 2px !important;
                  }
                }
              }
            }
          }
        }
        
        // 添加水平滚动条样式
        &::-webkit-scrollbar {
          height: 6px !important;
        }
        
        &::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
          border-radius: 3px !important;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #c1c1c1 !important;
          border-radius: 3px !important;
          
          &:hover {
            background: #a8a8a8 !important;
          }
        }
      }
      
      @media (max-width: 480px) {
        // 超小屏幕表格容器优化
        width: 100vw !important;
        margin-left: calc(-50vw + 50%) !important;
        margin-right: calc(-50vw + 50%) !important;
        
        :deep(.el-table) {
          min-width: 700px !important;
          
          .el-table__header-wrapper {
            .el-table__header {
              .el-table__cell {
                padding: 6px 2px !important;
                font-size: 11px !important;
                
                // 排序列/ID列表头优化（第一列）- 超小屏幕
                &:first-child {
                  min-width: 50px !important;
                  width: 50px !important;
                  max-width: 50px !important;
                }
                
                // 启用列表头优化（第二列）- 超小屏幕，作为操作列的一部分
                &:nth-child(2) {
                  min-width: 70px !important;
                  width: 70px !important;
                  max-width: 70px !important;
                  position: sticky !important;
                  right: 90px !important;
                  background-color: #f5f7fa !important;
                  z-index: 998 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  font-weight: bold !important;
                }
                
                // 操作列表头优化（最后一列）- 超小屏幕，始终显示
                &:last-child {
                  min-width: 90px !important;
                  width: 90px !important;
                  max-width: 90px !important;
                  position: sticky !important;
                  right: 0 !important;
                  background-color: #f5f7fa !important;
                  z-index: 999 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  font-weight: bold !important;
                }
              }
            }
          }
          
          .el-table__body-wrapper {
            .el-table__cell {
              padding: 6px 2px !important;
              font-size: 11px !important;
            }
            
            .el-table__body {
              .el-table__row {
                // 排序列/ID列优化（第一列）- 超小屏幕
                .el-table__cell:first-child {
                  min-width: 50px !important;
                  width: 50px !important;
                  max-width: 50px !important;
                }
                
                // 启用列优化（第二列）- 超小屏幕，作为操作列的一部分
                .el-table__cell:nth-child(2) {
                  min-width: 70px !important;
                  width: 70px !important;
                  max-width: 70px !important;
                  position: sticky !important;
                  right: 90px !important;
                  background-color: #fff !important;
                  z-index: 998 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                }
                
                // 操作列优化 - 超小屏幕，始终显示
                .el-table__cell:last-child {
                  min-width: 90px !important;
                  width: 90px !important;
                  max-width: 90px !important;
                  position: sticky !important;
                  right: 0 !important;
                  background-color: #fff !important;
                  z-index: 999 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
                  display: table-cell !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  border-left: 2px solid #e4e7ed !important;
                  
                  .el-button {
                    padding: 3px 6px !important;
                    font-size: 10px !important;
                    min-height: 24px !important;
                    margin: 1px !important;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  .fee-inputs {
    display: flex;
    gap: 12px;
    width: 100%;
    
    .fee-item {
      flex: 1;
      margin-bottom: 0;
      
      .el-input {
        width: 100%;
      }
    }
  }
  
  .fee-form-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }
  
  // 支付表单样式
  .payment-form {
    padding: 10px 0;
    
    :deep(.el-form-item) {
      margin-bottom: 10px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #303133;
      }
      
      .el-input,
      .el-select {
        .el-input__wrapper {
          padding: 4px 12px;
          min-height: 32px;
        }
      }
    }
    
    :deep(.el-form-item__content) {
      line-height: 1.6;
    }
  }
  
  // 模态框样式
  :deep(.el-dialog) {
    .el-dialog__body {
      padding: 20px 30px;
    }
    
    .el-dialog__footer {
      padding: 15px 30px;
      border-top: 1px solid #f0f0f0;
      text-align: right;
      
      .el-button {
        min-width: 90px;
        margin-left: 10px;
      }
    }
  }
  
  // 自定义按钮和开关颜色
  :deep(.el-button--primary) {
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
  
  :deep(.el-switch.is-checked) {
    .el-switch__core {
      background-color: #0665d0;
      border-color: #0665d0;
    }
  }
  
  :deep(.el-switch:not(.is-checked)) {
    .el-switch__label {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .payment-config {
    padding: 10px;
    
    .payment-card {
      .payment-table {
        .notify-url {
          max-width: 120px;
        }
        
        // 确保操作列在移动端可见
        :deep(.el-table) {
          .el-table__body-wrapper {
            .el-table__body {
              .el-table__row {
                .el-table__cell:last-child {
                  position: sticky !important;
                  right: 0 !important;
                  background-color: #fff !important;
                  z-index: 100 !important;
                  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1) !important;
                  min-width: 150px !important;
                  width: 150px !important;
                }
              }
            }
          }
        }
      }
    }
    
    .fee-inputs {
      flex-direction: column;
      gap: 8px;
    }
  }
}

// 移动端操作列强制显示样式
.mobile-payment-table {
  @media (max-width: 768px) {
    // 移动端表格容器强制优化
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    margin-right: calc(-50vw + 50%) !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    
    :deep(.el-table) {
      min-width: 800px !important;
      
      .el-table__header-wrapper {
        .el-table__header {
          .el-table__cell {
            // 排序列/ID列表头优化（第一列）
            &:first-child {
              min-width: 60px !important;
              width: 60px !important;
              max-width: 60px !important;
            }
            
            // 启用列表头优化（第二列）- 作为操作列的一部分
            &:nth-child(2) {
              min-width: 80px !important;
              width: 80px !important;
              max-width: 80px !important;
              position: sticky !important;
              right: 100px !important;
              background-color: #f5f7fa !important;
              z-index: 998 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
              font-weight: bold !important;
            }
            
            // 操作列表头优化（最后一列）- 始终显示
            &:last-child {
              min-width: 100px !important;
              width: 100px !important;
              max-width: 100px !important;
              position: sticky !important;
              right: 0 !important;
              background-color: #f5f7fa !important;
              z-index: 999 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
              font-weight: bold !important;
            }
          }
        }
      }
      
      .el-table__body-wrapper {
        .el-table__body {
          .el-table__row {
            // 排序列/ID列优化（第一列）
            .el-table__cell:first-child {
              min-width: 60px !important;
              width: 60px !important;
              max-width: 60px !important;
            }
            
            // 启用列优化（第二列）- 作为操作列的一部分
            .el-table__cell:nth-child(2) {
              min-width: 80px !important;
              width: 80px !important;
              max-width: 80px !important;
              position: sticky !important;
              right: 100px !important;
              background-color: #fff !important;
              z-index: 998 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
            }
            
            .el-table__cell:last-child {
              position: sticky !important;
              right: 0 !important;
              background-color: #fff !important;
              z-index: 999 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              min-width: 100px !important;
              width: 100px !important;
              max-width: 100px !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
            }
          }
        }
      }
    }
  }
  
  @media (max-width: 480px) {
    // 超小屏幕表格容器强制优化
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    margin-right: calc(-50vw + 50%) !important;
    
    :deep(.el-table) {
      min-width: 700px !important;
      
      .el-table__header-wrapper {
        .el-table__header {
          .el-table__cell {
            // 排序列/ID列表头优化（第一列）- 超小屏幕
            &:first-child {
              min-width: 50px !important;
              width: 50px !important;
              max-width: 50px !important;
            }
            
            // 启用列表头优化（第二列）- 超小屏幕，作为操作列的一部分
            &:nth-child(2) {
              min-width: 70px !important;
              width: 70px !important;
              max-width: 70px !important;
              position: sticky !important;
              right: 90px !important;
              background-color: #f5f7fa !important;
              z-index: 998 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
              font-weight: bold !important;
            }
            
            // 操作列表头优化（最后一列）- 超小屏幕，始终显示
            &:last-child {
              min-width: 90px !important;
              width: 90px !important;
              max-width: 90px !important;
              position: sticky !important;
              right: 0 !important;
              background-color: #f5f7fa !important;
              z-index: 999 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
              font-weight: bold !important;
            }
          }
        }
      }
      
      .el-table__body-wrapper {
        .el-table__body {
          .el-table__row {
            // 排序列/ID列优化（第一列）- 超小屏幕
            .el-table__cell:first-child {
              min-width: 50px !important;
              width: 50px !important;
              max-width: 50px !important;
            }
            
            // 启用列优化（第二列）- 超小屏幕，作为操作列的一部分
            .el-table__cell:nth-child(2) {
              min-width: 70px !important;
              width: 70px !important;
              max-width: 70px !important;
              position: sticky !important;
              right: 90px !important;
              background-color: #fff !important;
              z-index: 998 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
            }
            
            // 操作列优化 - 超小屏幕，始终显示
            .el-table__cell:last-child {
              min-width: 90px !important;
              width: 90px !important;
              max-width: 90px !important;
              position: sticky !important;
              right: 0 !important;
              background-color: #fff !important;
              z-index: 999 !important;
              box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
              display: table-cell !important;
              visibility: visible !important;
              opacity: 1 !important;
              border-left: 2px solid #e4e7ed !important;
            }
          }
        }
      }
    }
  }
}
</style>
