<template>
  <div class="queue-monitor">
    <!-- 总览部分 -->
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span>总览</span>
        </div>
      </template>
      
      <div class="overview-grid">
        <div class="metric-item">
          <div class="metric-label">当前作业量</div>
          <div class="metric-value">{{ queueStats.recentJobs || 0 }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">近一小时处理量</div>
          <div class="metric-value">{{ queueStats.jobsPerMinute || 0 }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">7日内报错数量</div>
          <div class="metric-value">{{ queueStats.failedJobs || 0 }}</div>
        </div>
        
        <div class="metric-item status-item">
          <div class="metric-label">状态</div>
          <div class="metric-value status-value">
            <span>{{ queueStats.status ? '运行' : '未运行' }}</span>
            <el-icon class="status-icon" :class="{ 'running': queueStats.status, 'paused': !queueStats.status }">
              <Check v-if="queueStats.status" />
              <Close v-else />
            </el-icon>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 当前作业详情部分 -->
    <el-card class="details-card">
      <template #header>
        <div class="card-header">
          <span>当前作业详情</span>
        </div>
      </template>
      
      <AntTable :data-source="queueWorkload" style="width: 100%">

      </AntTable>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { getQueueStats, getQueueWorkload } from '@/api/settings'

export default {
  name: 'QueueMonitor',
  components: {
    Check,
    Close
  },
  setup() {
    const queueStats = ref({})
    const queueWorkload = ref([])
    let updateTimer = null

    // 获取队列统计信息
    const fetchQueueStats = async () => {
      try {
        const response = await getQueueStats()
        if (response.data) {
          queueStats.value = response.data
        }
      } catch (error) {
        console.error('获取队列统计信息失败:', error)
        ElMessage.error('获取队列统计信息失败')
      }
    }

    // 获取队列工作负载信息
    const fetchQueueWorkload = async () => {
      try {
        const response = await getQueueWorkload()
        if (response.data) {
          queueWorkload.value = response.data
        }
      } catch (error) {
        console.error('获取队列工作负载信息失败:', error)
        ElMessage.error('获取队列工作负载信息失败')
      }
    }

    // 获取队列显示名称
    const getQueueDisplayName = (queueName) => {
      const nameMap = {
        'default': '默认队列',
        'order_handle': '订单队列',
        'email': '邮件队列',
        'email_bulk': '邮件群发队列',
        'telegram': 'Telegram消息队列',
        'statistics': '统计队列',
        'traffic_fetch': '流量消费队列'
      }
      return nameMap[queueName] || queueName
    }

    // 更新所有数据
    const updateData = async () => {
      try {
        await Promise.all([
          fetchQueueStats(),
          fetchQueueWorkload()
        ])
      } catch (error) {
        console.error('更新数据失败:', error)
      }
    }

    // 启动定时器
    const startTimer = () => {
      updateTimer = setInterval(updateData, 1000) // 每秒更新一次
    }

    // 停止定时器
    const stopTimer = () => {
      if (updateTimer) {
        clearInterval(updateTimer)
        updateTimer = null
      }
    }

    onMounted(() => {
      updateData() // 立即加载一次数据
      startTimer() // 启动定时器
    })

    onUnmounted(() => {
      stopTimer() // 组件卸载时停止定时器
    })

    return {
      queueStats,
      queueWorkload,
      getQueueDisplayName
    }
  }
}
</script>

<style lang="scss" scoped>
.queue-monitor {
  padding: 20px;
  
  .overview-card {
    margin-bottom: 20px;
    
    .card-header {
      font-weight: 600;
      font-size: 16px;
    }
    
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      
      .metric-item {
        text-align: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        
        .metric-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 10px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #212529;
        }
        
        &.status-item {
          .status-value {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            
            .status-icon {
              font-size: 20px;
              
              &.running {
                color: #28a745;
              }
              
              &.paused {
                color: #dc3545;
              }
            }
          }
        }
      }
    }
  }
  
  .details-card {
    .card-header {
      font-weight: 600;
      font-size: 16px;
    }
    
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
      
      .queue-name {
        font-weight: 500;
        color: #303133;
      }
      
      .job-count {
        color: #409eff;
        font-weight: 500;
      }
      
      .task-count {
        color: #67c23a;
        font-weight: 500;
      }
      
      .wait-time {
        color: #e6a23c;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .queue-monitor {
    padding: 10px;
    
    .overview-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 15px !important;
      
      .metric-item {
        padding: 15px !important;
        
        .metric-value {
          font-size: 20px !important;
        }
      }
    }
  }
}
</style>
