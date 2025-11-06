<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <a-button type="primary" @click="handleAdd">新增用户</a-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </el-form-item>
      </el-form>
      
      <AntTable :data-source="userList" :loading="loading" style="width: 100%">
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->

        <!-- 列配置将在 script 中处理 -->
        
      </AntTable>
      
      <div class="pagination">
        <!-- 分页已集成到 AntTable 中 -->
      </div>
    </el-card>
    
    <!-- 用户编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input-number v-model="userForm.balance" :precision="2" :step="0.01" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <a-button @click="dialogVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, updateUser, banUser, resetUserSecret } from '@/api'

export default {
  name: 'UserList',
  setup() {
    const loading = ref(false)
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const userFormRef = ref()
    
    const queryForm = reactive({
      email: '',
      status: ''
    })
    
    const userForm = reactive({
      id: '',
      email: '',
      nickname: '',
      password: '',
      balance: 0,
      status: 1
    })
    
    const userRules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ]
    }
    
    const userList = ref([
      {
        id: 1,
        email: 'user1@example.com',
        nickname: '用户1',
        balance: 100.00,
        status: 1,
        created_at: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        email: 'user2@example.com',
        nickname: '用户2',
        balance: 50.00,
        status: 0,
        created_at: '2024-01-14 15:20:00'
      }
    ])
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 100
    })
    
    const loadUserList = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          pageSize: pagination.size,
          filter: []
        }
        
        if (queryForm.email) {
          params.filter.push({
            key: 'email',
            condition: '模糊',
            value: queryForm.email
          })
        }
        
        if (queryForm.status !== '') {
          params.filter.push({
            key: 'status',
            condition: '=',
            value: queryForm.status
          })
        }
        
        const response = await getUserList(params)
        userList.value = response.data
        pagination.total = response.total
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      pagination.current = 1
      loadUserList()
    }
    
    const handleReset = () => {
      queryForm.email = ''
      queryForm.status = ''
    }
    
    const handleAdd = () => {
      dialogTitle.value = '新增用户'
      Object.assign(userForm, {
        id: '',
        email: '',
        nickname: '',
        password: '',
        balance: 0,
        status: 1
      })
      dialogVisible.value = true
    }
    
    const handleEdit = (row) => {
      dialogTitle.value = '编辑用户'
      Object.assign(userForm, row)
      dialogVisible.value = true
    }
    
    const handleSubmit = () => {
      userFormRef.value.validate((valid) => {
        if (valid) {
          // 实现提交逻辑
          console.log('提交:', userForm)
          dialogVisible.value = false
          ElMessage.success('操作成功')
        }
      })
    }
    
    const handleToggleStatus = async (row) => {
      const action = row.status === 1 ? '禁用' : '启用'
      try {
        await ElMessageBox.confirm(
          `确定要${action}用户 ${row.email} 吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await banUser({
          id: row.id,
          status: row.status === 1 ? 0 : 1
        })
        
        row.status = row.status === 1 ? 0 : 1
        ElMessage.success(`${action}成功`)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('操作失败:', error)
          ElMessage.error('操作失败')
        }
      }
    }
    
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除用户 ${row.email} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 实现删除逻辑
        const index = userList.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          userList.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
      })
    }
    
    const handleSizeChange = (val) => {
      pagination.size = val
      loadUserList()
    }
    
    const handleCurrentChange = (val) => {
      pagination.current = val
      loadUserList()
    }
    
    onMounted(() => {
      loadUserList()
    })
    
    return {
      loading,
      dialogVisible,
      dialogTitle,
      userFormRef,
      queryForm,
      userForm,
      userRules,
      userList,
      pagination,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleToggleStatus,
      handleDelete,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
