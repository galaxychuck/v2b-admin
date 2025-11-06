<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据统计</span>
          </template>
          <div ref="statisticsChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户增长趋势</span>
          </template>
          <div ref="userGrowthChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>收入统计</span>
          </template>
          <div ref="revenueChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'Statistics',
  setup() {
    const statisticsChart = ref(null)
    const userGrowthChart = ref(null)
    const revenueChart = ref(null)
    
    const initCharts = () => {
      // 总体统计图表
      const statisticsChartInstance = echarts.init(statisticsChart.value)
      statisticsChartInstance.setOption({
        title: {
          text: '系统概览'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['用户数', '订单数', '收入']
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            position: 'left'
          },
          {
            type: 'value',
            name: '收入',
            position: 'right'
          }
        ],
        series: [
          {
            name: '用户数',
            type: 'line',
            data: [120, 200, 150, 80, 70, 110, 130, 180, 220, 280, 320, 400]
          },
          {
            name: '订单数',
            type: 'line',
            data: [80, 150, 120, 60, 50, 90, 100, 140, 180, 220, 260, 320]
          },
          {
            name: '收入',
            type: 'line',
            yAxisIndex: 1,
            data: [2000, 4000, 3000, 1500, 1200, 2200, 2500, 3500, 4500, 5500, 6500, 8000]
          }
        ]
      })
      
      // 用户增长趋势图
      const userGrowthChartInstance = echarts.init(userGrowthChart.value)
      userGrowthChartInstance.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [120, 200, 150, 80, 70, 110],
          type: 'bar',
          itemStyle: {
            color: '#409EFF'
          }
        }]
      })
      
      // 收入统计图
      const revenueChartInstance = echarts.init(revenueChart.value)
      revenueChartInstance.setOption({
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: '基础套餐' },
            { value: 735, name: '高级套餐' },
            { value: 580, name: '企业套餐' },
            { value: 484, name: '其他' }
          ]
        }]
      })
    }
    
    onMounted(() => {
      initCharts()
    })
    
    return {
      statisticsChart,
      userGrowthChart,
      revenueChart
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics {
  // 样式可以根据需要添加
}
</style>
