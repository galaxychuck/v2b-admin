<template>
  <div class="ticket-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工单管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="工单号">
          <el-input v-model="queryForm.ticket_no" placeholder="请输入工单号" clearable />
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入用户邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="已开启" value="0" />
            <el-option label="已关闭" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复状态">
          <el-select v-model="queryForm.reply_status" placeholder="请选择回复状态" clearable>
            <el-option label="待回复" value="0" />
            <el-option label="已回复" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 工单列表表格 -->
      <el-table :data="ticketList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="subject" label="主题" min-width="200">
          <template #default="{ row }">
            <span class="ticket-subject">{{ row.subject }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.level)">
              {{ getPriorityText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reply_status" label="回复状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getReplyStatusType(row.reply_status)">
              {{ getReplyStatusText(row.reply_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">查看详情</el-button>
            <el-button 
              size="small" 
              type="danger" 
              v-if="row.status === 0"
              @click="handleClose(row)"
            >
              关闭工单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 工单详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :width="isMobile ? '95%' : '80%'" 
      :before-close="handleCloseDetail"
      class="ticket-detail-dialog"
    >
      <template #header>
        <div class="ticket-dialog-header">
          <span class="ticket-id">工单ID: {{ selectedTicket?.id || '--' }}</span>
          <span class="ticket-subject" :class="`status-${selectedTicket?.status || 0}`">
            {{ selectedTicket?.subject || '未知主题' }}
          </span>
        </div>
      </template>
      <div v-if="selectedTicket" class="ticket-detail">
        <!-- 用户信息 -->
        <div class="user-info" v-if="userInfo">
          <div class="user-info-header" @click="toggleUserInfo">
            <span class="user-info-title">用户信息</span>
            <span class="collapse-icon" :class="{ 'is-expanded': userInfoExpanded }">
              ▼
            </span>
          </div>
          <transition name="el-fade-in-linear">
            <div v-show="userInfoExpanded" class="user-info-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户邮箱">
                  <span class="user-email">{{ userInfo.email || '未知' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="套餐名称">
                  <el-tag type="info">{{ getPlanName(userInfo) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="备注信息">
                  <span class="user-remarks">{{ userInfo.remarks || '无备注' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="过期时间">
                  <el-tag :type="getExpireTimeType(userInfo.expired_at)">
                    {{ formatExpireTime(userInfo.expired_at) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="已用流量">
                  <span class="traffic-used">{{ formatTraffic(userInfo.u + userInfo.d) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="总流量">
                  <span class="traffic-total">{{ formatTraffic(userInfo.transfer_enable) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="用户余额">
                  <span class="user-balance">{{ formatBalance(userInfo.balance) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="操作">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="showTrafficInfo"
                    :disabled="!userInfo.id"
                  >
                    查看流量记录
                  </el-button>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </transition>
        </div>
        


        <!-- 消息列表 -->
        <div class="messages-section">
          <h3>对话记录</h3>
          <div class="messages-list">
            <div 
              v-for="message in ticketMessages" 
              :key="message.id"
              class="message-item"
              :class="{ 'admin-message': message.is_me, 'user-message': !message.is_me }"
            >
              <div class="message-avatar">
                <el-avatar :size="40" :icon="message.is_me ? 'User' : 'UserFilled'" />
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">
                    {{ message.is_me ? '管理员' : '用户' }}
                  </span>
                  <span class="message-time">{{ formatTime(message.created_at) }}</span>
                </div>
                <div class="message-text">{{ message.message }}</div>
                <!-- 图片显示 -->
                <div v-if="message.images && message.images.length > 0" class="message-images">
                  <div class="image-grid">
                    <div 
                      v-for="(image, imgIndex) in message.images" 
                      :key="imgIndex"
                      class="message-image-item"
                      @click="previewImage(image)"
                    >
                      <img :src="getImageUrl(image)" :alt="`图片 ${imgIndex + 1}`">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 回复输入框 -->
        <div v-if="selectedTicket.status === 0" class="reply-section">
          <el-form :model="replyForm" ref="replyFormRef" class="reply-form-inline">
            <div class="reply-input-row">
              <el-input
                v-model="replyForm.message"
                type="textarea"
                :rows="3"
                placeholder="请输入回复内容..."
                class="reply-textarea"
              />
              
              <div class="reply-actions">
                <!-- 图片上传 -->
                <div class="upload-section" v-if="selectedTicket && selectedTicket.id">
                  <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :file-list="replyForm.images"
                    :on-change="handleFileChange"
                    :on-remove="handleRemoveImage"
                    :before-upload="beforeUpload"
                    multiple
                    list-type="picture-card"
                    accept="image/*"
                    :preview-src="getImageDisplayUrl"
                    class="inline-upload"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                  
                  <!-- 手动上传按钮 -->
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="uploadImages"
                    :disabled="replyForm.images.length === 0"
                    class="upload-btn"
                  >
                    上传图片
                  </el-button>
                </div>
                
                <!-- 发送回复按钮 -->
                <el-button type="primary" @click="handleReply" :loading="replying" class="send-btn">
                  发送回复
                </el-button>
              </div>
            </div>
            
            <!-- 提示信息 -->
            <div v-if="replyForm.images.length > 0" class="upload-tip">
              <el-alert
                title="提示"
                description="请先点击'上传图片'按钮上传图片，然后再发送回复"
                type="info"
                show-icon
                :closable="false"
                size="small"
              />
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" :width="isMobile ? '95%' : '60%'">
      <div class="image-preview">
        <img :src="previewImageUrl" :alt="previewImageName" style="width: 100%; height: auto;">
      </div>
    </el-dialog>

    <!-- 流量信息对话框 -->
    <el-dialog v-model="trafficInfoVisible" title="流量记录" :width="isMobile ? '95%' : '80%'" :before-close="handleCloseTrafficInfo">
      <div v-if="trafficInfo" class="traffic-info">
        <el-table :data="trafficInfo.data" style="width: 100%" v-loading="trafficLoading">
          <el-table-column prop="updated_at" label="时间" width="180">
            <template #default="{ row }">
              {{ formatTrafficDate(row.updated_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="u" label="上行" width="150">
            <template #default="{ row }">
              <span class="upload-traffic">{{ formatTraffic(row.u) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="d" label="下行" width="150">
            <template #default="{ row }">
              <span class="download-traffic">{{ formatTraffic(row.d) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="server_rate" label="倍率" width="100">
            <template #default="{ row }">
              <el-tag type="info">{{ row.server_rate || '1.00' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="traffic-pagination">
          <el-pagination
            v-model:current-page="trafficPagination.current"
            v-model:page-size="trafficPagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="trafficInfo.total || 0"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleTrafficSizeChange"
            @current-change="handleTrafficCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getTicketList, getTicketDetail, replyTicket, closeTicket } from '@/api/ticket'
import { getUserDetail } from '@/api/user'
import { getUserStats } from '@/api/statistics'
import { getPlanList } from '@/api/plan'
import { config } from '@/config'
import { getSecurePath, initConfig } from '@/utils/configManager'

export default {
  name: 'TicketList',
  components: {
    Plus
  },
  setup() {
    const loading = ref(false)
    const detailDialogVisible = ref(false)
    const imagePreviewVisible = ref(false)
    const trafficInfoVisible = ref(false)
    const replying = ref(false)
    
    const selectedTicket = ref(null)
    const ticketMessages = ref([])
    const userInfo = ref(null)
    const userInfoExpanded = ref(false)
    const previewImageUrl = ref('')
    const previewImageName = ref('')
    const trafficInfo = ref(null)
    const trafficLoading = ref(false)
    const planList = ref([])
    const isMobile = ref(false)
    
    // 获取API基础URL
    const apiBaseUrl = config.API_CONFIG.staticBaseUrl[0]
    
    const queryForm = reactive({
      ticket_no: '',
      email: '',
      status: '',
      reply_status: ''
    })
    
    const ticketList = ref([])
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })
    
    const trafficPagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })
    
    const replyForm = reactive({
      message: '',
      images: [] // 新增图片列表
    })
    
    const replyFormRef = ref(null)
    const uploadRef = ref(null) // 新增上传组件的ref

    // 获取工单列表
    const fetchTicketList = async () => {
      loading.value = true
      try {
        const params = {
          current: pagination.current,
          pageSize: pagination.size,
          ...queryForm
        }
        
        const response = await getTicketList(params)
        if (response.data) {
          ticketList.value = response.data
          pagination.total = response.total || 0
        }
      } catch (error) {
        console.error('获取工单列表失败:', error)
        ElMessage.error('获取工单列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取工单详情
    const fetchTicketDetail = async (ticketId) => {
      try {
        const response = await getTicketDetail(ticketId)
        if (response.data) {
          selectedTicket.value = response.data
          ticketMessages.value = response.data.message || []
          
          // 获取用户信息
          if (response.data.user_id) {
            try {
              const userResponse = await getUserDetail(response.data.user_id)
              if (userResponse.data) {
                userInfo.value = userResponse.data
                // 获取套餐列表
                await fetchPlanList()
              }
            } catch (userError) {
              console.warn('获取用户信息失败:', userError)
              userInfo.value = null
            }
          }
        }
      } catch (error) {
        console.error('获取工单详情失败:', error)
        ElMessage.error('获取工单详情失败')
      }
    }

    // 搜索处理
    const handleSearch = () => {
      pagination.current = 1
      fetchTicketList()
    }

    // 重置搜索
    const handleReset = () => {
      Object.assign(queryForm, {
        ticket_no: '',
        email: '',
        status: '',
        reply_status: ''
      })
      pagination.current = 1
      fetchTicketList()
    }

    // 查看详情
    const handleDetail = async (row) => {
      selectedTicket.value = row
      await fetchTicketDetail(row.id)
      detailDialogVisible.value = true
    }

    // 关闭工单
    const handleClose = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要关闭工单 "${row.subject}" 吗？`,
          '确认关闭',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await closeTicket(row.id)
        if (response.data) {
          ElMessage.success('工单关闭成功')
          fetchTicketList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('关闭工单失败:', error)
          ElMessage.error('关闭工单失败')
        }
      }
    }

    // 回复工单
    const handleReply = async () => {
      if (!replyFormRef.value) return
      
      // 检查是否有成功上传的图片
      const successImages = replyForm.images.filter(img => img.status === 'success')
      console.log('准备回复工单，检查图片状态:', {
        totalImages: replyForm.images.length,
        successImages: successImages.length,
        allImages: replyForm.images.map(img => ({ name: img.name, status: img.status, path: img.path }))
      })
      
      // 自定义验证：必须有文字或图片
      if (!replyForm.message && successImages.length === 0) {
        if (replyForm.images.length > 0) {
          ElMessage.warning('请先上传图片，或输入回复内容')
        } else {
          ElMessage.warning('请输入回复内容或上传图片')
        }
        return
      }
      
      replying.value = true
      try {
        // 处理图片数据，发送正确的路径格式
        const processedImages = successImages
          .map(img => {
            console.log('处理图片数据:', img)
            
            // 优先使用path字段（图片路径）
            if (img.path) {
              console.log('使用图片路径:', img.path)
              return img.path
            }
            
            // 如果没有path字段，尝试从url中提取
            if (img.url && img.url.includes('/ticket/image/')) {
              const urlParts = img.url.split('/ticket/image/')
              if (urlParts.length > 1) {
                try {
                  const decodedPath = atob(urlParts[1])
                  console.log('从URL提取的图片路径:', decodedPath)
                  return decodedPath
                } catch (error) {
                  console.warn('无法解码图片路径:', error)
                  return img.url
                }
              }
            }
            
            // 如果都不行，记录警告并跳过
            console.warn('无法获取图片路径，跳过:', img)
            return null
          })
          .filter(path => path !== null) // 过滤掉null值

        console.log('处理后的图片数据:', processedImages)
        console.log('发送工单回复数据:', {
          id: selectedTicket.value.id,
          message: replyForm.message || '',
          images: processedImages
        })

        const response = await replyTicket({
          id: selectedTicket.value.id,
          message: replyForm.message || '', // 如果没有文字，发送空字符串
          images: processedImages // 发送处理后的图片路径
        })
        
        if (response.data) {
          ElMessage.success('回复发送成功')
          replyForm.message = ''
          replyForm.images = [] // 清空图片列表
          await fetchTicketDetail(selectedTicket.value.id)
        }
      } catch (error) {
        console.error('发送回复失败:', error)
        ElMessage.error('发送回复失败')
      } finally {
        replying.value = false
      }
    }

    // 预览图片
    const previewImage = (image) => {
      // 使用原图进行预览，而不是缩略图
      previewImageUrl.value = getOriginalImageUrl(image)
      previewImageName.value = `图片预览`
      imagePreviewVisible.value = true
    }

    // 获取图片URL（缩略图，用于列表显示）
    const getImageUrl = (image) => {
      // 管理员端图片需要通过特定的API路径访问
      if (!image) return ''
      
      // 如果是字符串（旧格式），构建管理员端API路径
      if (typeof image === 'string') {
        return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image)}`
      }
      
      // 如果是对象（新格式）
      if (typeof image === 'object') {
        // 优先使用thumbnail_url字段
        if (image.thumbnail_url) {
          return image.thumbnail_url
        }
        
        // 其次使用thumbnail_path字段，构建管理员端API路径
        if (image.thumbnail_path) {
          return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image.thumbnail_path)}`
        }
        
        // 再次使用url字段
        if (image.url) {
          return image.url
        }
        
        // 然后使用original_path字段，构建管理员端API路径
        if (image.original_path) {
          return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image.original_path)}`
        }
        
        // 最后使用path字段，构建管理员端API路径
        if (image.path) {
          return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image.path)}`
        }
      }
      
      // 如果都不匹配，返回空字符串
      return ''
    }

    // 获取原图URL（用于预览）
    const getOriginalImageUrl = (image) => {
      // 管理员端原图需要通过特定的API路径访问
      if (!image) return ''
      
      // 如果是字符串（旧格式），构建管理员端API路径
      if (typeof image === 'string') {
        return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image)}`
      }
      
      // 如果是对象（新格式）
      if (typeof image === 'object') {
        // 优先使用original_url字段
        if (image.original_url) {
          return image.original_url
        }
        
        // 其次使用original_path字段，构建管理员端API路径
        if (image.original_path) {
          return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image.original_path)}`
        }
        
        // 再次使用url字段
        if (image.url) {
          return image.url
        }
        
        // 最后使用path字段，构建管理员端API路径
        if (image.path) {
          return `${apiBaseUrl}/${getSecurePath()}/ticket/image/${btoa(image.path)}`
        }
      }
      
      // 如果都不匹配，返回空字符串
      return ''
    }

    // 关闭详情对话框
    const handleCloseDetail = () => {
      detailDialogVisible.value = false
      selectedTicket.value = null
      ticketMessages.value = []
      replyForm.message = ''
      replyForm.images = [] // 清空图片列表
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pagination.size = val
      pagination.current = 1
      fetchTicketList()
    }

    const handleCurrentChange = (val) => {
      pagination.current = val
      fetchTicketList()
    }

    // 状态相关函数
    const getStatusType = (status) => {
      const statusMap = {
        0: 'success',
        1: 'info'
      }
      return statusMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const statusMap = {
        0: '已开启',
        1: '已关闭'
      }
      return statusMap[status] || '未知'
    }

    const getReplyStatusType = (replyStatus) => {
      const statusMap = {
        0: 'warning',
        1: 'success'
      }
      return statusMap[replyStatus] || 'info'
    }

    const getReplyStatusText = (replyStatus) => {
      const statusMap = {
        0: '待回复',
        1: '已回复'
      }
      return statusMap[replyStatus] || '未知'
    }

    const getPriorityType = (priority) => {
      const priorityMap = {
        0: 'info',
        1: 'warning',
        2: 'danger'
      }
      return priorityMap[priority] || 'info'
    }

    const getPriorityText = (priority) => {
      const priorityMap = {
        0: '低',
        1: '中',
        2: '高'
      }
      return priorityMap[priority] || '未知'
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '--'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString()
    }

    // 格式化过期时间
    const formatExpireTime = (timestamp) => {
      if (!timestamp) return '永久'
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return '已过期'
      } else if (diffDays === 0) {
        return '今天过期'
      } else if (diffDays <= 7) {
        return `${diffDays}天后过期`
      } else {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    }

    // 获取过期时间标签类型
    const getExpireTimeType = (timestamp) => {
      if (!timestamp) return 'success'
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'danger'
      } else if (diffDays <= 7) {
        return 'warning'
      } else {
        return 'success'
      }
    }

    // 格式化流量
    const formatTraffic = (bytes) => {
      if (!bytes || bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 格式化余额
    const formatBalance = (balance) => {
      if (balance === undefined || balance === null) return '0.00 元'
      return (balance / 100).toFixed(2) + ' 元'
    }

    // 获取套餐列表
    const fetchPlanList = async () => {
      try {
        const response = await getPlanList()
        if (response.data) {
          planList.value = response.data
        }
      } catch (error) {
        console.error('获取套餐列表失败:', error)
      }
    }

    // 获取套餐名称
    const getPlanName = (userInfo) => {
      if (!userInfo) return '无套餐'
      
      // 优先使用plan_name字段
      if (userInfo.plan_name && userInfo.plan_name.trim() !== '') {
        return userInfo.plan_name
      }
      
      // 如果有plan_id，从套餐列表中查找对应的套餐名称
      if (userInfo.plan_id && planList.value.length > 0) {
        const plan = planList.value.find(p => p.id === userInfo.plan_id)
        if (plan && plan.name) {
          return plan.name
        }
      }
      
      // 如果有plan_id但没有找到套餐名称，显示套餐ID
      if (userInfo.plan_id) {
        return `套餐ID: ${userInfo.plan_id}`
      }
      
      // 如果有group信息
      if (userInfo.group && userInfo.group.name) {
        return userInfo.group.name
      }
      
      return '无套餐'
    }

    // 显示流量信息
    const showTrafficInfo = async () => {
      if (!userInfo.value?.id) {
        ElMessage.warning('用户信息不存在')
        return
      }
      
      trafficInfoVisible.value = true
      await fetchTrafficInfo()
    }

    // 获取流量信息
    const fetchTrafficInfo = async () => {
      if (!userInfo.value?.id) return
      
      trafficLoading.value = true
      try {
        // 使用专门的统计API函数，它会自动处理认证
        const response = await getUserStats({
          user_id: userInfo.value.id,
          current: trafficPagination.current,
          pageSize: trafficPagination.size
        })
        
        if (response.data) {
          trafficInfo.value = response
          trafficPagination.total = response.total || 0
        }
      } catch (error) {
        console.error('获取流量信息失败:', error)
        ElMessage.error(`获取流量信息失败: ${error.message || '未知错误'}`)
      } finally {
        trafficLoading.value = false
      }
    }

    // 格式化流量日期
    const formatTrafficDate = (timestamp) => {
      if (!timestamp) return '--'
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 流量分页处理
    const handleTrafficSizeChange = (val) => {
      trafficPagination.size = val
      trafficPagination.current = 1
      fetchTrafficInfo()
    }

    const handleTrafficCurrentChange = (val) => {
      trafficPagination.current = val
      fetchTrafficInfo()
    }

    // 关闭流量信息对话框
    const handleCloseTrafficInfo = () => {
      trafficInfoVisible.value = false
      trafficInfo.value = null
      trafficPagination.current = 1
      trafficPagination.total = 0
    }
    
    // 切换用户信息展开/收起
    const toggleUserInfo = () => {
      console.log('toggleUserInfo 被调用，当前状态:', userInfoExpanded.value)
      userInfoExpanded.value = !userInfoExpanded.value
      console.log('切换后状态:', userInfoExpanded.value)
    }

    // 上传相关函数
    const uploadAction = `${apiBaseUrl}/${getSecurePath()}/ticket/image/upload` // 使用管理员端图片上传API，动态获取secure_path
    const uploadHeaders = {
      'Authorization': localStorage.getItem('admin_auth_data') || '' // 使用admin_auth_data进行认证
    }

    // 动态获取上传数据，确保ticket_id存在
    const getUploadData = () => {
      const ticketId = selectedTicket.value?.id
      console.log('上传图片时的ticket_id:', ticketId)
      
      if (!ticketId) {
        console.warn('工单ID不存在，无法上传图片')
        return { ticket_id: 0 } // 返回默认值，避免上传失败
      }
      
      const uploadData = { ticket_id: ticketId }
      console.log('上传数据:', uploadData)
      return uploadData
    }

    const beforeUpload = (rawFile) => {
      // 检查工单ID是否存在
      if (!selectedTicket.value?.id) {
        ElMessage.error('请先选择工单，无法上传图片')
        return false
      }
      
      const isImage = rawFile.type.startsWith('image/')
      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      
      const isLt5M = rawFile.size / 1024 / 1024 < 5
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!')
        return false
      }
      
      return true
    }

    // 获取图片显示URL（优先使用缩略图）
    const getImageDisplayUrl = (file) => {
      console.log('获取图片显示URL:', { file })
      
      // 优先使用缩略图URL
      if (file.thumbnail_url) {
        console.log('使用缩略图URL:', file.thumbnail_url)
        return file.thumbnail_url
      }
      
      // 如果没有缩略图，使用原图URL
      if (file.url) {
        console.log('使用原图URL:', file.url)
        return file.url
      }
      
      // 如果都没有，尝试构建URL
      if (file.thumbnail_path) {
        const apiBaseUrl = config.API_CONFIG.staticBaseUrl[0]
        const securePath = getSecurePath()
        const thumbnailUrl = `${apiBaseUrl}/${securePath}/ticket/image/${btoa(file.thumbnail_path)}`
        console.log('构建缩略图URL:', thumbnailUrl)
        return thumbnailUrl
      }
      
      if (file.path) {
        const apiBaseUrl = config.API_CONFIG.staticBaseUrl[0]
        const securePath = getSecurePath()
        const originalUrl = `${apiBaseUrl}/${securePath}/ticket/image/${btoa(file.path)}`
        console.log('构建原图URL:', originalUrl)
        return originalUrl
      }
      
      // 如果都没有，返回空字符串
      console.log('没有可用的图片URL')
      return ''
    }
    
    // 处理文件选择
    const handleFileChange = (file, fileList) => {
      console.log('文件选择变化:', { file, fileList })
      
      // 确保每个文件都有uid和status
      const processedFileList = fileList.map(f => ({
        ...f,
        uid: f.uid || `file_${Date.now()}_${Math.random()}`,
        status: 'pending'  // 新选择的文件状态应该是pending
      }))
      
      replyForm.images = processedFileList
      console.log('处理后的文件列表:', replyForm.images)
    }

    // 手动上传图片
    const uploadImages = async () => {
      if (!selectedTicket.value?.id) {
        ElMessage.error('请先选择工单')
        return
      }

      if (replyForm.images.length === 0) {
        ElMessage.warning('请先选择图片')
        return
      }

      const ticketId = selectedTicket.value.id
      console.log('开始上传图片，工单ID:', ticketId)
      console.log('上传接口地址:', uploadAction)
      console.log('认证头:', uploadHeaders)
      console.log('API基础URL:', apiBaseUrl)
      console.log('Secure Path:', getSecurePath())
      console.log('Admin Auth Data:', localStorage.getItem('admin_auth_data'))
      console.log('准备上传的文件列表:', replyForm.images.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uid: f.uid,
        status: f.status
      })))

      for (const file of replyForm.images) {
        if (file.status === 'success') {
          console.log('跳过已上传的文件:', file.name)
          continue // 跳过已上传的文件
        }

        try {
          const formData = new FormData()
          formData.append('image', file.raw)
          formData.append('ticket_id', ticketId)

          console.log('准备上传文件:', {
            name: file.name,
            size: file.size,
            type: file.type,
            ticketId: ticketId,
            formData: formData
          })

          const response = await fetch(`${uploadAction}`, {
            method: 'POST',
            headers: uploadHeaders,
            body: formData
          })

          console.log('上传响应状态:', response.status, response.statusText)

          if (response.ok) {
            const result = await response.json()
            console.log('图片上传响应数据:', result)
            
            if (result.data) {
              // 更新文件状态
              file.status = 'success'
              
              // 存储图片的完整信息
              file.uploadResult = result.data
              file.path = result.data.original_path  // 图片路径，用于工单回复
              file.thumbnail_path = result.data.thumbnail_path  // 缩略图路径
              
              // 构建完整的URL（管理员端API）
              const apiBaseUrl = config.API_CONFIG.staticBaseUrl[0]
              const securePath = getSecurePath()
              file.url = `${apiBaseUrl}/${securePath}/ticket/image/${btoa(result.data.original_path)}`
              file.thumbnail_url = `${apiBaseUrl}/${securePath}/ticket/image/${btoa(result.data.thumbnail_path)}`
              
              console.log('图片上传成功，文件信息更新:', {
                filename: file.name,
                path: file.path,
                url: file.url,
                thumbnail_path: file.thumbnail_path,
                thumbnail_url: file.thumbnail_url,
                fullData: result.data,
                fileObject: file
              })
              
              // 确保文件被添加到replyForm.images数组中
              const existingIndex = replyForm.images.findIndex(img => img.uid === file.uid)
              if (existingIndex >= 0) {
                // 更新现有文件
                replyForm.images[existingIndex] = { ...file }
              } else {
                // 添加新文件
                replyForm.images.push({ ...file })
              }
              
              console.log('更新后的replyForm.images:', replyForm.images)
              
              ElMessage.success(`图片 ${file.name} 上传成功`)
            } else {
              throw new Error(result.message || '上传失败')
            }
          } else {
            const errorData = await response.json()
            console.error('上传失败，错误响应:', errorData)
            throw new Error(errorData.message || `HTTP ${response.status}`)
          }
        } catch (error) {
          console.error('上传失败:', error)
          file.status = 'error'
          ElMessage.error(`图片 ${file.name} 上传失败: ${error.message}`)
        }
      }
      
      // 上传完成后，显示所有文件的状态
      console.log('所有文件上传完成，当前状态:', replyForm.images.map(f => ({
        name: f.name,
        status: f.status,
        path: f.path,
        url: f.url
      })))
    }

    const handleUploadSuccess = (response, file, fileList) => {
      if (response.data) {
        ElMessage.success('图片上传成功')
        // 更新文件列表，添加服务器返回的URL
        const updatedFileList = fileList.map(f => {
          if (f.uid === file.uid) {
            return {
              ...f,
              uploadResult: response.data,
              path: response.data.path,  // 图片路径，用于工单回复
              url: response.data.url,    // 完整URL，用于显示
              status: 'success'
            }
          }
          return f
        })
        replyForm.images = updatedFileList
      } else {
        ElMessage.error('图片上传失败: ' + (response.message || '未知错误'))
        // 移除失败的文件
        replyForm.images = fileList.filter(f => f.uid !== file.uid)
      }
    }

    const handleUploadError = (err, file, fileList) => {
      console.error('上传失败:', err)
      ElMessage.error('图片上传失败')
      // 移除失败的文件
      replyForm.images = fileList.filter(f => f.uid !== file.uid)
    }

    const handleRemoveImage = (file, fileList) => {
      replyForm.images = fileList
    }

    // 初始化配置
    const initAppConfig = async () => {
      try {
        // 初始化配置管理器，获取secure_path等配置
        await initConfig()
      } catch (error) {
        console.warn('初始化配置失败，将使用默认值:', error)
      }
    }

    onMounted(async () => {
      await initAppConfig()
      fetchTicketList()
      
      // 检测移动端
      const checkMobile = () => {
        isMobile.value = window.innerWidth <= 768
      }
      
      // 初始检测
      checkMobile()
      
      // 监听窗口大小变化
      window.addEventListener('resize', checkMobile)
      
      // 调试：检查关键配置值
      console.log('组件挂载完成，检查配置:')
      console.log('- API基础URL:', apiBaseUrl)
      console.log('- Secure Path:', getSecurePath())
      console.log('- 上传接口地址:', uploadAction)
      console.log('- 认证头:', uploadHeaders)
      console.log('- Admin Auth Data:', localStorage.getItem('admin_auth_data'))
    })

    return {
      loading,
      detailDialogVisible,
      imagePreviewVisible,
      trafficInfoVisible,
      replying,
      selectedTicket,
      ticketMessages,
      userInfo,
      previewImageUrl,
      previewImageName,
      trafficInfo,
      trafficLoading,
      queryForm,
      ticketList,
      pagination,
      trafficPagination,
      replyForm,
      replyFormRef,
      uploadRef, // 暴露上传组件的ref
      handleSearch,
      handleReset,
      handleDetail,
      handleClose,
      handleReply,
      previewImage,
      getImageUrl,
      getOriginalImageUrl, // 暴露原图URL获取函数
      handleCloseDetail,
      handleSizeChange,
      handleCurrentChange,
      toggleUserInfo,
      userInfoExpanded,
      fetchPlanList,
      getStatusType,
      getStatusText,
      getReplyStatusType,
      getReplyStatusText,
      getPriorityType,
      getPriorityText,
      formatTime,
      formatExpireTime,
      getExpireTimeType,
      formatTraffic,
      formatBalance,
      getPlanName,
      showTrafficInfo,
      handleTrafficSizeChange,
      handleTrafficCurrentChange,
      handleCloseTrafficInfo,
      formatTrafficDate,
      uploadAction, // 暴露上传接口
      uploadHeaders, // 暴露上传头
      getUploadData, // 暴露获取上传数据的函数
      beforeUpload, // 暴露上传前校验
      handleFileChange, // 暴露文件选择处理函数
      uploadImages, // 暴露手动上传函数
      handleUploadSuccess, // 暴露上传成功回调
      handleUploadError, // 暴露上传失败回调
      handleRemoveImage, // 暴露移除图片回调
      getImageDisplayUrl, // 暴露图片显示URL获取函数
      isMobile
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-list {
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    margin-bottom: 20px;
    
    @media (max-width: 768px) {
      :deep(.el-form--inline) {
        .el-form-item {
          margin-bottom: 12px;
          margin-right: 0;
          width: 100%;
          
          .el-form-item__content {
            width: 100%;
            
            .el-input,
            .el-select {
              width: 100%;
            }
          }
        }
        
        .el-form-item:last-child {
          margin-bottom: 0;
          
          .el-form-item__content {
            display: flex;
            gap: 8px;
            
            .el-button {
              flex: 1;
            }
          }
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    text-align: right;
    
    @media (max-width: 768px) {
      text-align: center;
      
      :deep(.el-pagination) {
        .el-pagination__sizes,
        .el-pagination__jump {
          display: none;
        }
        
        .el-pagination__total {
          display: block;
          margin-bottom: 10px;
        }
      }
    }
  }
  
  .ticket-subject {
    font-weight: 500;
    color: #303133;
  }
  
  // 表格响应式
  .el-table {
    @media (max-width: 768px) {
      :deep(.el-table__body) {
        .el-table__row {
          .el-table__cell {
            padding: 8px 4px;
            font-size: 12px;
          }
        }
      }
      
      :deep(.el-table__header) {
        .el-table__cell {
          padding: 8px 4px;
          font-size: 12px;
        }
      }
    }
  }
}

.ticket-detail {
  .user-info {
    margin-bottom: 20px;
    
    .user-info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #ecf5ff;
      }
      
      .user-info-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
      
      .collapse-icon {
        font-size: 16px;
        color: #909399;
        transition: transform 0.3s;
        
        &.is-expanded {
          transform: rotate(180deg);
        }
      }
    }
    
    .user-info-content {
      margin-top: 12px;
    }
    
    .user-email {
      font-weight: 600;
      color: #409eff;
    }
    
    .user-remarks {
      color: #606266;
      font-style: italic;
    }
    
    .traffic-used {
      color: #e6a23c;
      font-weight: 500;
    }
    
    .traffic-total {
      color: #67c23a;
      font-weight: 500;
    }
    
    .user-balance {
      color: #f56c6c;
      font-weight: 600;
    }
  }
  
  .ticket-info {
    margin-bottom: 30px;
  }
  
  .messages-section {
    margin-bottom: 30px;
    
    h3 {
      margin-bottom: 20px;
      color: #303133;
      font-size: 16px;
    }
    
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 20px;
      background-color: #fafafa;
    }
    
    .message-item {
      display: flex;
      margin-bottom: 20px;
      align-items: flex-start;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.admin-message {
        .message-content {
          background-color: #e1f3d8;
          border-left: 4px solid #67c23a;
        }
      }
      
      &.user-message {
        .message-content {
          background-color: #f0f9ff;
          border-left: 4px solid #409eff;
        }
      }
      
      .message-avatar {
        margin-right: 12px;
        flex-shrink: 0;
      }
      
      .message-content {
        flex: 1;
        padding: 12px 16px;
        border-radius: 8px;
        
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .message-sender {
            font-weight: 600;
            color: #303133;
          }
          
          .message-time {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .message-text {
          color: #606266;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .message-images {
          margin-top: 12px;
          
          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
            max-width: 300px;
          }
          
          .message-image-item {
            aspect-ratio: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
            border: 1px solid #e4e7ed;
            
            &:hover {
              transform: scale(1.05);
            }
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
  
    .reply-section {
    .reply-form-inline {
      .reply-input-row {
        display: flex;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 16px;
        min-height: 120px;
        
        .reply-textarea {
          flex: 1;
          
          :deep(.el-textarea__inner) {
            resize: none;
            height: 100%;
          }
        }
        
        .reply-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 120px;
          height: 100%;
          justify-content: space-between;
          
          .upload-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            
            .inline-upload {
              :deep(.el-upload--picture-card) {
                width: 60px;
                height: 60px;
                line-height: 60px;
              }
            }
            
            .upload-btn {
              width: 100%;
            }
          }
          
          .send-btn {
            width: 100%;
            align-self: flex-end;
          }
        }
      }
      
      .upload-tip {
        margin-top: 8px;
      }
    }
  }
  
  // 响应式设计
  @media (max-width: 1200px) {
    .ticket-dialog-header {
      .ticket-subject {
        font-size: 14px;
        padding: 4px 12px;
      }
    }
    
    .user-info-content {
      .el-descriptions {
        :deep(.el-descriptions__body) {
          .el-descriptions__table {
            .el-descriptions__cell {
              padding: 8px 12px;
            }
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    // 移动端样式
    .reply-section {
      .reply-form-inline {
        .reply-input-row {
          flex-direction: column;
          gap: 12px;
          min-height: auto;
          
          .reply-textarea {
            min-height: 100px;
            
            :deep(.el-textarea__inner) {
              height: 100px;
            }
          }
          
          .reply-actions {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            min-width: auto;
            height: auto;
            gap: 8px;
            
            .upload-section {
              flex-direction: row;
              align-items: center;
              gap: 8px;
              
              .inline-upload {
                :deep(.el-upload--picture-card) {
                  width: 50px;
                  height: 50px;
                  line-height: 50px;
                }
              }
              
              .upload-btn {
                width: auto;
                white-space: nowrap;
              }
            }
            
            .send-btn {
              width: auto;
              white-space: nowrap;
            }
          }
        }
      }
    }
    
    .ticket-dialog-header {
      flex-direction: column;
      gap: 8px;
      text-align: center;
      
      .ticket-id {
        margin-right: 0;
        margin-bottom: 8px;
      }
      
      .ticket-subject {
        font-size: 14px;
        padding: 6px 12px;
        max-width: 100%;
      }
    }
    
    .user-info {
      .user-info-header {
        padding: 12px;
        
        .user-info-title {
          font-size: 14px;
        }
      }
      
      .user-info-content {
        .el-descriptions {
          :deep(.el-descriptions__body) {
            .el-descriptions__table {
              .el-descriptions__cell {
                padding: 6px 8px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
    
    .traffic-info {
      .el-table {
        :deep(.el-table__body) {
          .el-table__row {
            .el-table__cell {
              padding: 8px 4px;
              font-size: 12px;
            }
          }
        }
      }
      
      .traffic-pagination {
        margin-top: 16px;
        
        :deep(.el-pagination) {
          .el-pagination__sizes,
          .el-pagination__jump {
            display: none;
          }
        }
      }
    }
  }
  
  @media (max-width: 480px) {
    // 超小屏幕样式
    .reply-section {
      .reply-form-inline {
        .reply-input-row {
          .reply-actions {
            .upload-section {
              .inline-upload {
                :deep(.el-upload--picture-card) {
                  width: 40px;
                  height: 40px;
                  line-height: 40px;
                }
              }
              
              .upload-btn {
                font-size: 12px;
                padding: 6px 8px;
              }
            }
            
            .send-btn {
              font-size: 12px;
              padding: 6px 8px;
            }
          }
        }
      }
    }
    
    .user-info {
      .user-info-content {
        .el-descriptions {
          :deep(.el-descriptions__body) {
            .el-descriptions__table {
              .el-descriptions__cell {
                padding: 4px 6px;
                font-size: 11px;
              }
            }
          }
        }
      }
    }
    
    .traffic-info {
      .el-table {
        :deep(.el-table__body) {
          .el-table__row {
            .el-table__cell {
              padding: 6px 2px;
              font-size: 11px;
            }
          }
        }
      }
    }
  }
}

.image-preview {
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
  }
}

  .traffic-info {
    .upload-traffic {
      color: #e6a23c;
      font-weight: 500;
    }
    
    .download-traffic {
      color: #67c23a;
      font-weight: 500;
    }
    
    .traffic-pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .ticket-dialog-header {
    display: flex;
    align-items: center;
    width: 100%;
    
    .ticket-id {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      flex-shrink: 0;
      margin-right: 20px;
    }
    
    .ticket-subject {
      flex: 1;
      text-align: center;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      max-width: fit-content;
      margin: 0 auto;
      
      &.status-0 {
        background-color: #67c23a !important; // 已开启状态 - 绿色
      }
      
      &.status-1 {
        background-color: #909399 !important; // 已关闭状态 - 灰色
      }
    }
  }

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
