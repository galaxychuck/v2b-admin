<template>
  <div class="permission-groups">
    <el-card>
      <template #header>
        <div class="card-header">
          <a-button type="primary" @click="showAddModal">
            <el-icon><Plus /></el-icon>
            + 添加权限组
          </el-button>
        </div>
      </template>
      
      <!-- 权限组表格 -->
      <AntTable :data-source="groupList" :loading="loading" style="width: 100%" row.id">
      >
        <!-- 组ID列 -->

        <!-- 组名称列 -->

        <!-- 用户数量列 -->

        <!-- 节点数量列 -->

        <!-- 操作列 -->
        
      </AntTable>
    </el-card>

    <!-- 添加/编辑权限组模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑组' : '创建组'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        v-loading="formLoading"
      >
        <el-form-item label="组名" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入组名"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <a-button @click="modalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
            提交
          </a-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, View } from '@element-plus/icons-vue'
import { getServerGroups, saveServerGroup, deleteServerGroup } from '@/api/server'

export default {
  name: 'PermissionGroups',
  components: {
    Plus,
    User,
    View
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const groupList = ref([])
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const formLoading = ref(false)
    const submitLoading = ref(false)
    const formRef = ref(null)
    
    // 表单数据
    const formData = reactive({
      id: null,
      name: ''
    })
    
    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '组名不能为空', trigger: 'blur' },
        { min: 1, max: 255, message: '组名长度在 1 到 255 个字符', trigger: 'blur' }
      ]
    }
    
    // 加载权限组列表
    const loadGroupList = async () => {
      loading.value = true
      try {
        const response = await getServerGroups()
        if (response.data) {
          groupList.value = response.data
        }
      } catch (error) {
        console.error('加载权限组列表失败:', error)
        ElMessage.error('加载权限组列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 显示添加模态框
    const showAddModal = () => {
      isEdit.value = false
      formData.id = null
      formData.name = ''
      modalVisible.value = true
    }
    
    // 显示编辑模态框
    const showEditModal = (row) => {
      isEdit.value = true
      formData.id = row.id
      formData.name = row.name
      modalVisible.value = true
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
        const response = await saveServerGroup(formData)
        if (response.data) {
          ElMessage.success(isEdit.value ? '权限组更新成功' : '权限组创建成功')
          modalVisible.value = false
          loadGroupList()
        }
      } catch (error) {
        console.error('保存权限组失败:', error)
        ElMessage.error('保存权限组失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 删除权限组
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除权限组 "${row.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await deleteServerGroup({ id: row.id })
        if (response.data) {
          ElMessage.success('权限组删除成功')
          loadGroupList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除权限组失败:', error)
          ElMessage.error('删除权限组失败')
        }
      }
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      loadGroupList()
    })
    
    return {
      loading,
      groupList,
      modalVisible,
      isEdit,
      formLoading,
      submitLoading,
      formRef,
      formData,
      formRules,
      loadGroupList,
      showAddModal,
      showEditModal,
      handleSubmit,
      handleDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-groups {
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
  
  // 组ID样式
  .group-id {
    font-weight: 500;
    color: #606266;
  }
  
  // 组名称样式
  .group-name {
    font-weight: 500;
    color: #303133;
  }
  
  // 用户数量样式
  .user-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    .el-icon {
      color: #909399;
      font-size: 14px;
    }
    
    span {
      color: #606266;
      font-weight: 500;
    }
  }
  
  // 节点数量样式
  .node-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    .el-icon {
      color: #909399;
      font-size: 14px;
    }
    
    span {
      color: #606266;
      font-weight: 500;
    }
  }
  
  // 操作按钮样式
  .operation-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
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
    }
  }
}
</style>
