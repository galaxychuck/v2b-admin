<template>
  <div class="server-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服务器管理</span>
          <a-button type="primary" @click="handleAdd">新增服务器</a-button>
        </div>
      </template>
      
      <AntTable :data-source="serverList" :loading="loading" style="width: 100%">
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        
        <!-- 列配置将在 script 中处理 -->
        <!-- 列配置将在 script 中处理 -->
        
      </AntTable>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ServerList',
  setup() {
    const loading = ref(false)
    
    const serverList = ref([
      {
        id: 1,
        name: '香港服务器1',
        host: 'hk1.example.com',
        port: 443,
        status: 1,
        type: 'V2Ray',
        created_at: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '美国服务器1',
        host: 'us1.example.com',
        port: 443,
        status: 0,
        type: 'V2Ray',
        created_at: '2024-01-14 15:20:00'
      }
    ])
    
    const handleAdd = () => {
      ElMessage.info('新增服务器功能开发中')
    }
    
    const handleEdit = (row) => {
      ElMessage.info('编辑服务器功能开发中')
    }
    
    const handleTest = (row) => {
      ElMessage.info('测试服务器功能开发中')
    }
    
    const handleDelete = (row) => {
      ElMessage.info('删除服务器功能开发中')
    }
    
    onMounted(() => {
      // 加载初始数据
    })
    
    return {
      loading,
      serverList,
      handleAdd,
      handleEdit,
      handleTest,
      handleDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.server-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
