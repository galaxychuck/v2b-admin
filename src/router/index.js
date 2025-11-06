import { createRouter, createWebHashHistory } from 'vue-router'
import { useStore } from 'vuex'

// 懒加载组件
const Login = () => import('@/views/auth/Login.vue')
const Layout = () => import('@/views/layout/Layout.vue')
const Dashboard = () => import('@/views/dashboard/Dashboard.vue')
const UserList = () => import('@/views/users/UserList.vue')
const UserDetail = () => import('@/views/users/UserDetail.vue')
const OrderList = () => import('@/views/orders/OrderList.vue')
const OrderDetail = () => import('@/views/orders/OrderDetail.vue')
const ServerList = () => import('@/views/servers/ServerList.vue')
const ServerDetail = () => import('@/views/servers/ServerDetail.vue')
const TicketList = () => import('@/views/tickets/TicketList.vue')
const TicketDetail = () => import('@/views/tickets/TicketDetail.vue')
const Statistics = () => import('@/views/statistics/Statistics.vue')
const Settings = () => import('@/views/settings/Settings.vue')
const NotFound = () => import('@/views/errors/NotFound.vue')

// 新增组件
const SystemConfig = () => import('@/views/settings/SystemConfig.vue')
const PaymentConfig = () => import('@/views/settings/PaymentConfig.vue')
const NodeList = () => import('@/views/servers/NodeList.vue')
const PermissionGroups = () => import('@/views/servers/PermissionGroups.vue')
const Routes = () => import('@/views/servers/Routes.vue')
const SubscriptionList = () => import('@/views/finance/SubscriptionList.vue')
const CouponList = () => import('@/views/finance/CouponList.vue')
const AnnouncementList = () => import('@/views/users/AnnouncementList.vue')
const KnowledgeList = () => import('@/views/users/KnowledgeList.vue')
const QueueMonitor = () => import('@/views/metrics/QueueMonitor.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '管理员登录',
      requiresAuth: false
    }
  },

  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表盘',
          icon: 'DataBoard'
        }
      },
      
      // 设置相关路由
      {
        path: 'system-config',
        name: 'SystemConfig',
        component: SystemConfig,
        meta: {
          title: '系统配置',
          icon: 'Operation'
        }
      },
      {
        path: 'payment-config',
        name: 'PaymentConfig',
        component: PaymentConfig,
        meta: {
          title: '支付配置',
          icon: 'CreditCard'
        }
      },

      
      // 服务器相关路由
      {
        path: 'nodes',
        name: 'NodeList',
        component: NodeList,
        meta: {
          title: '节点管理',
          icon: 'Grid'
        }
      },
      {
        path: 'permission-groups',
        name: 'PermissionGroups',
        component: PermissionGroups,
        meta: {
          title: '权限组管理',
          icon: 'Tools'
        }
      },
      {
        path: 'routes',
        name: 'Routes',
        component: Routes,
        meta: {
          title: '路由管理',
          icon: 'RefreshRight'
        }
      },
      
      // 财务相关路由
      {
        path: 'subscriptions',
        name: 'SubscriptionList',
        component: SubscriptionList,
        meta: {
          title: '订阅管理',
          icon: 'ShoppingBag'
        }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: OrderList,
        meta: {
          title: '订单管理',
          icon: 'List'
        }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: OrderDetail,
        meta: {
          title: '订单详情',
          hidden: true
        }
      },
      {
        path: 'coupons',
        name: 'CouponList',
        component: CouponList,
        meta: {
          title: '优惠券管理',
          icon: 'Present'
        }
      },
      
      // 用户相关路由
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户管理',
          icon: 'Avatar'
        }
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: UserDetail,
        meta: {
          title: '用户详情',
          hidden: true
        }
      },
      {
        path: 'announcements',
        name: 'AnnouncementList',
        component: AnnouncementList,
        meta: {
          title: '公告管理',
          icon: 'ChatDotRound'
        }
      },
      {
        path: 'tickets',
        name: 'TicketList',
        component: TicketList,
        meta: {
          title: '工单管理',
          icon: 'Lifebuoy'
        }
      },
      {
        path: 'tickets/:id',
        name: 'TicketDetail',
        component: TicketDetail,
        meta: {
          title: '工单详情',
          hidden: true
        }
      },
      {
        path: 'knowledge',
        name: 'KnowledgeList',
        component: KnowledgeList,
        meta: {
          title: '知识库管理',
          icon: 'Lightbulb'
        }
      },
      
      // 指标相关路由
      {
        path: 'queue-monitor',
        name: 'QueueMonitor',
        component: QueueMonitor,
        meta: {
          title: '队列监控',
          icon: 'Histogram'
        }
      },
      
      // 保留原有路由作为兼容
      {
        path: 'servers',
        name: 'ServerList',
        component: ServerList,
        meta: {
          title: '服务器管理',
          icon: 'Server'
        }
      },
      {
        path: 'servers/:id',
        name: 'ServerDetail',
        component: ServerDetail,
        meta: {
          title: '服务器详情',
          hidden: true
        }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: Statistics,
        meta: {
          title: '数据统计',
          icon: 'DataAnalysis'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: '系统设置',
          icon: 'Setting'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const store = useStore()
  const authData = localStorage.getItem('admin_auth_data')
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - V2Board Admin` : 'V2Board Admin'
  
  if (to.meta.requiresAuth !== false) {
    if (!authData) {
      next('/login')
      return
    }
  }
  
  if (to.path === '/login' && authData) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
