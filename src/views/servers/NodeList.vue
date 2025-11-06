<template>
  <div class="node-list">
    <el-card class="node-card">
      <div class="card-header">
        <div class="header-left">
          <a-button type="primary" @click="showAddModal">
            <el-icon><Plus /></el-icon>
          </el-button>
          <el-input
            v-model="searchKeyword"
            placeholder="输入任意关键字搜索"
            style="width: 300px; margin-left: 12px;"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-right">
          <a-button @click="toggleSortMode">
            <el-icon><Rank /></el-icon>
            编辑排序
          </el-button>
          <a-button @click="testSortFunction" style="margin-left: 10px;">
            <el-icon><Rank /></el-icon>
            测试排序
          </el-button>
        </div>
      </div>
      
             <div class="node-table">
         <AntTable :data-source="filteredNodeList" :loading="loading" style="width: 100%" `${row.id}-${row.type}-${row.online}`"
           :key="`${tableKey}-${userCountSort}`">
         >
          <!-- 拖拽手柄列 - 仅在排序模式下显示 -->

          <!-- 节点ID列 - 始终显示 -->

          <!-- 节点状态列 - 始终显示，无标题 -->

          <!-- 节点名称列 - 始终显示 -->

          <!-- 其他列 - 仅在非排序模式下显示 -->
          <template v-if="!sortMode">
            <!-- 显隐列 -->

            <!-- 节点类型列 -->

            <!-- 地址列 -->

            <!-- 人数列 -->

            <!-- 倍率列 -->

            <!-- 权限组列 -->

            <!-- 操作列 -->
            
          </template>
      </AntTable>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <!-- 分页已集成到 AntTable 中 -->
      </div>
    </el-card>

    <!-- 添加/编辑节点模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑节点' : '新建节点'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        v-loading="formLoading"
        class="node-form"
      >
        <el-form-item label="节点名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入节点名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="倍率" prop="rate">
          <el-input-number
            v-model="formData.rate"
            :min="0.1"
            :max="100"
            :step="0.1"
            :precision="1"
            style="width: 200px;"
          />
          <span style="margin-left: 8px;">x</span>
        </el-form-item>
        
        <el-form-item label="节点标签" prop="tags">
          <el-input
            v-model="tagInput"
            placeholder="输入后回车添加标签"
            @keyup.enter="addTag"
            style="width: 300px;"
          />
          <div class="tags-container">
            <a-tagv-for="tag in formData.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              style="margin: 4px;"
            >
              {{ tag }}
            </a-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="权限组" prop="group_id">
          <a-button type="text" @click="showPermissionGroupModal">
            添加权限组
          </a-button>
          <el-select
            v-model="formData.group_id"
            multiple
            placeholder="请选择权限组"
            style="width: 100%;"
          >
            <el-option
              v-for="group in permissionGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id.toString()"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="节点地址" prop="host">
          <el-input
            v-model="formData.host"
            placeholder="地址或IP"
          />
        </el-form-item>
        
        <el-form-item label="连接端口" prop="port">
          <el-input-number
            v-model="formData.port"
            :min="1"
            :max="65535"
            placeholder="用户连接端口"
            style="width: 200px;"
          />
        </el-form-item>
        
        <el-form-item label="服务端口" prop="server_port">
          <el-input-number
            v-model="formData.server_port"
            :min="1"
            :max="65535"
            placeholder="服务端开放端口"
            style="width: 200px;"
          />
        </el-form-item>
        
        <!-- VMess 特有配置 -->
        <template v-if="formData.type === 'vmess'">
          <el-form-item label="TLS" prop="tls">
            <div style="display: flex; align-items: center; gap: 12px;">
              <el-switch
                v-model="formData.tls"
                :active-value="1"
                :inactive-value="0"
              />
              <a-buttonv-if="formData.tls === 1"
                type="text" 
                @click="showTlsSettingsModal"
                style="padding: 0; font-size: 14px; color: #409eff;"
              >
                编辑配置
              </a-button>
            </div>
          </el-form-item>
          
          <el-form-item label="传输协议" prop="network">
            <el-select v-model="formData.network" placeholder="请选择传输协议" style="width: 100%;">
              <el-option label="TCP" value="tcp" />
              <el-option label="KCP" value="kcp" />
              <el-option label="WebSocket" value="ws" />
              <el-option label="HTTP" value="http" />
              <el-option label="Domain Socket" value="domainsocket" />
              <el-option label="QUIC" value="quic" />
              <el-option label="gRPC" value="grpc" />
            </el-select>
          </el-form-item>
          
          <!-- 传输协议配置 - 仅在选择ws或grpc时显示 -->
          <el-form-item 
            v-if="formData.network === 'ws' || formData.network === 'grpc'"
            label="协议配置" 
            prop="networkSettings"
          >
            <el-input
              v-model="networkSettingsJson"
              type="textarea"
              :rows="6"
              :placeholder="getNetworkSettingsPlaceholder()"
              @input="updateNetworkSettings"
            />
          </el-form-item>
        </template>
        
        <el-form-item label="加密算法" prop="cipher" v-if="formData.type === 'shadowsocks'">
          <el-select v-model="formData.cipher" placeholder="请选择加密算法" style="width: 100%;">
            <el-option label="aes-128-gcm" value="aes-128-gcm" />
            <el-option label="aes-192-gcm" value="aes-192-gcm" />
            <el-option label="aes-256-gcm" value="aes-256-gcm" />
            <el-option label="chacha20-ietf-poly1305" value="chacha20-ietf-poly1305" />
            <el-option label="2022-blake3-aes-128-gcm" value="2022-blake3-aes-128-gcm" />
            <el-option label="2022-blake3-aes-256-gcm" value="2022-blake3-aes-256-gcm" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="混淆" prop="obfs" v-if="formData.type === 'shadowsocks'">
          <el-select v-model="formData.obfs" placeholder="请选择混淆方式" style="width: 100%;">
            <el-option label="无" value="" />
            <el-option label="http" value="http" />
          </el-select>
        </el-form-item>
        
        <!-- Shadowsocks混淆设置 - 仅在选择了http混淆时显示 -->
        <el-form-item label="混淆设置" prop="obfs_settings" v-if="formData.type === 'shadowsocks' && formData.obfs === 'http'">
          <el-input
            v-model="obfsSettingsJson"
            type="textarea"
            :rows="4"
            placeholder="请输入JSON格式的混淆设置"
            @input="updateObfsSettings"
          />
        </el-form-item>
        
        <!-- Trojan 特有配置 -->
        <template v-if="formData.type === 'trojan'">
          <el-form-item label="允许不安全" prop="allow_insecure">
            <el-tooltip
              content="是否允许不安全的TLS连接"
              placement="top"
              :show-after="300"
              effect="light"
            >
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
            <el-switch
              v-model="formData.allow_insecure"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
          
          <el-form-item label="服务器名称指示(sni)" prop="server_name">
            <el-input
              v-model="formData.server_name"
              placeholder="请输入服务器名称指示"
            />
          </el-form-item>
        </template>
        
        <el-form-item label="父节点" prop="parent_id">
          <el-select v-model="formData.parent_id" placeholder="请选择父节点" style="width: 100%;">
            <el-option label="无" :value="null" />
            <el-option
              v-for="node in parentNodes"
              :key="node.id"
              :label="node.name"
              :value="node.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="路由组" prop="route_id">
          <el-select
            v-model="formData.route_id"
            multiple
            placeholder="请选择路由组"
            style="width: 100%;"
          >
            <el-option
              v-for="route in routeGroups"
              :key="route.id"
              :label="route.remarks"
              :value="route.id.toString()"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <a-button @click="modalVisible = false">取消</a-button>
        <a-button type="primary" @click="saveNode" :loading="saveLoading">
          {{ isEdit ? '保存' : '提交' }}
        </a-button>
      </template>
    </el-dialog>

    <!-- 节点类型选择模态框 -->
    <el-dialog
      v-model="nodeTypeModalVisible"
      title="选择节点类型"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="node-type-options">
        <div
          v-for="type in nodeTypes"
          :key="type.value"
          class="node-type-option"
          @click="selectNodeType(type)"
        >
          <div class="node-type-icon" :class="type.class"></div>
          <div class="node-type-info">
            <div class="node-type-name">{{ type.label }}</div>
            <div class="node-type-desc">{{ type.description }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- TLS设置模态框 -->
    <el-dialog
      v-model="tlsSettingsModalVisible"
      title="编辑TLS设置"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="tlsFormRef"
        :model="tlsFormData"
        label-width="120px"
        class="tls-form"
      >
        <el-form-item label="Server Name" prop="serverName">
          <el-input
            v-model="tlsFormData.serverName"
            placeholder="请输入服务器名称"
          />
        </el-form-item>
        
        <el-form-item label="Allow Insecure" prop="allowInsecure">
          <el-switch
            v-model="tlsFormData.allowInsecure"
            :active-value="'1'"
            :inactive-value="'0'"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <a-button @click="tlsSettingsModalVisible = false">取消</a-button>
        <a-button type="primary" @click="saveTlsSettings">
          确定
        </a-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Rank, 
  Filter, 
  QuestionFilled, 
  User, 
  ArrowDown, 
  ArrowUp, 
  Sort, 
  Edit, 
  CopyDocument, 
  Delete 
} from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import {
  getNodes,
  sortNodes,
  saveVmessServer,
  saveShadowsocksServer,
  saveTrojanServer,
  updateVmessServer,
  updateShadowsocksServer,
  updateTrojanServer,
  deleteVmessServer,
  deleteShadowsocksServer,
  deleteTrojanServer,
  copyVmessServer,
  copyShadowsocksServer,
  copyTrojanServer
} from '@/api/server'
import { getServerGroups } from '@/api/server'
import { getServerRoutes } from '@/api/server'

export default {
  name: 'NodeList',
  components: {
    Plus,
    Search,
    Rank,
    Filter,
    QuestionFilled,
    User,
    ArrowDown,
    ArrowUp,
    Sort,
    Edit,
    CopyDocument,
    Delete
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const nodeList = ref([])
    const searchKeyword = ref('')
    const sortMode = ref(false)
    const modalVisible = ref(false)
    const nodeTypeModalVisible = ref(false)
    const tlsSettingsModalVisible = ref(false)
    const isEdit = ref(false)
    const formLoading = ref(false)
    const saveLoading = ref(false)
    const formRef = ref(null)
    const tlsFormRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = [10, 20, 50, 100]
    const totalCount = ref(0)
    const permissionGroups = ref([])
    const routeGroups = ref([])
    const parentNodes = ref([])
    const tagInput = ref('')
    const networkSettingsJson = ref('{}')
    const obfsSettingsJson = ref('{}')
    const tableKey = ref(0) // 用于强制刷新表格
    
    // 人数排序状态
    const userCountSort = ref('') // '' | 'asc' | 'desc'
    
    // 下拉菜单引用
    const filterDropdownRef = ref(null)
    
    // 类型筛选数据
    const typeFilter = reactive({
      shadowsocks: false,
      vmess: false,
      trojan: false
    })
    
    // 实际应用的筛选状态
    const appliedTypeFilter = reactive({
      shadowsocks: true,
      vmess: true,
      trojan: true
    })
    
    // TLS设置表单数据
    const tlsFormData = reactive({
      serverName: '',
      allowInsecure: '0'
    })
      
      // 节点类型选项
    const nodeTypes = [
      {
        label: 'Shadowsocks',
        value: 'shadowsocks',
        description: 'Shadowsocks 协议节点',
        class: 'shadowsocks'
      },
      {
        label: 'VMess',
        value: 'vmess',
        description: 'VMess 协议节点',
        class: 'vmess'
      },
      {
        label: 'Trojan',
        value: 'trojan',
        description: 'Trojan 协议节点',
        class: 'trojan'
      }
    ]
    
    // 表单数据
    const formData = reactive({
      id: null,
      name: '',
      type: '',
      rate: 1,
      tags: [],
      group_id: [],
      host: '',
      server_port: 443,
      port: 443,
      cipher: 'aes-256-gcm',
      obfs: '',
      parent_id: null,
      route_id: [],
      show: true,
      // VMess 特有字段
      network: 'tcp',
      networkSettings: {},
      tls: 0,
      tlsSettings: {},
      // Shadowsocks 特有字段
      obfs_settings: {},
      // Trojan 特有字段
      server_name: '',
      allow_insecure: 0
    })
    
    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '节点名称不能为空', trigger: 'blur' }
      ],
      host: [
        { required: true, message: '节点地址不能为空', trigger: 'blur' }
      ],
      port: [
        { required: true, message: '连接端口不能为空', trigger: 'blur' }
      ],
      server_port: [
        { required: true, message: '服务端口不能为空', trigger: 'blur' }
      ],
      rate: [
        { required: true, message: '倍率不能为空', trigger: 'blur' }
      ],
      group_id: [
        { required: true, message: '权限组不能为空', trigger: 'change' }
      ]
    }
    
    // 计算属性
    const filteredNodeList = computed(() => {
      let filtered = nodeList.value
      
      // 类型筛选
      filtered = filtered.filter(node => {
        if (node.type === 'shadowsocks') return appliedTypeFilter.shadowsocks
        if (node.type === 'vmess') return appliedTypeFilter.vmess
        if (node.type === 'trojan') return appliedTypeFilter.trojan
        return false
      })
      
      // 搜索过滤
      if (searchKeyword.value) {
        filtered = filtered.filter(node => 
          node.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          node.host.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          node.id.toString().includes(searchKeyword.value)
        )
      }
      
      // 人数排序 - 确保对所有筛选后的数据进行排序
      if (userCountSort.value === 'asc') {
        filtered = [...filtered].sort((a, b) => {
          const aOnline = parseInt(a.online) || 0
          const bOnline = parseInt(b.online) || 0
          return aOnline - bOnline
        })
        console.log('升序排序结果:', filtered.slice(0, 5).map(item => ({ id: item.id, online: item.online, name: item.name })))
      } else if (userCountSort.value === 'desc') {
        filtered = [...filtered].sort((a, b) => {
          const aOnline = parseInt(a.online) || 0
          const bOnline = parseInt(b.online) || 0
          return bOnline - aOnline
        })
        console.log('降序排序结果:', filtered.slice(0, 5).map(item => ({ id: item.id, online: item.online, name: item.name })))
      } else {
        // 默认按原有排序
        filtered = [...filtered].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      }
      
      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      
      return filtered.slice(startIndex, endIndex)
    })
    
    // 计算过滤后的总数量（用于分页）
    const filteredTotalCount = computed(() => {
      let filtered = nodeList.value
      
      // 类型筛选
      filtered = filtered.filter(node => {
        if (node.type === 'shadowsocks') return appliedTypeFilter.shadowsocks
        if (node.type === 'vmess') return appliedTypeFilter.vmess
        if (node.type === 'trojan') return appliedTypeFilter.trojan
        return false
      })
      
      // 搜索过滤
      if (searchKeyword.value) {
        filtered = filtered.filter(node => 
          node.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          node.host.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          node.id.toString().includes(searchKeyword.value)
        )
      }
      
      return filtered.length
    })
    
    // 加载节点列表
    const loadNodeList = async () => {
      loading.value = true
      try {
        const response = await getNodes()
        const data = response.data || []
        
        // 处理数据，确保字段类型正确
        nodeList.value = data.map(item => ({
          ...item,
          show: Boolean(item.show),
          toggleLoading: false,
          // 确保数值字段为数字类型
          rate: parseFloat(item.rate) || 1,
          port: parseInt(item.port) || 443,
          server_port: parseInt(item.server_port) || 443,
          online: parseInt(item.online) || 0,
          sort: parseInt(item.sort) || 0, // 确保sort字段为数字
          // 确保数组字段正确
          group_id: Array.isArray(item.group_id) ? item.group_id : [],
          route_id: Array.isArray(item.route_id) ? item.route_id : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          // 确保VMess特有字段正确
          network: item.network || 'tcp',
          tls: item.tls || 0,
          server_name: item.server_name || '',
          allow_insecure: item.allow_insecure || 0,
          networkSettings: item.networkSettings || {},
          tlsSettings: item.tlsSettings || {
            serverName: '',
            allowInsecure: '0'
          },
          // 处理Shadowsocks特有配置
          obfs_settings: item.obfs_settings || {},
          cipher: item.cipher || 'aes-256-gcm',
          obfs: item.obfs || '',
          // 确保状态字段正确（后端计算得出）
          available_status: parseInt(item.available_status) || 0
        }))
        
        // 按sort字段排序
        nodeList.value.sort((a, b) => (a.sort || 0) - (b.sort || 0))
        
        totalCount.value = nodeList.value.length
        tableKey.value++ // 强制刷新表格
      } catch (error) {
        console.error('加载节点列表失败:', error)
        ElMessage.error('加载节点列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 加载权限组
    const loadPermissionGroups = async () => {
      try {
        const response = await getServerGroups()
        permissionGroups.value = response.data || []
      } catch (error) {
        console.error('加载权限组失败:', error)
      }
    }
    
    // 加载路由组
    const loadRouteGroups = async () => {
      try {
        const response = await getServerRoutes()
        routeGroups.value = response.data || []
      } catch (error) {
        console.error('加载路由组失败:', error)
      }
    }
    
    // 加载父节点
    const loadParentNodes = async () => {
      try {
        const response = await getNodes()
        const data = response.data || []
        // 过滤出可以作为父节点的节点（排除当前编辑的节点）
        parentNodes.value = data.filter(node => node.show && node.id !== formData.id).map(node => ({
          id: node.id,
          name: node.name,
          type: node.type
        }))
      } catch (error) {
        console.error('加载父节点失败:', error)
      }
    }
    
    // 获取权限组名称
    const getPermissionGroups = (groupIds) => {
      if (!Array.isArray(groupIds)) return []
      return groupIds.map(id => {
        // 将字符串ID转换为数字进行比较
        const groupId = parseInt(id)
        const group = permissionGroups.value.find(g => g.id === groupId)
        return group ? group.name : `组${id}`
      })
    }
    
    // 获取路由组名称
    const getRouteGroups = (routeIds) => {
      if (!Array.isArray(routeIds)) return []
      return routeIds.map(id => {
        // 将字符串ID转换为数字进行比较
        const routeId = parseInt(id)
        const route = routeGroups.value.find(r => r.id === routeId)
        return route ? route.remarks : `路由${id}`
      })
    }
    
    // 获取节点类型样式类
    const getNodeTypeClass = (type) => {
      switch (type) {
        case 'shadowsocks': return 'type-shadowsocks'
        case 'vmess': return 'type-vmess'
        case 'trojan': return 'type-trojan'
        default: return 'type-default'
      }
    }
    
    // 获取节点类型标签CSS类
    const getNodeTypeTagClass = (type) => {
      if (!type) return 'node-type-tag' // 防止null或undefined
      switch (type) {
        case 'shadowsocks': return 'node-type-tag custom-ss'
        case 'vmess': return 'node-type-tag custom-vmess'
        case 'trojan': return 'node-type-tag custom-trojan'
        default: return 'node-type-tag'
      }
    }
    
    // 获取节点类型标签
    const getNodeTypeLabel = (type) => {
      switch (type) {
        case 'shadowsocks': return 'SS'
        case 'vmess': return 'VMess'
        case 'trojan': return 'Trojan'
        default: return 'Unknown'
      }
    }

    // 获取节点状态文本
    const getNodeStatusText = (status) => {
      switch (status) {
        case 0: return '未运行'
        case 1: return '无人使用或服务端上报异常'
        case 2: return '运行正常'
        default: return '未知状态'
      }
    }

    // 获取节点状态样式类
    const getNodeStatusClass = (status) => {
      switch (status) {
        case 0: return 'status-offline' // 红色 - 未运行
        case 1: return 'status-warning' // 橙色 - 无人使用或服务端上报异常
        case 2: return 'status-online'  // 蓝色 - 运行正常
        default: return 'status-offline'
      }
    }
    
    // 切换排序模式
    const toggleSortMode = () => {
      sortMode.value = !sortMode.value
      
      // 强制刷新表格，解决样式问题
      tableKey.value++
      
      if (sortMode.value) {
        ElMessage.info('已进入排序模式，拖拽节点进行排序')
      } else {
        ElMessage.success('已退出排序模式')
      }
    }
    
    // 销毁拖拽排序
    const destroySortable = () => {
      const tbody = document.querySelector('.node-table .el-table__body-wrapper tbody')
      if (tbody && tbody.sortable) {
        tbody.sortable.destroy()
        tbody.sortable = null
      }
    }
    
    // 初始化拖拽排序
    const initSortable = () => {
      // 先销毁之前的实例
      destroySortable()
      
      const tbody = document.querySelector('.node-table .el-table__body-wrapper tbody')
      if (tbody) {
        tbody.sortable = Sortable.create(tbody, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          handle: '.drag-handle',
          filter: '.el-table__empty-block',
          onStart: (evt) => {
            console.log('开始拖拽:', evt.item)
          },
          onMove: (evt) => {
            // 允许移动到任何位置
            return true
          },
          onEnd: async (evt) => {
            const { oldIndex, newIndex } = evt
            if (oldIndex !== newIndex) {
              try {
                console.log('拖拽事件:', { oldIndex, newIndex })
                console.log('总节点数:', nodeList.value.length)
                
                // 使用插入式排序逻辑
                const newOrder = []
                
                // 获取当前显示的所有节点
                const currentNodes = [...nodeList.value]
                
                // 移除被拖拽的节点
                const movedNode = currentNodes.splice(oldIndex, 1)[0]
                
                // 在目标位置插入节点（插入式排序）
                currentNodes.splice(newIndex, 0, movedNode)
                
                // 构建排序数据
                currentNodes.forEach((node, index) => {
                  newOrder.push({
                    key: node.type,
                    value: node.id
                  })
                  console.log(`位置 ${index + 1}: ${node.type} ID ${node.id}`)
                })
                
                console.log('发送的插入式排序数据:', newOrder)
                console.log('排序数据长度:', newOrder.length)
                
                if (newOrder.length === 0) {
                  ElMessage.error('无法获取排序数据')
                  return
                }
                
                // 检查是否包含了所有节点
                if (newOrder.length !== nodeList.value.length) {
                  console.warn(`排序数据不完整: 发送了 ${newOrder.length} 个节点，但总共有 ${nodeList.value.length} 个节点`)
                  ElMessage.warning('排序数据不完整，可能影响排序效果')
                }
                
                // 调用排序API
                const response = await sortNodes({ sorts: newOrder })
                console.log('排序API响应:', response)
                
                ElMessage.success('排序更新成功')
                
                // 重新加载数据以确保排序正确
                await loadNodeList()
              } catch (error) {
                console.error('排序失败:', error)
                ElMessage.error('排序更新失败: ' + error.message)
                // 重新加载数据恢复原顺序
                await loadNodeList()
              }
            }
          }
        })
      }
    }
    
    // 切换节点状态
    const toggleNodeStatus = async (row) => {
      row.toggleLoading = true
      try {
        const updateFunction = getUpdateFunction(row.type)
        await updateFunction({ id: row.id, show: row.show })
        ElMessage.success(row.show ? '节点已启用' : '节点已禁用')
      } catch (error) {
        // 恢复原状态
        row.show = !row.show
        ElMessage.error('操作失败')
      } finally {
        row.toggleLoading = false
      }
    }
    
    // 获取更新函数
    const getUpdateFunction = (type) => {
      switch (type) {
        case 'vmess': return updateVmessServer
        case 'shadowsocks': return updateShadowsocksServer
        case 'trojan': return updateTrojanServer
        default: return updateVmessServer
      }
    }
    
    // 获取保存函数
    const getSaveFunction = (type) => {
      switch (type) {
        case 'vmess': return saveVmessServer
        case 'shadowsocks': return saveShadowsocksServer
        case 'trojan': return saveTrojanServer
        default: return saveVmessServer
      }
    }
    
    // 获取删除函数
    const getDeleteFunction = (type) => {
      switch (type) {
        case 'vmess': return deleteVmessServer
        case 'shadowsocks': return deleteShadowsocksServer
        case 'trojan': return deleteTrojanServer
        default: return deleteVmessServer
      }
    }
    
    // 获取复制函数
    const getCopyFunction = (type) => {
      switch (type) {
        case 'vmess': return copyVmessServer
        case 'shadowsocks': return copyShadowsocksServer
        case 'trojan': return copyTrojanServer
        default: return copyVmessServer
      }
    }
    
    // 切换人数排序
    const toggleUserCountSort = () => {
      if (userCountSort.value === '') {
        userCountSort.value = 'desc' // 从最多开始
      } else if (userCountSort.value === 'desc') {
        userCountSort.value = 'asc' // 切换到最少
      } else {
        userCountSort.value = '' // 重置为默认排序
      }
      // 重置到第一页
      currentPage.value = 1
      console.log('人数排序状态:', userCountSort.value)
    }
    
    // 处理操作命令
    const handleCommand = async (command, row) => {
      switch (command) {
        case 'edit':
          showEditModal(row)
          break
        case 'copy':
          copyNode(row)
          break
        case 'delete':
          deleteNode(row)
          break
      }
    }
    
    // 显示添加模态框
    const showAddModal = () => {
      nodeTypeModalVisible.value = true
    }
    
    // 选择节点类型
    const selectNodeType = async (type) => {
      isEdit.value = false
      resetForm()
      
      // 设置节点类型（在resetForm之后设置）
      formData.type = type.value
      nodeTypeModalVisible.value = false
      
      // 如果是VMess，设置默认的传输协议配置
      if (type.value === 'vmess') {
        formData.network = 'tcp' // 默认使用TCP
        formData.networkSettings = {}
        networkSettingsJson.value = '{}'
        // 初始化TLS设置
        formData.tlsSettings = {
          serverName: '',
          allowInsecure: '0'
        }
      }
      
      // 如果是Shadowsocks，设置默认配置
      if (type.value === 'shadowsocks') {
        formData.cipher = 'aes-256-gcm'
        formData.obfs = ''
        formData.obfs_settings = {}
        obfsSettingsJson.value = '{}'
      }
      
      // 如果是Trojan，设置默认配置
      if (type.value === 'trojan') {
        formData.allow_insecure = 0
        formData.server_name = ''
      }
      
      // 加载父节点选项
      await loadParentNodes()
      
      modalVisible.value = true
    }
    
    // 显示编辑模态框
    const showEditModal = async (row) => {
      isEdit.value = true
      resetForm()
      
      // 填充表单数据
      Object.keys(formData).forEach(key => {
        if (row[key] !== undefined) {
          if (key === 'group_id' || key === 'route_id') {
            // 确保权限组和路由组ID保持字符串类型
            formData[key] = Array.isArray(row[key]) ? row[key].map(id => id.toString()) : []
          } else {
            formData[key] = row[key]
          }
        }
      })
      
      // 处理VMess特有配置的JSON字符串
      if (formData.type === 'vmess' && row.networkSettings) {
        try {
          formData.networkSettings = typeof row.networkSettings === 'string' 
            ? JSON.parse(row.networkSettings) 
            : row.networkSettings
        } catch (error) {
          console.error('解析VMess网络配置JSON失败:', error)
          formData.networkSettings = {} // 确保是对象
        }
      } else {
        formData.networkSettings = {} // 确保是对象
      }
      
      // 处理TLS配置
      if (formData.type === 'vmess' && row.tlsSettings) {
        try {
          formData.tlsSettings = typeof row.tlsSettings === 'string' 
            ? JSON.parse(row.tlsSettings) 
            : row.tlsSettings
        } catch (error) {
          console.error('解析VMess TLS配置JSON失败:', error)
          formData.tlsSettings = {
            serverName: '',
            allowInsecure: '0'
          }
        }
      } else {
        formData.tlsSettings = {
          serverName: '',
          allowInsecure: '0'
        }
      }
      
      // 确保TLS设置字段存在
      if (!formData.tlsSettings.serverName) {
        formData.tlsSettings.serverName = ''
      }
      if (!formData.tlsSettings.allowInsecure) {
        formData.tlsSettings.allowInsecure = '0'
      }
      
      // 处理TLS开关状态
      formData.tls = row.tls || 0
      
      // 处理Shadowsocks特有配置
      if (formData.type === 'shadowsocks') {
        formData.obfs_settings = row.obfs_settings || {}
        formData.cipher = row.cipher || 'aes-256-gcm'
        formData.obfs = row.obfs || ''
        
        // 处理obfs_settings JSON字符串
        if (row.obfs_settings) {
          try {
            formData.obfs_settings = typeof row.obfs_settings === 'string' 
              ? JSON.parse(row.obfs_settings) 
              : row.obfs_settings
          } catch (error) {
            console.error('解析Shadowsocks混淆配置JSON失败:', error)
            formData.obfs_settings = {}
          }
        }
        
        // 设置obfsSettings的JSON字符串显示
        obfsSettingsJson.value = JSON.stringify(formData.obfs_settings, null, 2)
      }
      
      // 处理Trojan特有字段
      if (formData.type === 'trojan') {
        formData.allow_insecure = row.allow_insecure || 0
        formData.server_name = row.server_name || ''
      }
      
      // 设置networkSettings的JSON字符串显示
      networkSettingsJson.value = JSON.stringify(formData.networkSettings, null, 2)
      
      // 确保协议配置正确显示
      if (formData.network === 'ws' || formData.network === 'grpc') {
        // 如果当前协议需要配置，确保JSON字符串正确
        if (!networkSettingsJson.value || networkSettingsJson.value === '{}') {
          // 为ws和grpc提供默认配置模板
          if (formData.network === 'ws') {
            const defaultWsSettings = {
              path: '/',
              headers: {
                Host: formData.host
              }
            }
            formData.networkSettings = defaultWsSettings
            networkSettingsJson.value = JSON.stringify(defaultWsSettings, null, 2)
          } else if (formData.network === 'grpc') {
            const defaultGrpcSettings = {
              serviceName: 'grpc'
            }
            formData.networkSettings = defaultGrpcSettings
            networkSettingsJson.value = JSON.stringify(defaultGrpcSettings, null, 2)
          }
        }
      }
      
      // 加载父节点选项
      await loadParentNodes()
      
      modalVisible.value = true
    }
    
    // 重置表单
    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        if (key === 'rate') {
          formData[key] = 1
        } else if (key === 'tags' || key === 'group_id' || key === 'route_id') {
          formData[key] = []
        } else if (key === 'server_port' || key === 'port') {
          formData[key] = 443
        } else if (key === 'cipher') {
          formData[key] = 'aes-256-gcm'
        } else if (key === 'obfs') {
          formData[key] = ''
        } else if (key === 'parent_id') {
          formData[key] = null
        } else if (key === 'show') {
          formData[key] = true
        } else if (key === 'network') {
          formData[key] = 'tcp'
        } else if (key === 'tls') {
          formData[key] = 0
        } else if (key === 'tlsSettings') {
          formData[key] = {
            serverName: '',
            allowInsecure: '0'
          }
        } else if (key === 'networkSettings') {
          formData[key] = {}
        } else if (key === 'obfs_settings') {
          formData[key] = {}
        } else if (key === 'allow_insecure') {
          formData[key] = 0
        } else if (key === 'server_name') {
          formData[key] = ''
        } else if (key === 'id') {
          formData[key] = null
        } else if (key === 'name') {
          formData[key] = ''
        } else if (key === 'host') {
          formData[key] = ''
        }
        // 注意：不重置type字段，保持节点类型
      })
      tagInput.value = ''
      networkSettingsJson.value = '{}'
      obfsSettingsJson.value = '{}'
      
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }
    
    // 添加标签
    const addTag = () => {
      if (tagInput.value.trim() && !formData.tags.includes(tagInput.value.trim())) {
        formData.tags.push(tagInput.value.trim())
        tagInput.value = ''
      }
    }
    
    // 移除标签
    const removeTag = (tag) => {
      const index = formData.tags.indexOf(tag)
      if (index > -1) {
        formData.tags.splice(index, 1)
      }
    }

    // 更新网络配置JSON
    const updateNetworkSettings = () => {
      try {
        formData.networkSettings = JSON.parse(networkSettingsJson.value)
      } catch (error) {
        ElMessage.error('协议配置JSON格式错误')
        formData.networkSettings = {} // 确保是对象
      }
    }
    
    // 更新混淆配置JSON
    const updateObfsSettings = () => {
      try {
        formData.obfs_settings = JSON.parse(obfsSettingsJson.value)
      } catch (error) {
        ElMessage.error('混淆配置JSON格式错误')
        formData.obfs_settings = {} // 确保是对象
      }
    }
    
    // 显示TLS设置弹窗
    const showTlsSettingsModal = () => {
      // 将当前TLS设置复制到弹窗表单
      tlsFormData.serverName = formData.tlsSettings.serverName || ''
      tlsFormData.allowInsecure = formData.tlsSettings.allowInsecure || '0'
      tlsSettingsModalVisible.value = true
    }
    
    // 保存TLS设置
    const saveTlsSettings = () => {
      // 将弹窗表单数据复制回主表单
      formData.tlsSettings.serverName = tlsFormData.serverName
      formData.tlsSettings.allowInsecure = tlsFormData.allowInsecure
      tlsSettingsModalVisible.value = false
      ElMessage.success('TLS设置已保存')
    }
    
    // 获取协议配置占位符文本
    const getNetworkSettingsPlaceholder = () => {
      if (formData.network === 'ws') {
        return `请输入WebSocket配置，例如：
{
  "path": "/",
  "headers": {
    "Host": "${formData.host || 'example.com'}"
  }
}`
      } else if (formData.network === 'grpc') {
        return `请输入gRPC配置，例如：
{
  "serviceName": "grpc"
}`
      }
      return '请输入JSON格式的协议配置'
    }
    
    // 保存节点
    const saveNode = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
      } catch (error) {
        return
      }
      
      saveLoading.value = true
      try {
        // 格式化数据，确保发送给后端的数据格式正确
        const formattedData = { ...formData }
        
        // 将权限组和路由组ID转换为数字数组
        if (Array.isArray(formattedData.group_id)) {
          formattedData.group_id = formattedData.group_id.map(id => parseInt(id))
        }
        if (Array.isArray(formattedData.route_id)) {
          formattedData.route_id = formattedData.route_id.map(id => parseInt(id))
        }

        // 处理VMess的networkSettings和tlsSettings JSON
        if (formattedData.type === 'vmess') {
          if (typeof formattedData.networkSettings === 'object') {
            formattedData.networkSettings = JSON.stringify(formattedData.networkSettings)
          }
          if (typeof formattedData.tlsSettings === 'object') {
            formattedData.tlsSettings = JSON.stringify(formattedData.tlsSettings)
          }
        }
        
        // 处理Shadowsocks的obfs_settings JSON
        if (formattedData.type === 'shadowsocks') {
          if (typeof formattedData.obfs_settings === 'object') {
            formattedData.obfs_settings = JSON.stringify(formattedData.obfs_settings)
          }
        }
        
        const saveFunction = getSaveFunction(formData.type)
        await saveFunction(formattedData)
        
        ElMessage.success(isEdit.value ? '节点更新成功' : '节点添加成功')
        modalVisible.value = false
        loadNodeList()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        saveLoading.value = false
      }
    }
    
    // 复制节点
    const copyNode = async (row) => {
      try {
        const copyFunction = getCopyFunction(row.type)
        await copyFunction({ id: row.id })
        ElMessage.success('节点复制成功')
        loadNodeList()
      } catch (error) {
        ElMessage.error('复制失败')
      }
    }
    
    // 删除节点
    const deleteNode = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除节点"${row.name}"吗？`,
          '确认删除',
          {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          }
        )
        
        const deleteFunction = getDeleteFunction(row.type)
        await deleteFunction({ id: row.id })
        ElMessage.success('删除成功')
        loadNodeList()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
    }
    
    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1 // 搜索时重置到第一页
    }
    
    // 显示节点类型过滤器
    const showNodeTypeFilter = () => {
      // TODO: 实现节点类型过滤
    }
    
    // 显示权限组过滤器
    const showGroupFilter = () => {
      // TODO: 实现权限组过滤
    }
    
    // 显示权限组模态框
    const showPermissionGroupModal = () => {
      ElMessage.info('权限组管理功能开发中...')
    }
    
    // 处理类型筛选
    const handleTypeFilter = (command) => {
      // 这个方法可以用于处理下拉菜单的命令
    }
    
    // 应用类型筛选
    const applyTypeFilter = () => {
      // 这个方法现在不需要做任何事情，因为筛选在确认时才应用
    }
    
    // 重置类型筛选
    const resetTypeFilter = () => {
      typeFilter.shadowsocks = false
      typeFilter.vmess = false
      typeFilter.trojan = false
      // 重置实际应用的筛选状态为显示所有
      appliedTypeFilter.shadowsocks = true
      appliedTypeFilter.vmess = true
      appliedTypeFilter.trojan = true
      currentPage.value = 1
      
      // 强制刷新表格，确保重置生效
      tableKey.value++
    }
    
    // 确认类型筛选
    const confirmTypeFilter = () => {
      // 将当前选中的状态应用到实际筛选
      appliedTypeFilter.shadowsocks = typeFilter.shadowsocks
      appliedTypeFilter.vmess = typeFilter.vmess
      appliedTypeFilter.trojan = typeFilter.trojan
      currentPage.value = 1
      
      // 强制刷新表格，确保筛选生效
      tableKey.value++
      
      // 手动关闭下拉菜单
      if (filterDropdownRef.value) {
        filterDropdownRef.value.handleClose()
      }
      
      // 调试信息
      console.log('筛选状态:', {
        typeFilter: { ...typeFilter },
        appliedTypeFilter: { ...appliedTypeFilter }
      })
    }
    
    // 复制到剪贴板
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('地址已复制到剪贴板')
      } catch (error) {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          ElMessage.success('地址已复制到剪贴板')
        } catch (fallbackError) {
          ElMessage.error('复制失败，请手动复制')
        }
        document.body.removeChild(textArea)
      }
    }
    
    // 测试排序功能
    const testSortFunction = async () => {
      try {
        // 使用当前节点列表中的真实ID进行测试
        if (nodeList.value.length === 0) {
          ElMessage.error('没有可用的节点进行测试')
          return
        }
        
        // 取前3个节点进行测试
        const testNodes = nodeList.value.slice(0, 3)
        const newOrder = testNodes.map((node, index) => ({
          key: node.type,
          value: node.id
        }))
        
        console.log('测试排序数据:', newOrder)
        
        // 调用排序API
        const response = await sortNodes({ sorts: newOrder })
        console.log('测试排序响应:', response)
        
        ElMessage.success('测试排序成功')
        await loadNodeList() // 重新加载数据以应用排序
      } catch (error) {
        console.error('测试排序失败:', error)
        ElMessage.error('测试排序失败: ' + error.message)
      }
    }
    
    // 监听排序模式变化
    watch(sortMode, (newVal) => {
      if (newVal) {
        // 进入排序模式，等待表格重新渲染后初始化
        nextTick(() => {
          setTimeout(() => {
            initSortable()
          }, 300)
        })
      } else {
        // 退出排序模式，销毁实例
        destroySortable()
      }
    })
    
    // 监听搜索关键词变化，重置页码
    watch(searchKeyword, () => {
      currentPage.value = 1
    })
    
    // 监听传输协议变化，重置协议配置
    watch(() => formData.network, (newNetwork) => {
      if (newNetwork === 'tcp' || newNetwork === 'kcp' || newNetwork === 'http' || newNetwork === 'domainsocket' || newNetwork === 'quic') {
        // 对于不需要配置的协议，清空协议配置
        formData.networkSettings = {}
        networkSettingsJson.value = '{}'
      }
    })
    
    // 监听筛选状态变化，用于调试
    watch(appliedTypeFilter, (newFilter) => {
      console.log('筛选状态已更新:', newFilter)
    }, { deep: true })
    
    // 组件挂载时加载数据
    onMounted(async () => {
      await Promise.all([
        loadNodeList(),
        loadPermissionGroups(),
        loadRouteGroups()
      ])
    })
    
    return {
      loading,
      nodeList,
      searchKeyword,
      sortMode,
      modalVisible,
      nodeTypeModalVisible,
      tlsSettingsModalVisible,
      isEdit,
      formLoading,
      saveLoading,
      formRef,
      tlsFormRef,
      currentPage,
      pageSize,
      pageSizeOptions,
      totalCount,
      permissionGroups,
      routeGroups,
      parentNodes,
      tagInput,
      networkSettingsJson,
      obfsSettingsJson,
      tlsFormData,
      nodeTypes,
      formData,
      formRules,
      filteredNodeList,
      filteredTotalCount,
      loadNodeList,
      getPermissionGroups,
      getRouteGroups,
      getNodeTypeClass,
      getNodeTypeTagClass,
      getNodeTypeLabel,
      getNodeStatusText,
      getNodeStatusClass,
      toggleSortMode,
      initSortable,
      toggleNodeStatus,
      handleCommand,
      showAddModal,
      selectNodeType,
      showEditModal,
      resetForm,
      addTag,
      removeTag,
      saveNode,
      copyNode,
      deleteNode,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      showNodeTypeFilter,
      showGroupFilter,
      showPermissionGroupModal,
      copyToClipboard,
      typeFilter,
      appliedTypeFilter,
      filterDropdownRef,
      handleTypeFilter,
      applyTypeFilter,
      resetTypeFilter,
      confirmTypeFilter,
      updateNetworkSettings,
      updateObfsSettings,
      showTlsSettingsModal,
      saveTlsSettings,
      getNetworkSettingsPlaceholder,
      testSortFunction,
      tableKey,
      userCountSort,
      toggleUserCountSort
    }
  }
}
</script>

<style lang="scss" scoped>
.node-list {
  padding: 20px;
  
  .node-card {
    .card-header {
    display: flex;
    justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .header-left {
        display: flex;
    align-items: center;
      }
    }
    
    .node-table {
      .drag-handle {
        transition: color 0.2s;
        
        &:hover {
          color: #0665d0;
        }
      }
      
      .el-table__row {
        cursor: move;
        
        &:hover {
          background-color: #f5f7fa;
        }
      }
      
      // 拖拽样式
      .sortable-ghost {
        opacity: 0.5;
        background-color: #f0f0f0;
      }
      
      .sortable-chosen {
        background-color: #e6f7ff;
      }
      
      .sortable-drag {
        opacity: 0.8;
        transform: rotate(5deg);
      }
      
      .node-id-badge {
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background-color: #f0f0f0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: white;
        transition: all 0.3s ease;
        
        &.type-shadowsocks {
          background-color: #20B2AA; // 青绿色 - Shadowsocks
        }
        
        &.type-vmess {
          background-color: rgb(203, 49, 128); // 紫红色 - VMess
        }
        
        &.type-trojan {
          background-color: rgb(234, 184, 84); // 金黄色 - Trojan
        }
        
        &.type-default {
          background-color: #909399; // 灰色 - 默认
        }
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }
      
      .node-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .node-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.status-offline {
            background-color: #f56c6c; // 红色 - 未运行
          }
          
          &.status-warning {
            background-color: #e6a23c; // 橙色 - 无人使用或服务端上报异常
          }
          
          &.status-online {
            background-color: #409eff; // 蓝色 - 运行正常
          }
        }
        
        .node-name {
          font-weight: 500;
        }
        
        .node-type-tag {
          font-size: 10px;
        }
      }
      
      .node-address {
        font-family: monospace;
        color: #666;
        font-size: 12px;
        
        &.clickable {
          cursor: pointer;
          
          &:hover {
            color: #409eff;
          }
        }
      }
      
      .user-count {
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: center;
        
        .el-icon {
          color: #909399;
        }
      }
      
      .rate-badge {
        display: inline-block;
        padding: 2px 8px;
        background-color: #f5f5f5;
        color: #333;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .permission-groups {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        
        .group-tag {
          font-size: 10px;
        }
      }
      
      .filter-icon,
      .help-icon,
      .dropdown-icon {
        margin-left: 4px;
        color: #909399;
        cursor: pointer;
        
        &:hover {
          color: #0665d0;
        }
      }
      
      // 列标题筛选样式
      .column-header-with-filter {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        
        .filter-icon {
          cursor: pointer;
          color: #909399;
          transition: color 0.3s;
          
          &:hover {
            color: #409eff;
          }
        }
      }
      
      // 列标题排序样式
      .column-header-with-sort {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        
        .sort-icon {
          cursor: pointer;
          color: #909399;
          transition: color 0.3s;
          font-size: 14px;
          
          &:hover {
            color: #409eff;
          }
        }
      }
      
      // 去除下拉菜单项的悬停背景色
      :deep(.el-dropdown-menu__item) {
        &:hover {
          background-color: transparent !important;
        }
        
        &.is-disabled {
          background-color: transparent !important;
        }
      }
      
      // 更具体的选择器来去除悬停背景色
      :deep(.el-dropdown-menu) {
        .el-dropdown-menu__item {
          &:hover {
            background-color: transparent !important;
          }
          
          &.is-disabled {
            background-color: transparent !important;
          }
        }
      }
      
      // 针对筛选弹窗的特殊处理
      .filter-options {
        :deep(.el-dropdown-menu__item) {
          &:hover {
            background-color: transparent !important;
          }
          
          &.is-disabled {
            background-color: transparent !important;
          }
        }
      }
      
      // 直接针对筛选下拉菜单的样式
      .column-header-with-filter {
        :deep(.el-dropdown-menu) {
          .el-dropdown-menu__item {
            &:hover {
              background-color: transparent !important;
            }
            
            &.is-disabled {
              background-color: transparent !important;
            }
          }
        }
      }
      
      // 筛选下拉内容样式
      .filter-dropdown-content {
        background: white;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        padding: 0;
        margin: 0;
      }
      
      // 筛选选项样式
      .filter-options {
        padding: 16px;
        min-width: 220px;
        
        .filter-title {
          font-weight: 500;
          margin-bottom: 16px;
          color: #303133;
          font-size: 14px;
          text-align: center;
        }
        
        .filter-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          
          .checkbox-item {
            padding: 8px 0;
            
            .el-checkbox {
              margin-right: 0;
              width: 100%;
              
              :deep(.el-checkbox__label) {
                font-size: 14px;
                color: #606266;
              }
            }
          }
        }
        
        .filter-actions {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #ebeef5;
        }
      }
      
      // 状态点样式
      .node-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin: 0 auto;
        
        &.status-offline {
          background-color: #f56c6c; // 红色 - 未运行
        }
        
        &.status-warning {
          background-color: #e6a23c; // 橙色 - 无人使用或服务端上报异常
        }
        
        &.status-online {
          background-color: #409eff; // 蓝色 - 运行正常
        }
      }
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      
      // 自定义分页样式
      :deep(.el-pagination) {
        .el-pagination__total {
          display: none; // 隐藏总数显示
        }
        
        .el-pagination__sizes {
          margin-left: 16px;
          
          .el-select {
            .el-input {
              .el-input__wrapper {
                background-color: #f5f7fa;
                border: 1px solid #dcdfe6;
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
        
        .btn-prev,
        .btn-next {
          background-color: #f5f7fa;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          color: #606266;
          
          &:hover {
            background-color: #ecf5ff;
            border-color: #409eff;
            color: #409eff;
          }
          
          &:disabled {
            background-color: #f5f7fa;
            border-color: #e4e7ed;
            color: #c0c4cc;
          }
        }
        
        .el-pager {
          li {
            background-color: #f5f7fa;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            color: #606266;
            margin: 0 2px;
            
            &:hover {
              background-color: #ecf5ff;
              border-color: #409eff;
              color: #409eff;
            }
            
            &.active {
              background-color: #409eff;
              border-color: #409eff;
              color: white;
            }
            
            &.disabled {
              background-color: #f5f7fa;
              border-color: #e4e7ed;
              color: #c0c4cc;
            }
          }
        }
      }
    }
  }
  
  // 页面大小选择器样式 - 将 "10/page" 改为 "10/页"
  :deep(.page-size-popper) {
    .el-select-dropdown__item {
      span {
        &::after {
          content: "/页";
        }
      }
    }
  }
  
  // 分页组件页面大小显示文本
  :deep(.el-pagination) {
    .el-pagination__sizes {
      .el-select {
        .el-input {
          .el-input__inner {
            &::after {
              content: "/页";
            }
          }
        }
      }
    }
  }
  
  // 全局修改分页组件页面大小显示
  :deep(.el-pagination__sizes) {
    .el-select {
      .el-input {
        .el-input__inner {
          &::after {
            content: "/页";
          }
        }
      }
    }
  }
  
  // 强制修改页面大小选择器的文本显示
  :deep(.el-pagination__sizes) {
    .el-select {
      .el-input {
        .el-input__inner {
          &::after {
            content: "/页" !important;
          }
        }
      }
    }
  }
  
  // 修改下拉选项的文本
  :deep(.el-select-dropdown__item) {
    span {
      &::after {
        content: "/页" !important;
      }
    }
  }
  
  // 全局去除下拉菜单悬停背景色
  :deep(.el-dropdown-menu__item) {
    &:hover {
      background-color: transparent !important;
    }
    
    &.is-disabled {
      background-color: transparent !important;
    }
  }
  
  // 节点表单样式
  .node-form {
    padding: 10px 0;
    
    :deep(.el-form-item) {
      margin-bottom: 20px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #303133;
      }
    }
    
    .tags-container {
      margin-top: 8px;
    }
  }
  
  // TLS表单样式
  .tls-form {
    padding: 10px 0;
    
    :deep(.el-form-item) {
      margin-bottom: 20px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #303133;
      }
    }
  }
  
  // 拖拽排序样式
  .drag-handle {
    cursor: move;
    color: #909399;
    transition: color 0.3s;
    
    &:hover {
      color: #0665d0;
    }
  }
  
  // Sortable.js 拖拽样式
  :deep(.sortable-ghost) {
    opacity: 0.5;
    background-color: #f0f9ff !important;
    border: 2px dashed #0665d0 !important;
    
    td {
      background-color: #f0f9ff !important;
      border-color: #0665d0 !important;
    }
  }
  
  :deep(.sortable-chosen) {
    background-color: #e6f7ff !important;
    box-shadow: 0 2px 8px rgba(6, 101, 208, 0.3);
    
    td {
      background-color: #e6f7ff !important;
    }
  }
  
  :deep(.sortable-drag) {
    background-color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: rotate(2deg);
    z-index: 1000;
    
    td {
      background-color: #ffffff !important;
    }
  }
  
  // 拖拽时的行高亮效果
  :deep(.el-table__row) {
    transition: all 0.3s ease;
    
    &.sortable-ghost {
      transform: scale(0.98);
    }
    
    &.sortable-chosen {
      transform: scale(1.02);
    }
  }
  
  // 节点类型选择模态框
  .node-type-options {
    .node-type-option {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #0665d0;
        background-color: #f5f7fa;
      }
      
      .node-type-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        
        &.shadowsocks {
          background-color: #20B2AA; // 青绿色 - Shadowsocks
        }
        
        &.vmess {
          background-color: rgb(203, 49, 128); // 紫红色 - VMess
        }
        
        &.trojan {
          background-color: rgb(234, 184, 84); // 金黄色 - Trojan
        }
      }
      
      .node-type-info {
        flex: 1;
        
        .node-type-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .node-type-desc {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
  
  // 自定义按钮和开关颜色
  :deep(.el-button--primary) {
    background-color: #0665d0;
    border-color: #0665d0;
    
    &:hover {
      background-color: #0556b3;
      border-color: #0556b3;
    }
    
    &:active {
      background-color: #044a9a;
      border-color: #044a9a;
    }
  }
  
  // 操作按钮样式 - 去掉背景色，只显示文字和箭头
  :deep(.operation-button) {
    background-color: transparent !important;
    border: none !important;
    color: #409eff !important;
    padding: 0 !important;
    
    &:hover {
      background-color: transparent !important;
      color: #66b1ff !important;
    }
    
    &:active {
      background-color: transparent !important;
      color: #3a8ee6 !important;
    }
    
    &:focus {
      background-color: transparent !important;
    }
  }
  
  // 自定义节点类型标签颜色
  :deep(.el-tag.custom-ss) {
    background-color: #20B2AA !important;
    border-color: #20B2AA !important;
    color: white !important;
  }
  
  :deep(.el-tag.custom-vmess) {
    background-color: rgb(203, 49, 128) !important;
    border-color: rgb(203, 49, 128) !important;
    color: white !important;
  }
  
  :deep(.el-tag.custom-trojan) {
    background-color: rgb(234, 184, 84) !important;
    border-color: rgb(234, 184, 84) !important;
    color: white !important;
  }
  
  :deep(.el-switch.is-checked) {
    .el-switch__core {
      background-color: #0665d0;
      border-color: #0665d0;
    }
  }
  
  :deep(.el-switch:not(.is-checked)) {
    .el-switch__label {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .node-list {
    padding: 10px;
    
    .node-card {
      .card-header {
        flex-direction: column;
        gap: 12px;
        
        .header-left {
          width: 100%;
          
          .el-input {
            width: 100% !important;
            margin-left: 0 !important;
          }
        }
      }
      
      .node-table {
        .node-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        
        .permission-groups {
          flex-direction: column;
        }
      }
    }
  }
}
</style>
