<template>
  <div class="order-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="queryForm.order_no" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入用户邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="待支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </el-form-item>
      </el-form>
      
      <AntTable :data-source="orderList" :loading="loading" style="width: 100%">
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->

        <!-- 列配置将在 script 中处理 -->
        
      </AntTable>
      
      <div class="pagination">
        <!-- 分页已集成到 AntTable 中 -->
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'OrderList',
  setup() {
    const loading = ref(false)
    
    const queryForm = reactive({
      order_no: '',
      email: '',
      status: ''
    })
    
    const orderList = ref([
      {
        id: 1,
        order_no: 'ORD202401150001',
        email: 'user1@example.com',
        plan_name: '基础套餐',
        amount: '29.99',
        status: 1,
        created_at: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        order_no: 'ORD202401150002',
        email: 'user2@example.com',
        plan_name: '高级套餐',
        amount: '59.99',
        status: 0,
        created_at: '2024-01-15 09:15:00'
      }
    ])
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 100
    })
    
    const getStatusType = (status) => {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return statusMap[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已取消'
      }
      return statusMap[status] || '未知'
    }
    
    const handleSearch = () => {
      console.log('搜索:', queryForm)
    }
    
    const handleReset = () => {
      queryForm.order_no = ''
      queryForm.email = ''
      queryForm.status = ''
    }
    
    const handleDetail = (row) => {
      console.log('查看详情:', row)
    }
    
    const handleCancel = (row) => {
      ElMessageBox.confirm(
        `确定要取消订单 ${row.order_no} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        row.status = 2
        ElMessage.success('订单已取消')
      })
    }
    
    const handleSizeChange = (val) => {
      pagination.size = val
    }
    
    const handleCurrentChange = (val) => {
      pagination.current = val
    }
    
    onMounted(() => {
      // 加载初始数据
    })
    
    return {
      loading,
      queryForm,
      orderList,
      pagination,
      getStatusType,
      getStatusText,
      handleSearch,
      handleReset,
      handleDetail,
      handleCancel,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list {
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
