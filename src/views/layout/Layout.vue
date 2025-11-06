<template>
  <div class="app-wrapper">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !isHidden" 
      class="mobile-overlay"
      @click="hideSidebar"
    ></div>
    
    <div class="sidebar-container" :class="{ collapse: isCollapse, hidden: isHidden, mobile: isMobile }">
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        background-color="#ffffff"
        text-color="#555d65"
        active-text-color="#0665d0"
        router
      >
        <!-- 站点名称 -->
        <div class="site-name">
          <span>示例站点</span>
        </div>
        
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <!-- 设置分组标题 -->
        <div class="menu-group-title">设置</div>
        
        <el-menu-item index="/system-config">
          <el-icon><Operation /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
        
        <el-menu-item index="/payment-config">
          <el-icon><CreditCard /></el-icon>
          <span>支付配置</span>
        </el-menu-item>

        <!-- 服务器分组标题 -->
        <div class="menu-group-title">服务器</div>
        
        <el-menu-item index="/nodes">
          <el-icon><Grid /></el-icon>
          <span>节点管理</span>
        </el-menu-item>
        
        <el-menu-item index="/permission-groups">
          <el-icon><Tools /></el-icon>
          <span>权限组管理</span>
        </el-menu-item>
        
        <el-menu-item index="/routes">
          <el-icon><RefreshRight /></el-icon>
          <span>路由管理</span>
        </el-menu-item>
        
        <!-- 财务分组标题 -->
        <div class="menu-group-title">财务</div>
        
        <el-menu-item index="/subscriptions">
          <el-icon><ShoppingBag /></el-icon>
          <span>订阅管理</span>
        </el-menu-item>
        
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        
        <el-menu-item index="/coupons">
          <el-icon><Present /></el-icon>
          <span>优惠券管理</span>
        </el-menu-item>
        
        <!-- 用户分组标题 -->
        <div class="menu-group-title">用户</div>
        
        <el-menu-item index="/users">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/announcements">
          <el-icon><ChatDotRound /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        
        <el-menu-item index="/tickets">
          <el-icon><Message /></el-icon>
          <span>工单管理</span>
        </el-menu-item>
        
        <el-menu-item index="/knowledge">
          <el-icon><Document /></el-icon>
          <span>知识库管理</span>
        </el-menu-item>
        
        <!-- 指标分组标题 -->
        <div class="menu-group-title">指标</div>
        
        <el-menu-item index="/queue-monitor">
          <el-icon><Histogram /></el-icon>
          <span>队列监控</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <div class="main-container">
      <div class="navbar">
        <div class="left">
          <a-button type="text"
            @click="toggleSidebar"
            v-if="!isHidden && !isMobile"
            class="sidebar-btn"
          >
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <a-button type="text"
            @click="hideSidebar"
            v-if="!isHidden && !isMobile"
            class="sidebar-btn"
          >
            <el-icon><Close /></el-icon>
          </el-button>
          <a-button type="text"
            @click="showSidebar"
            v-if="isHidden"
            class="sidebar-btn mobile-menu-btn"
          >
            <el-icon><Menu /></el-icon>
          </el-button>
          <breadcrumb v-if="!isMobile" />
        </div>
        
        <div class="right">
          <el-dropdown trigger="click">
            <div class="avatar-wrapper">
              <el-avatar :size="isMobile ? 24 : 30" :src="userInfo.avatar" />
              <span class="username" v-if="!isMobile">{{ userInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div class="app-main" :class="{ mobile: isMobile }">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { 
  DataBoard, 
  User, 
  ShoppingCart, 
  Message, 
  DataAnalysis, 
  Setting,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton,
  Operation,
  CreditCard,
  Grid,
  Tools,
  RefreshRight,
  Money,
  ShoppingBag,
  List,
  Present,
  Avatar,
  ChatDotRound,
  Document,
  TrendCharts,
  Histogram,
  Close,
  Menu
} from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

export default {
  name: 'Layout',
  components: {
    DataBoard,
    User,
    ShoppingCart,
    Message,
    DataAnalysis,
    Setting,
    Fold,
    Expand,
    ArrowDown,
    SwitchButton,
    Operation,
    CreditCard,
    Grid,
    Tools,
    RefreshRight,
    Money,
    ShoppingBag,
    List,
    Present,
    Avatar,
    ChatDotRound,
    Document,
    TrendCharts,
    Histogram,
    Close,
    Menu,
    Breadcrumb
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const isCollapse = computed(() => store.state.app.sidebar.opened === false)
    const isHidden = computed(() => store.state.app.sidebar.hidden === true)
    const userInfo = computed(() => store.state.user.userInfo)
    
    // 移动端检测
    const isMobile = ref(false)
    
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      // 移动端自动隐藏侧边栏
      if (isMobile.value && !store.state.app.sidebar.hidden) {
        store.dispatch('app/hideSideBar')
      }
    }
    
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })
    
    const toggleSidebar = () => {
      store.dispatch('app/toggleSideBar')
    }
    
    const hideSidebar = () => {
      store.dispatch('app/hideSideBar')
    }
    
    const showSidebar = () => {
      store.dispatch('app/showSideBar')
    }
    
    const handleLogout = () => {
      store.dispatch('user/logout').then(() => {
        router.push('/login')
      })
    }
    
    return {
      isCollapse,
      isHidden,
      isMobile,
      userInfo,
      toggleSidebar,
      hideSidebar,
      showSidebar,
      handleLogout
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100vh;
  display: flex;
  position: relative;
  
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    cursor: pointer;
  }
  
  .sidebar-container {
    width: 250px;
    height: 100%;
    background: #fff;
    transition: all 0.28s;
    
    &.collapse {
      width: 64px;
    }
    
    &.hidden {
      width: 0;
      overflow: hidden;
    }
    
    &.mobile {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      
      &.hidden {
        transform: translateX(-100%);
      }
    }
    
    .el-menu {
      border-right: none;
      
      .el-sub-menu__title {
        color: #555d65;
        
        &:hover {
          background-color: #f5f7fa;
        }
      }
      
      .el-menu-item {
        color: #555d65;
        width: 202px;
        height: 36px;
        margin: 6px 16px;
        padding: 8px 10px;
        box-sizing: border-box;
        border-radius: 6px;
        transition: background-color 0.15s ease;
        
        &:hover {
          background-color: #e3f2fd;
        }
        
        &.is-active {
          background-color: #e3f2fd;
          color: #000;
        }
        
        .el-icon {
          color: rgba(6, 101, 208, 0.7);
        }
        
        &.is-active {
          .el-icon {
            color: #0665d0;
          }
        }
      }
      
      // 移动端菜单项优化
      &.mobile {
        .el-menu-item {
          width: 100%;
          margin: 4px 8px;
          height: 44px;
          
          .el-icon {
            font-size: 18px;
          }
          
          span {
            font-size: 16px;
          }
        }
        
        .menu-group-title {
          padding: 16px 16px 8px 16px;
          font-size: 14px;
        }
        
        .site-name {
          height: 60px;
          
          span {
            font-size: 20px;
          }
        }
      }
    }
    
    .site-name {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0556b3;
      border-bottom: 1px solid #3a4a5c;
      margin-bottom: 10px;
      
      span {
        font-size: 18px;
        font-weight: normal;
        color: #fff;
        letter-spacing: 1px;
      }
    }
    
    .menu-group-title {
      padding: 12px 20px 8px 20px;
      font-size: 12px;
      color: rgba(85, 93, 101, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e4e7ed;
      margin-bottom: 4px;
      user-select: none;
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .navbar {
      height: 50px;
      background: #0665d0;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      
      .left {
        display: flex;
        align-items: center;
        
        .sidebar-btn {
          color: #fff;
          font-size: 18px;
          padding: 8px;
          
          &.mobile-menu-btn {
            font-size: 20px;
            padding: 10px;
          }
        }
      }
      
      .right {
        .avatar-wrapper {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          .username {
            margin: 0 8px;
            font-size: 14px;
            color: #fff;
          }
        }
      }
      
      // 移动端navbar优化
      @media (max-width: 768px) {
        height: 60px;
        padding: 0 16px;
        
        .left {
          .sidebar-btn {
            margin-right: 12px;
          }
        }
        
        .right {
          .avatar-wrapper {
            .username {
              display: none;
            }
          }
        }
      }
    }
    
    .app-main {
      flex: 1;
      padding: 20px;
      background: #f0f2f5;
      overflow-y: auto;
      
      &.mobile {
        padding: 16px;
        margin-top: 0;
      }
      
      // 移动端主内容区域优化
      @media (max-width: 768px) {
        padding: 12px;
        
        &.mobile {
          padding: 8px;
        }
      }
      
      @media (max-width: 480px) {
        padding: 8px;
        
        &.mobile {
          padding: 4px;
        }
      }
    }
  }
  
  // 全局移动端响应式样式
  @media (max-width: 768px) {
    .app-wrapper {
      .sidebar-container {
        &.mobile {
          width: 280px;
          
          &.hidden {
            transform: translateX(-100%) !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        }
      }
      
      .main-container {
        width: 100% !important;
        margin-left: 0 !important;
      }
    }
  }
  
  @media (max-width: 480px) {
    .app-wrapper {
      .sidebar-container {
        &.mobile {
          width: 260px;
          
          &.hidden {
            transform: translateX(-100%) !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        }
      }
      
      .main-container {
        width: 100% !important;
        margin-left: 0 !important;
      }
      
      .navbar {
        .left {
          .sidebar-btn {
            font-size: 16px;
            padding: 8px;
          }
        }
      }
    }
  }
}
</style>
