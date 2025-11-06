<template>
  <div class="dashboard page-container">
                <!-- 顶部通知栏 -->
            <div
              v-if="pendingTickets > 0"
              class="notification-bar"
            >
              <div class="alert-content">
                <span class="alert-text">有{{ pendingTickets }}条工单等待处理 <span class="action-link" @click="goToTickets">立即处理</span></span>
              </div>
            </div>

                <!-- 功能卡片和今日收入区域 -->
            <el-card class="dashboard-main-card">
              <!-- 功能卡片区域 -->
              <div class="function-cards">
                <div class="function-card" @click="goToSettings">
                  <div class="card-icon">
                    <el-icon><Operation /></el-icon>
                  </div>
                  <div class="card-title">系统设置</div>
                </div>
                
                <div class="function-card" @click="goToOrders">
                  <div class="card-icon">
                    <el-icon><List /></el-icon>
                  </div>
                  <div class="card-title">订单管理</div>
                </div>
                
                <div class="function-card" @click="goToSubscriptions">
                  <div class="card-icon">
                    <el-icon><ShoppingBag /></el-icon>
                  </div>
                  <div class="card-title">订阅管理</div>
                </div>
                
                <div class="function-card" @click="goToUsers">
                  <div class="card-icon">
                    <el-icon><Avatar /></el-icon>
                  </div>
                  <div class="card-title">用户管理</div>
                </div>
              </div>
              
              <!-- 分隔线 -->
              <el-divider />
              
              <!-- 今日收入区域 -->
              <div class="income-section">
                <div class="income-header">
                  <div class="income-main">
                    <div class="income-title">今日收入</div>
                    <div class="income-main-value">
                      <span class="amount">{{ todayIncome }}</span>
                      <span class="currency">CNY</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 灰色分隔线 -->
              <el-divider />
              
              <!-- 统计数据行 -->
              <div class="income-stats-row">
                <div class="stat-item">
                  <div class="stat-value">{{ monthlyIncome }} CNY</div>
                  <div class="stat-label">本月收入</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ lastMonthIncome }} CNY</div>
                  <div class="stat-label">上月收入</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ lastMonthCommission }} CNY</div>
                  <div class="stat-label">上月佣金支出</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ newUsers }}</div>
                  <div class="stat-label">本月新增用户</div>
                </div>
              </div>
              
              <!-- 财务趋势图分隔线 -->
              <el-divider />
              
              <!-- 财务趋势图 -->
              <div ref="financeChart" class="chart-container" style="height: 300px;"></div>
            </el-card>

    <!-- 昨日节点流量排行区域 -->
    <div class="traffic-section">
      <el-card class="traffic-card">
        <template #header>
          <span>昨日节点流量排行</span>
        </template>
        
        <!-- 节点流量排行图 -->
        <div ref="trafficChart" class="chart-container" style="height: 400px;"></div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Setting, 
  List, 
  ShoppingBag, 
  User,
  Document,
  ShoppingCart,
  TrendCharts,
  Operation,
  Avatar
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getOverview, getOrderStats, getServerRank } from '@/api'

export default {
  name: 'Dashboard',
  components: {
    Setting,
    List,
    ShoppingBag,
    User,
    Document,
    ShoppingCart,
    TrendCharts,
    Operation,
    Avatar
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const pendingTickets = ref(0)
    const todayIncome = ref('0.00')
    const monthlyIncome = ref('0.00')
    const lastMonthIncome = ref('0.00')
    const lastMonthCommission = ref('0.00')
    const newUsers = ref(0)
    
    // 图表引用
    const financeChart = ref(null)
    const trafficChart = ref(null)
    let financeChartInstance = null
    let trafficChartInstance = null

    // 导航方法
    const goToSettings = () => router.push('/system-config')
    const goToOrders = () => router.push('/orders')
    const goToSubscriptions = () => router.push('/subscriptions')
    const goToUsers = () => router.push('/users')
    const goToTickets = () => router.push('/tickets')

    // 加载概览数据
    const loadOverviewData = async () => {
      try {
        const response = await getOverview()
        const data = response.data
        
        console.log('概览数据:', data) // 调试信息
        
        pendingTickets.value = data.ticket_pending_total || 0
        todayIncome.value = (data.day_income / 100).toFixed(2) || '0.00' // 修正字段名
        monthlyIncome.value = (data.month_income / 100).toFixed(2) || '0.00'
        lastMonthIncome.value = (data.last_month_income / 100).toFixed(2) || '0.00'
        lastMonthCommission.value = (data.commission_last_month_payout / 100).toFixed(2) || '0.00' // 修正字段名
        newUsers.value = data.month_register_total || 0
      } catch (error) {
        console.error('加载概览数据失败:', error)
      }
    }

    // 初始化财务趋势图
    const initFinanceChart = async () => {
      if (!financeChart.value) return
      
      financeChartInstance = echarts.init(financeChart.value)
      
      try {
        const response = await getOrderStats()
        const rawData = response.data || []
        
        console.log('财务统计数据:', rawData) // 调试信息
        
        // 处理数据：将扁平化数组转换为按日期分组的数据
        const dateMap = new Map()
        
        rawData.forEach(item => {
          const { type, date, value } = item
          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date,
              '收款金额': 0,
              '收款笔数': 0,
              '佣金金额(已发放)': 0,
              '佣金笔数(已发放)': 0
            })
          }
          dateMap.get(date)[type] = value
        })
        
        const processedData = Array.from(dateMap.values())
        const dates = processedData.map(item => item.date)
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['佣金笔数(已发放)', '佣金金额(已发放)', '收款笔数', '收款金额'],
            left: 'left',
            top: 'top'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '佣金笔数(已发放)',
              type: 'line',
              data: processedData.map(item => item['佣金笔数(已发放)']),
              itemStyle: { color: '#409EFF' },
              smooth: true,
              lineStyle: {
                width: 2,
                shadowColor: 'rgba(64, 158, 255, 0.3)',
                shadowBlur: 10
              }
            },
            {
              name: '佣金金额(已发放)',
              type: 'line',
              data: processedData.map(item => item['佣金金额(已发放)']),
              itemStyle: { color: '#67C23A' },
              smooth: true,
              lineStyle: {
                width: 2,
                shadowColor: 'rgba(103, 194, 58, 0.3)',
                shadowBlur: 10
              }
            },
            {
              name: '收款笔数',
              type: 'line',
              data: processedData.map(item => item['收款笔数']),
              itemStyle: { color: '#E6A23C' },
              smooth: true,
              lineStyle: {
                width: 2,
                shadowColor: 'rgba(230, 162, 60, 0.3)',
                shadowBlur: 10
              }
            },
            {
              name: '收款金额',
              type: 'line',
              data: processedData.map(item => item['收款金额']),
              itemStyle: { color: '#F56C6C' },
              smooth: true,
              lineStyle: {
                width: 2,
                shadowColor: 'rgba(245, 108, 108, 0.3)',
                shadowBlur: 10
              }
            }
          ]
        }
        
        financeChartInstance.setOption(option)
      } catch (error) {
        console.error('加载财务数据失败:', error)
        // 设置默认图表
        financeChartInstance.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['收款金额'] },
          xAxis: { type: 'category', data: [] },
          yAxis: { type: 'value' },
          series: [{ name: '收款金额', type: 'line', data: [] }]
        })
      }
    }

    // 初始化节点流量排行图
    const initTrafficChart = async () => {
      if (!trafficChart.value) return
      
      trafficChartInstance = echarts.init(trafficChart.value)
      
      try {
        const response = await getServerRank()
        const data = response.data || []
        
        console.log('服务器流量数据:', data) // 调试信息
        
        // 处理数据：将后端字段名映射到前端期望的字段名，并按流量排序
        const processedData = data
          .map(item => ({
            name: item.server_name || '未知服务器',
            traffic: parseFloat(item.total || 0)
          }))
          .sort((a, b) => b.traffic - a.traffic) // 按流量从多到少排序
          .slice(0, 20) // 只取前20个
        
        // 对于横向柱状图，需要反转数据顺序，让流量最多的显示在顶部
        const reversedData = [...processedData].reverse()
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
              return `${params[0].name}<br/>流量: ${params[0].value.toFixed(2)} GB`
            }
          },
          grid: {
            left: '3%',
            right: '8%', // 减少右边距，让柱状条往右伸长
            bottom: '3%',
            top: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            name: '流量 (GB)',
            nameLocation: 'end'
          },
          yAxis: {
            type: 'category',
            data: reversedData.map(item => item.name),
            axisLabel: {
              align: 'right', // 节点名字靠右对齐
              width: 200, // 增加宽度以显示完整名称
              overflow: 'none', // 不截断，完整显示
              formatter: function(value) {
                return value // 完整显示节点名称
              }
            },
            axisTick: {
              alignWithLabel: true
            }
          },
                            series: [
                    {
                      name: '流量',
                      type: 'bar',
                      data: reversedData.map(item => item.traffic),
                      itemStyle: { color: '#0665d0' },
                      barWidth: '60%'
                    }
                  ]
        }
        
        trafficChartInstance.setOption(option)
      } catch (error) {
        console.error('加载流量数据失败:', error)
        // 设置默认图表
        trafficChartInstance.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'value', name: '流量 (GB)' },
          yAxis: { type: 'category', data: [] },
          series: [{ name: '流量', type: 'bar', data: [] }]
        })
      }
    }

    // 窗口大小改变时重绘图表
    const handleResize = () => {
      financeChartInstance?.resize()
      trafficChartInstance?.resize()
    }

    onMounted(async () => {
      console.log('仪表盘组件挂载，开始加载数据...')
      
      try {
        await loadOverviewData()
        console.log('概览数据加载完成')
      } catch (error) {
        console.error('概览数据加载失败:', error)
      }
      
      try {
        await initFinanceChart()
        console.log('财务图表初始化完成')
      } catch (error) {
        console.error('财务图表初始化失败:', error)
      }
      
      try {
        await initTrafficChart()
        console.log('流量图表初始化完成')
      } catch (error) {
        console.error('流量图表初始化失败:', error)
      }
      
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      financeChartInstance?.dispose()
      trafficChartInstance?.dispose()
    })

    return {
      pendingTickets,
      todayIncome,
      monthlyIncome,
      lastMonthIncome,
      lastMonthCommission,
      newUsers,
      financeChart,
      trafficChart,
      goToSettings,
      goToOrders,
      goToSubscriptions,
      goToUsers,
      goToTickets
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  
  // 移动端响应式样式
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
  
  .notification-bar {
    margin-bottom: 20px;
    background-color: #f9dcd1;
    padding: 12px 16px;
    border-radius: 6px;
    
    .alert-content {
      .alert-text {
        color: #74290e;
        font-size: 16px;
      }
      
      .action-link {
        color: #74290e;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.3s ease;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
    
    // 移动端响应式样式
    @media (max-width: 768px) {
      margin: 0 -16px 16px -16px;
      padding: 10px 16px;
      border-radius: 0;
      
      .alert-content {
        .alert-text {
          font-size: 14px;
        }
      }
    }
    
    @media (max-width: 480px) {
      margin: 0 -12px 12px -12px;
      padding: 8px 12px;
      border-radius: 0;
      
      .alert-content {
        .alert-text {
          font-size: 13px;
        }
      }
    }
  }
  
  .dashboard-main-card {
    margin-bottom: 20px;
    
    :deep(.el-card) {
      border-radius: 0;
    }
    
    :deep(.el-card__body) {
      border-radius: 0;
    }
    
    :deep(.el-divider--horizontal) {
      margin: 20px -20px;
      width: calc(100% + 40px);
    }
    
    // 移动端卡片样式
    @media (max-width: 768px) {
      margin: 0 -16px 20px -16px;
      
      :deep(.el-card) {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
      
      :deep(.el-divider--horizontal) {
        margin: 16px -16px;
        width: calc(100% + 32px);
      }
    }
    
    @media (max-width: 480px) {
      margin: 0 -12px 16px -12px;
      
      :deep(.el-divider--horizontal) {
        margin: 12px -12px;
        width: calc(100% + 24px);
      }
    }
    
          .function-cards {
        display: flex;
        justify-content: stretch;
        align-items: stretch;
        gap: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        
        .function-card {
          flex: 1;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 10px;
          border-radius: 0;
          background: transparent;
          border: 2px solid #d1d5db80;
          border-right: none;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          
          &:last-child {
            border-right: 2px solid #d1d5db80;
          }
          
          &:hover {
            background: transparent;
            border-color: transparent;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            
            & + .function-card {
              border-left-color: transparent;
            }
          }
          
          &:hover + .function-card {
            border-left-color: transparent;
          }
          
          .card-icon {
            font-size: 50px;
            color: #0665d0;
            margin-bottom: 1px;
            display: block;
            line-height: 1;
          }
          
          .card-title {
            font-size: 16px;
            color: #666666;
            font-weight: 500;
            margin: 0;
            line-height: 1.4;
          }
        }
        
        // 移动端响应式样式
        @media (max-width: 768px) {
          flex-direction: row;
          gap: 8px;
          padding: 16px;
          
          .function-card {
            flex: 1;
            width: auto;
            height: auto;
            min-height: 70px;
            border: 1px solid #d1d5db80;
            border-radius: 6px;
            margin-bottom: 0;
            
            &:last-child {
              border-right: 1px solid #d1d5db80;
              margin-bottom: 0;
            }
            
            .card-icon {
              font-size: 28px;
              margin-bottom: 6px;
            }
            
            .card-title {
              font-size: 12px;
            }
          }
        }
        
        @media (max-width: 480px) {
          padding: 12px;
          gap: 6px;
          
          .function-card {
            min-height: 60px;
            
            .card-icon {
              font-size: 24px;
              margin-bottom: 4px;
            }
            
            .card-title {
              font-size: 11px;
            }
          }
        }
      }
    
    .income-section {
      padding: 5px 20px;
      
      .income-header {
        margin-bottom: 12px;
        
        .income-main {
          .income-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
            font-weight: 400;
            line-height: 1.2;
          }
          
          .income-main-value {
            display: flex;
            align-items: baseline;
            gap: 6px;
            
            .amount {
              font-size: 3.5rem;
              font-weight: 400;
              color: #303133;
              line-height: 1;
            }
            
            .currency {
              font-size: 14px;
              color: #909399;
              line-height: 1;
            }
          }
        }
        
        // 移动端响应式样式
        @media (max-width: 768px) {
          padding: 16px;
          max-width: 80%;
          margin: 0;
          
          .income-header {
            margin-bottom: 16px;
            
            .income-main {
              .income-title {
                font-size: 13px;
                margin-bottom: 6px;
              }
              
              .income-main-value {
                .amount {
                  font-size: 2rem;
                }
                
                .currency {
                  font-size: 13px;
                }
              }
            }
          }
        }
        
        @media (max-width: 480px) {
          padding: 12px;
          max-width: 90%;
          margin: 0;
          
          .income-header {
            margin-bottom: 12px;
            
            .income-main {
              .income-title {
                font-size: 12px;
                margin-bottom: 4px;
              }
              
              .income-main-value {
                .amount {
                  font-size: 1.5rem;
                }
                
                .currency {
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
    }
    
    .income-stats-row {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      margin: 20px 20px 20px 20px;
      padding: 2px 0;
      min-height: auto;
      gap: 40px;
      
      .stat-item {
        flex: 0 0 auto;
        text-align: left;
        padding: 10px 0;
        
        .stat-value {
          font-size: 1rem;
          font-weight: 400;
          color: #303133;
          margin-bottom: 8px;
          line-height: 1.2;
          display: block;
        }
        
        .stat-label {
          font-size: 1rem;
          color: #909399;
          line-height: 1.2;
          display: block;
        }
      }
      
      // 移动端响应式样式
      @media (max-width: 768px) {
        flex-direction: row;
        gap: 12px;
        margin: 16px;
        justify-content: flex-start;
        
        .stat-item {
          width: auto;
          text-align: left;
          padding: 8px 0;
          
          .stat-value {
            font-size: 0.9rem;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 0.75rem;
          }
        }
      }
      
      @media (max-width: 480px) {
        gap: 8px;
        margin: 12px;
        
        .stat-item {
          padding: 6px 0;
          
          .stat-value {
            font-size: 0.8rem;
          }
          
          .stat-label {
            font-size: 0.7rem;
          }
        }
      }
    }

  }
  
  .traffic-section {
    margin-bottom: 20px;
    
    .traffic-card {
      :deep(.el-card) {
        border-radius: 0;
      }
      
      .el-card__body {
        padding: 20px;
        border-radius: 0;
      }
    }
    
    // 移动端响应式样式
    @media (max-width: 768px) {
      margin: 0 -16px 20px -16px;
      
      .traffic-card {
        :deep(.el-card) {
          border-radius: 0;
          border-left: none;
          border-right: none;
        }
        
        .el-card__body {
          padding: 16px;
        }
      }
    }
    
    @media (max-width: 480px) {
      margin: 0 -12px 16px -12px;
      
      .traffic-card {
        .el-card__body {
          padding: 12px;
        }
      }
    }
  }
  
  // 图表容器移动端响应式样式
  .chart-container {
    @media (max-width: 768px) {
      height: 250px !important;
    }
    
    @media (max-width: 480px) {
      height: 200px !important;
    }
  }
}
</style>
