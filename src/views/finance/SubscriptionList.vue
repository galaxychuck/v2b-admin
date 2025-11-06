<template>
  <div class="subscription-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <a-button type="primary" @click="showAddModal">
            <el-icon><Plus /></el-icon>
            + 添加订阅
          </el-button>
        </div>
      </template>
      
      <!-- 订阅表格 -->
      <AntTable :data-source="planList" :loading="loading" style="width: 100%" row.id"
        :key="tableKey">
      >
        <!-- 排序列 -->

        <!-- 销售状态列 -->

        <!-- 续费列 -->

        <!-- 名称列 -->

        <!-- 统计列 -->

        <!-- 流量列 -->

        <!-- 月付列 -->

        <!-- 季付列 -->

        <!-- 半年付列 -->

        <!-- 年付列 -->

        <!-- 两年付列 -->

        <!-- 三年付列 -->

        <!-- 一次性列 -->

        <!-- 重置包列 -->

        <!-- 权限组列 -->

        <!-- 操作列 -->
        
      </AntTable>
    </el-card>

    <!-- 添加/编辑订阅模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑订阅' : '创建订阅'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="套餐名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入套餐名称"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="套餐描述" prop="content">
          <el-input
            v-model="contentInput"
            type="textarea"
            :rows="6"
            placeholder="请输入套餐描述（JSON格式）"
            @input="handleContentInput"
          />
        </el-form-item>
        
        <el-form-item label="售价设置">
          <div class="price-settings">
            <div class="price-row">
              <el-form-item label="月付" prop="month_price">
                <el-input-number
                  v-model="formData.month_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
              <el-form-item label="季付" prop="quarter_price">
                <el-input-number
                  v-model="formData.quarter_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
            </div>
            <div class="price-row">
              <el-form-item label="半年" prop="half_year_price">
                <el-input-number
                  v-model="formData.half_year_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
              <el-form-item label="年付" prop="year_price">
                <el-input-number
                  v-model="formData.year_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
            </div>
            <div class="price-row">
              <el-form-item label="两年付" prop="two_year_price">
                <el-input-number
                  v-model="formData.two_year_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
              <el-form-item label="三年付" prop="three_year_price">
                <el-input-number
                  v-model="formData.three_year_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
            </div>
            <div class="price-row">
              <el-form-item label="一次性" prop="onetime_price">
                <el-input-number
                  v-model="formData.onetime_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
              <el-form-item label="重置包" prop="reset_price">
                <el-input-number
                  v-model="formData.reset_price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0"
                />
                <span class="currency">¥</span>
              </el-form-item>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="套餐流量" prop="transfer_enable">
          <el-input-number
            v-model="formData.transfer_enable"
            :min="1"
            :precision="0"
            :step="1"
            placeholder="请输入流量"
          />
          <span class="unit">GB</span>
        </el-form-item>
        
        <el-form-item label="权限组" prop="group_id">
          <div class="group-selector">
            <span class="group-label">权限组</span>
            <a-button type="text" @click="showGroupModal">添加权限组</a-button>
          </div>
          <el-select
            v-model="formData.group_id"
            placeholder="请选择权限组"
            style="width: 100%"
          >
            <el-option
              v-for="group in groupList"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="流量重置方式" prop="reset_traffic_method">
          <el-select
            v-model="formData.reset_traffic_method"
            placeholder="请选择重置方式"
            style="width: 100%"
          >
            <el-option label="按月重置" :value="1" />
            <el-option label="按年重置" :value="2" />
            <el-option label="不重置" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大容纳用户量" prop="capacity_limit">
          <el-input-number
            v-model="formData.capacity_limit"
            :min="1"
            :precision="0"
            :step="1"
            placeholder="留空则不限制"
          />
        </el-form-item>
        
        <el-form-item label="限速" prop="speed_limit">
          <el-input-number
            v-model="formData.speed_limit"
            :min="1"
            :precision="0"
            :step="1"
            placeholder="留空则不限制"
          />
          <span class="unit">Mbps</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-checkbox v-model="formData.force_update">强制更新到用户</el-checkbox>
          <div class="footer-buttons">
            <a-button @click="modalVisible = false">取消</a-button>
            <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
              提交
            </a-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Rank, 
  QuestionFilled, 
  User, 
  ArrowDown, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'
import { fetchPlans } from '@/api/config'
import { getServerGroups, saveServerGroup } from '@/api/server'
import { savePlan, sortPlans } from '@/api/plan'
import Sortable from 'sortablejs'

export default {
  name: 'SubscriptionList',
  components: {
    Plus,
    Rank,
    QuestionFilled,
    User,
    ArrowDown,
    Edit,
    Delete
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const planList = ref([])
    const groupList = ref([])
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const formLoading = ref(false)
    const submitLoading = ref(false)
    const formRef = ref(null)
    const contentInput = ref('')
    const tableKey = ref(0)
    
    // 表单数据
    const formData = reactive({
      id: null,
      name: '',
      content: '',
      group_id: null,
      transfer_enable: 200,
      speed_limit: 500,
      show: 1,
      sort: 1,
      renew: 1,
      month_price: null,
      quarter_price: null,
      half_year_price: null,
      year_price: null,
      two_year_price: null,
      three_year_price: null,
      onetime_price: null,
      reset_price: null,
      reset_traffic_method: 1,
      capacity_limit: null,
      force_update: false
    })
    
    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '套餐名称不能为空', trigger: 'blur' },
        { min: 1, max: 255, message: '套餐名称长度在 1 到 255 个字符', trigger: 'blur' }
      ],
      group_id: [
        { required: true, message: '权限组不能为空', trigger: 'change' }
      ],
      transfer_enable: [
        { required: true, message: '套餐流量不能为空', trigger: 'blur' },
        { type: 'number', min: 1, message: '套餐流量必须大于0', trigger: 'blur' }
      ],
      speed_limit: [
        { type: 'number', min: 1, message: '限速必须大于0', trigger: 'blur' }
      ],
      capacity_limit: [
        { type: 'number', min: 1, message: '最大容纳用户量必须大于0', trigger: 'blur' }
      ]
    }
    
    // 加载订阅列表
    const loadPlanList = async () => {
      loading.value = true
      try {
        const response = await fetchPlans()
        if (response.data) {
          planList.value = response.data.map(plan => ({
            ...plan,
            // 将数字转换为布尔值：1 -> true, 0 -> false
            show: Boolean(plan.show),
            renew: Boolean(plan.renew),
            showLoading: false,
            renewLoading: false
          }))
        }
      } catch (error) {
        console.error('加载订阅列表失败:', error)
        ElMessage.error('加载订阅列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 加载权限组列表
    const loadGroupList = async () => {
      try {
        const response = await getServerGroups()
        if (response.data) {
          groupList.value = response.data
        }
      } catch (error) {
        console.error('加载权限组列表失败:', error)
      }
    }
    
    // 显示添加模态框
    const showAddModal = () => {
      isEdit.value = false
      resetFormData()
      modalVisible.value = true
    }
    
    // 显示编辑模态框
    const showEditModal = (row) => {
      isEdit.value = true
      console.log('编辑的行数据:', row) // 调试用
      
      Object.assign(formData, {
        id: row.id,
        name: row.name,
        content: row.content || '',
        group_id: row.group_id,
        transfer_enable: parseInt(row.transfer_enable) || 0,
        speed_limit: row.speed_limit ? parseInt(row.speed_limit) : null,
        show: row.show ? 1 : 0, // 转换为数字格式
        sort: parseInt(row.sort) || 1,
        renew: row.renew ? 1 : 0, // 转换为数字格式
        month_price: row.month_price ? parseFloat((row.month_price / 100).toFixed(2)) : null,
        quarter_price: row.quarter_price ? parseFloat((row.quarter_price / 100).toFixed(2)) : null,
        half_year_price: row.half_year_price ? parseFloat((row.half_year_price / 100).toFixed(2)) : null,
        year_price: row.year_price ? parseFloat((row.year_price / 100).toFixed(2)) : null,
        two_year_price: row.two_year_price ? parseFloat((row.two_year_price / 100).toFixed(2)) : null,
        three_year_price: row.three_year_price ? parseFloat((row.three_year_price / 100).toFixed(2)) : null,
        onetime_price: row.onetime_price ? parseFloat((row.onetime_price / 100).toFixed(2)) : null,
        reset_price: row.reset_price ? parseFloat((row.reset_price / 100).toFixed(2)) : null,
        reset_traffic_method: parseInt(row.reset_traffic_method) || 1,
        capacity_limit: row.capacity_limit ? parseInt(row.capacity_limit) : null,
        force_update: false
      })
      
      console.log('转换后的表单数据:', formData) // 调试用
      
      // 将内容JSON转换为文本输入
      contentInput.value = row.content || ''
      
      modalVisible.value = true
    }
    
    // 重置表单数据
    const resetFormData = () => {
      Object.assign(formData, {
        id: null,
        name: '',
        content: '',
        group_id: null,
        transfer_enable: 200,
        speed_limit: 500,
        show: 1,
        sort: 1,
        renew: 1,
        month_price: null,
        quarter_price: null,
        half_year_price: null,
        year_price: null,
        two_year_price: null,
        three_year_price: null,
        onetime_price: null,
        reset_price: null,
        reset_traffic_method: 1,
        capacity_limit: null,
        force_update: false
      })
      contentInput.value = ''
    }
    
    // 处理内容输入
    const handleContentInput = (value) => {
      formData.content = value
    }
    
    // 获取权限组名称
    const getGroupName = (groupId) => {
      const group = groupList.value.find(g => g.id === groupId)
      return group ? group.name : '未知'
    }
    
    // 格式化价格显示
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '-'
      return (price / 100).toFixed(2)
    }
    
    // 处理销售状态变更
    const handleShowChange = async (row) => {
      row.showLoading = true
      try {
        // 这里需要调用后端API更新状态
        // await updatePlan({ id: row.id, show: row.show ? 1 : 0 })
        ElMessage.success('销售状态更新成功')
      } catch (error) {
        row.show = !row.show // 恢复原状态
        ElMessage.error('销售状态更新失败')
      } finally {
        row.showLoading = false
      }
    }
    
    // 处理续费状态变更
    const handleRenewChange = async (row) => {
      row.renewLoading = true
      try {
        // 这里需要调用后端API更新状态
        // await updatePlan({ id: row.id, renew: row.renew ? 1 : 0 })
        ElMessage.success('续费状态更新成功')
      } catch (error) {
        row.renew = !row.renew // 恢复原状态
        ElMessage.error('续费状态更新失败')
      } finally {
        row.renewLoading = false
      }
    }
    
    // 处理操作命令
    const handleCommand = ({ action, row }) => {
      if (action === 'edit') {
        showEditModal(row)
      } else if (action === 'delete') {
        handleDelete(row)
      }
    }
    
    // 删除订阅
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除订阅 "${row.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 这里需要调用后端API删除
        // await deletePlan({ id: row.id })
        ElMessage.success('订阅删除成功')
        loadPlanList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订阅失败:', error)
          ElMessage.error('删除订阅失败')
        }
      }
    }
    
    // 显示权限组模态框
    const showGroupModal = () => {
      // 这里可以实现添加权限组的逻辑
      ElMessage.info('权限组管理功能请前往权限组管理页面')
    }
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
      } catch (error) {
        return
      }
      
      submitLoading.value = true
      try {
        // 转换价格格式（元转分）
        const submitData = {
          ...formData,
          month_price: formData.month_price ? Math.round(formData.month_price * 100) : null,
          quarter_price: formData.quarter_price ? Math.round(formData.quarter_price * 100) : null,
          half_year_price: formData.half_year_price ? Math.round(formData.half_year_price * 100) : null,
          year_price: formData.year_price ? Math.round(formData.year_price * 100) : null,
          two_year_price: formData.two_year_price ? Math.round(formData.two_year_price * 100) : null,
          three_year_price: formData.three_year_price ? Math.round(formData.three_year_price * 100) : null,
          onetime_price: formData.onetime_price ? Math.round(formData.onetime_price * 100) : null,
          reset_price: formData.reset_price ? Math.round(formData.reset_price * 100) : null,
          // 确保 capacity_limit 为空时传送 null
          capacity_limit: formData.capacity_limit || null,
          // 确保 transfer_enable 是数字
          transfer_enable: parseInt(formData.transfer_enable) || 0,
          // 确保 speed_limit 是数字或 null
          speed_limit: formData.speed_limit ? parseInt(formData.speed_limit) : null,
          // 确保 reset_traffic_method 是数字
          reset_traffic_method: parseInt(formData.reset_traffic_method) || 1
        }
        
        console.log('提交的数据:', submitData) // 调试用
        
        // 调用后端API保存
        const response = await savePlan(submitData)
        if (response.data) {
          ElMessage.success(isEdit.value ? '订阅更新成功' : '订阅创建成功')
          modalVisible.value = false
          loadPlanList()
        } else {
          throw new Error('保存失败')
        }
      } catch (error) {
        console.error('保存订阅失败:', error)
        ElMessage.error('保存订阅失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 初始化拖拽排序
    const initSortable = () => {
      nextTick(() => {
        const tbody = document.querySelector('.el-table__body-wrapper tbody')
        if (tbody) {
          Sortable.create(tbody, {
            handle: '.sort-handle',
            animation: 150,
            onEnd: async ({ newIndex, oldIndex }) => {
              if (newIndex === oldIndex) return
              
              const newList = [...planList.value]
              const movedItem = newList.splice(oldIndex, 1)[0]
              newList.splice(newIndex, 0, movedItem)
              
              // 更新排序 - 后端期望的是 plan_ids: [id1, id2, id3] 格式
              const planIds = newList.map(item => item.id)
              
              try {
                console.log('排序数据:', planIds) // 调试用
                
                // 调用后端API更新排序
                const response = await sortPlans({ plan_ids: planIds })
                if (response.data) {
                  ElMessage.success('排序更新成功')
                  // 更新本地数据，避免重新加载
                  planList.value = newList.map((item, index) => ({
                    ...item,
                    sort: index + 1
                  }))
                } else {
                  throw new Error('排序更新失败')
                }
              } catch (error) {
                console.error('排序更新失败:', error)
                ElMessage.error('排序更新失败')
                // 恢复原始顺序
                loadPlanList()
              }
            }
          })
        }
      })
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      loadPlanList()
      loadGroupList()
      initSortable()
    })
    
    return {
      loading,
      planList,
      groupList,
      modalVisible,
      isEdit,
      formLoading,
      submitLoading,
      formRef,
      formData,
      formRules,
      contentInput,
      tableKey,
      loadPlanList,
      loadGroupList,
      showAddModal,
      showEditModal,
      resetFormData,
      handleContentInput,
      getGroupName,
      formatPrice,
      handleShowChange,
      handleRenewChange,
      handleCommand,
      handleDelete,
      showGroupModal,
      handleSubmit,
      initSortable
    }
  }
}
</script>

<style lang="scss" scoped>
.subscription-list {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  // 表格样式
  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
        color: #606266;
        font-weight: 500;
      }
    }
    
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
  
  // 排序手柄样式
  .sort-handle {
    cursor: move;
    color: #909399;
    
    &:hover {
      color: #409eff;
    }
  }
  
  // 状态控制样式
  .status-controls {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  // 续费控制样式
  .renew-control {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    
    .question-icon {
      color: #909399;
      font-size: 14px;
    }
  }
  
  // 套餐名称样式
  .plan-name {
    font-weight: 500;
    color: #303133;
  }
  
  // 用户统计样式
  .user-count {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    
    .el-icon {
      color: #909399;
    }
  }
  
  // 流量样式
  .traffic {
    color: #606266;
    font-weight: 500;
  }
  
  // 价格样式
  .price {
    color: #606266;
    font-weight: 500;
  }
  
  // 权限组标签样式
  .group-tag {
    background-color: #f0f0f0;
    color: #303133;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
  }
  
  // 操作按钮样式
  .operation-button {
    color: #409eff;
    padding: 0;
    
    &:hover {
      color: #66b1ff;
    }
  }
  
  // 模态框样式
  :deep(.el-dialog) {
    .el-dialog__header {
      border-bottom: 1px solid #ebeef5;
      padding: 20px 20px 15px;
      
      .el-dialog__title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
    
    .el-dialog__body {
      padding: 20px;
    }
    
    .el-dialog__footer {
      border-top: 1px solid #ebeef5;
      padding: 15px 20px 20px;
      
      .dialog-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .footer-buttons {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
  
  // 表单样式
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 20px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #303133;
      }
      
      .el-input {
        .el-input__wrapper {
          border-radius: 4px;
          
          &:hover {
            border-color: #c0c4cc;
          }
          
          &.is-focus {
            border-color: #409eff;
          }
        }
      }
      
      .el-textarea {
        .el-textarea__inner {
          border-radius: 4px;
          
          &:hover {
            border-color: #c0c4cc;
          }
          
          &:focus {
            border-color: #409eff;
          }
        }
      }
      
      .el-select {
        .el-input__wrapper {
          border-radius: 4px;
          
          &:hover {
            border-color: #c0c4cc;
          }
          
          &.is-focus {
            border-color: #409eff;
          }
        }
      }
      
      .el-input-number {
        .el-input__wrapper {
          border-radius: 4px;
          
          &:hover {
            border-color: #c0c4cc;
          }
          
          &.is-focus {
            border-color: #409eff;
          }
        }
      }
    }
  }
  
  // 价格设置样式
  .price-settings {
    .price-row {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      
      .el-form-item {
        flex: 1;
        margin-bottom: 0;
        
        .el-form-item__content {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .currency {
            color: #606266;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  // 单位样式
  .unit {
    color: #606266;
    font-weight: 500;
    margin-left: 8px;
  }
  
  // 权限组选择器样式
  .group-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .group-label {
      color: #606266;
      font-weight: 500;
    }
    
    .el-button {
      color: #409eff;
      padding: 0;
      
      &:hover {
        color: #66b1ff;
      }
    }
  }
}
</style>
