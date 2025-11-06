<template>
  <div class="routes">
    <el-card>
      <template #header>
        <div class="card-header">
          <a-buttontype="primary" @click="showAddModal">
            <el-icon><Plus /></el-icon>
            + 添加路由
          </el-button>
        </div>
      </template>
      
      <!-- 路由表格 -->
      <AntTable :data-source="routeList" :loading="loading" style="width: 100%" row.id"
      >
        <!-- ID列 -->
        <!-- 列配置将在 script 中处理 -->
          <template #default="{ row }">
            <span class="route-id">{{ row.id }}</span>
          </template>
        </el-table-column>
        
        <!-- 备注列 -->
        <!-- 列配置将在 script 中处理 -->
          <template #default="{ row }">
            <span class="route-remarks">{{ row.remarks }}</span>
          </template>
        </el-table-column>
        
        <!-- 匹配数量列 -->
        <!-- 列配置将在 script 中处理 -->
          <template #default="{ row }">
            <span class="match-count">
              匹配 {{ Array.isArray(row.match) ? row.match.length : 1 }} 条规则
            </span>
          </template>
        </el-table-column>
        
        <!-- 动作列 -->
        <!-- 列配置将在 script 中处理 -->
          <template #default="{ row }">
            <span class="route-action">{{ getActionText(row.action) }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <!-- 列配置将在 script 中处理 -->
          <template #default="{ row }">
            <div class="operation-buttons">
              <a-buttontype="text" size="small" @click="showEditModal(row)">
                编辑
              </el-button>
              <span class="separator">|</span>
              <a-buttontype="text" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑路由模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑路由' : '创建路由'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        v-loading="formLoading"
      >
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            placeholder="请输入备注"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="匹配值" prop="match">
          <el-input
            v-model="matchInput"
            type="textarea"
            :rows="4"
            placeholder="请输入匹配值，每行一个"
            @input="handleMatchInput"
          />
        </el-form-item>
        
        <el-form-item label="动作" prop="action">
          <el-select
            v-model="formData.action"
            placeholder="请选择动作"
            style="width: 100%"
          >
            <el-option label="禁止访问" value="block" />
            <el-option label="指定DNS服务器进行解析" value="dns" />
          </el-select>
        </el-form-item>
        
        <el-form-item 
          v-if="formData.action === 'dns'" 
          label="DNS服务器" 
          prop="action_value"
        >
          <el-input
            v-model="formData.action_value"
            placeholder="请输入DNS服务器地址"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <a-button@click="modalVisible = false">取消</el-button>
          <a-buttontype="primary" @click="handleSubmit" :loading="submitLoading">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getServerRoutes, saveServerRoute, deleteServerRoute } from '@/api/server'

export default {
  name: 'Routes',
  components: {
    Plus
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const routeList = ref([])
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const formLoading = ref(false)
    const submitLoading = ref(false)
    const formRef = ref(null)
    const matchInput = ref('')
    
    // 表单数据
    const formData = reactive({
      id: null,
      remarks: '',
      match: [],
      action: '',
      action_value: ''
    })
    
    // 表单验证规则
    const formRules = {
      remarks: [
        { required: true, message: '备注不能为空', trigger: 'blur' },
        { min: 1, max: 255, message: '备注长度在 1 到 255 个字符', trigger: 'blur' }
      ],
      match: [
        { required: true, message: '匹配值不能为空', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (!value || value.length === 0) {
              callback(new Error('匹配值不能为空'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ],
      action: [
        { required: true, message: '动作类型不能为空', trigger: 'change' }
      ],
      action_value: [
        { 
          validator: (rule, value, callback) => {
            if (formData.action === 'dns' && (!value || value.trim() === '')) {
              callback(new Error('DNS服务器地址不能为空'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }
    
    // 加载路由列表
    const loadRouteList = async () => {
      loading.value = true
      try {
        const response = await getServerRoutes()
        if (response.data) {
          routeList.value = response.data
        }
      } catch (error) {
        console.error('加载路由列表失败:', error)
        ElMessage.error('加载路由列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 显示添加模态框
    const showAddModal = () => {
      isEdit.value = false
      formData.id = null
      formData.remarks = ''
      formData.match = []
      formData.action = ''
      formData.action_value = ''
      matchInput.value = ''
      modalVisible.value = true
    }
    
    // 显示编辑模态框
    const showEditModal = (row) => {
      isEdit.value = true
      formData.id = row.id
      formData.remarks = row.remarks
      formData.match = Array.isArray(row.match) ? row.match : [row.match]
      formData.action = row.action
      formData.action_value = row.action_value || ''
      
      // 将匹配值数组转换为文本输入
      matchInput.value = Array.isArray(row.match) ? row.match.join('\n') : row.match
      
      modalVisible.value = true
    }
    
    // 处理匹配值输入
    const handleMatchInput = (value) => {
      if (value) {
        // 按行分割，过滤空行
        formData.match = value.split('\n').filter(item => item.trim() !== '')
      } else {
        formData.match = []
      }
    }
    
    // 获取动作显示文本
    const getActionText = (action) => {
      const actionMap = {
        'block': '禁止访问',
        'dns': '指定DNS服务器进行解析'
      }
      return actionMap[action] || action
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
        const response = await saveServerRoute(formData)
        if (response.data) {
          ElMessage.success(isEdit.value ? '路由更新成功' : '路由创建成功')
          modalVisible.value = false
          loadRouteList()
        }
      } catch (error) {
        console.error('保存路由失败:', error)
        ElMessage.error('保存路由失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 删除路由
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除路由 "${row.remarks}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await deleteServerRoute({ id: row.id })
        if (response.data) {
          ElMessage.success('路由删除成功')
          loadRouteList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除路由失败:', error)
          ElMessage.error('删除路由失败')
        }
      }
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      loadRouteList()
    })
    
    return {
      loading,
      routeList,
      modalVisible,
      isEdit,
      formLoading,
      submitLoading,
      formRef,
      formData,
      formRules,
      matchInput,
      loadRouteList,
      showAddModal,
      showEditModal,
      handleMatchInput,
      getActionText,
      handleSubmit,
      handleDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.routes {
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
  
  // 路由ID样式
  .route-id {
    font-weight: 500;
    color: #606266;
  }
  
  // 路由备注样式
  .route-remarks {
    font-weight: 500;
    color: #303133;
  }
  
  // 匹配数量样式
  .match-count {
    color: #606266;
    font-size: 14px;
  }
  
  // 路由动作样式
  .route-action {
    color: #606266;
    font-weight: 500;
  }
  
  // 操作按钮样式
  .operation-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-button {
      color: #409eff;
      padding: 0;
      
      &:hover {
        color: #66b1ff;
      }
    }
    
    .separator {
      color: #dcdfe6;
      font-weight: 300;
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
        justify-content: flex-end;
        gap: 12px;
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
    }
  }
}
</style>
