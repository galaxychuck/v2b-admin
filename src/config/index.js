/**
 * V2Board Admin 配置文件
 * 参考前端配置但针对管理后台进行适配
 */

export const config = {
    // ==================== API配置 ====================
    API_CONFIG: {
        // API URL获取方式: 'static'=使用静态URL, 'auto'=自动从当前域名获取
        urlMode: 'static',

            // 静态URL模式下的基础URL (urlMode = 'static'时使用)
    // 支持字符串形式(单个API地址)或数组形式(多个备选API地址)
    // 多个地址时，会按顺序检测可用性，并使用第一个可用的地址
    staticBaseUrl: [
      'https://example.com/api/v1'
    ],

        // 自动获取模式配置 (urlMode = 'auto'时使用)
        autoConfig: {
            // 是否使用相同协议 (http/https)
            useSameProtocol: true,

            // 是否拼接API路径
            appendApiPath: true,

            // API路径
            apiPath: '/api/v1'
        }
    },

    // ==================== 网站基础配置 ====================
        SITE_CONFIG: {
      siteName: 'V2B',
      siteDescription: 'V2B',
      // copyright会自动使用当前年份
      copyright: `© ${new Date().getFullYear()} V2B Admin. All Rights Reserved.`,

        // 是否显示标题中的网站Logo (true=显示, false=隐藏)
        showLogo: true,
    },

    // ==================== 默认配置 ====================
    DEFAULT_CONFIG: {
        // 默认语言 ('zh-CN' 或 'en-US')
        defaultLanguage: 'zh-CN',

        // 默认主题 ('light' 或 'dark')
        defaultTheme: 'light',

        // 主题色 (16进制颜色值)
        primaryColor: '#409EFF',
    },

    // ==================== 认证配置 ====================
    AUTH_CONFIG: {
        // 认证数据存储键名
        authDataKey: 'admin_auth_data',
        
        // Token存储键名
        tokenKey: 'admin_token',
        
        // 用户信息存储键名
        userInfoKey: 'admin_user_info',
        
        // 认证数据过期时间（小时）
        authExpireHours: 24,
        
        // 是否自动刷新认证数据
        autoRefreshAuth: true,
        
        // 自动刷新间隔（分钟）
        autoRefreshInterval: 30,
    },

    // ==================== 管理后台功能配置 ====================
    ADMIN_CONFIG: {
        // 是否启用实时数据更新
        enableRealTimeUpdate: true,
        
        // 实时更新间隔（秒）
        realTimeUpdateInterval: 30,
        
        // 是否启用数据导出功能
        enableDataExport: true,
        
        // 是否启用批量操作功能
        enableBatchOperations: true,
        
        // 每页默认显示数量
        defaultPageSize: 20,
        
        // 可选的每页显示数量
        pageSizeOptions: [10, 20, 50, 100],
        
        // 是否启用高级搜索
        enableAdvancedSearch: true,
        
        // 是否启用数据缓存
        enableDataCache: true,
        
        // 缓存过期时间（分钟）
        cacheExpireMinutes: 5,
    },

    // ==================== 用户管理配置 ====================
    USER_CONFIG: {
        // 是否启用用户批量操作
        enableBatchOperations: true,
        
        // 是否启用用户导入功能
        enableUserImport: false,
        
        // 是否启用用户导出功能
        enableUserExport: true,
        
        // 用户状态选项
        userStatusOptions: [
            { label: '正常', value: 1 },
            { label: '禁用', value: 0 }
        ],
        
        // 用户等级选项
        userLevelOptions: [
            { label: '普通用户', value: 0 },
            { label: 'VIP用户', value: 1 },
            { label: 'SVIP用户', value: 2 }
        ],
    },

    // ==================== 订单管理配置 ====================
    ORDER_CONFIG: {
        // 是否启用订单批量操作
        enableBatchOperations: true,
        
        // 订单状态选项
        orderStatusOptions: [
            { label: '待支付', value: 0 },
            { label: '已支付', value: 1 },
            { label: '已取消', value: 2 },
            { label: '已完成', value: 3 }
        ],
        
        // 支付方式选项
        paymentMethodOptions: [
            { label: '支付宝', value: 'alipay' },
            { label: '微信支付', value: 'wechat' },
            { label: 'PayPal', value: 'paypal' },
            { label: '银行卡', value: 'bank' }
        ],
    },

    // ==================== 工单管理配置 ====================
    TICKET_CONFIG: {
        // 是否启用工单批量操作
        enableBatchOperations: true,
        
        // 工单状态选项
        ticketStatusOptions: [
            { label: '待处理', value: 0 },
            { label: '处理中', value: 1 },
            { label: '已完成', value: 2 },
            { label: '已关闭', value: 3 }
        ],
        
        // 工单优先级选项
        ticketPriorityOptions: [
            { label: '低', value: 3 },
            { label: '中', value: 2 },
            { label: '高', value: 1 }
        ],
        
        // 是否启用工单图片上传
        enableImageUpload: true,
        
        // 图片上传大小限制（MB）
        imageUploadSizeLimit: 5,
        
        // 允许的图片格式
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },

    // ==================== 服务器管理配置 ====================
    SERVER_CONFIG: {
        // 服务器类型选项
        serverTypeOptions: [
            { label: 'Vmess', value: 'vmess' },
            { label: 'Trojan', value: 'trojan' },
            { label: 'Shadowsocks', value: 'shadowsocks' }
        ],
        
        // 服务器状态选项
        serverStatusOptions: [
            { label: '在线', value: 1 },
            { label: '离线', value: 0 }
        ],
        
        // 是否启用服务器监控
        enableServerMonitoring: true,
        
        // 监控数据保留天数
        monitoringDataRetentionDays: 30,
    },

    // ==================== 数据统计配置 ====================
    STATISTICS_CONFIG: {
        // 是否启用实时统计
        enableRealTimeStats: true,
        
        // 统计图表默认时间范围（天）
        defaultTimeRange: 30,
        
        // 可选的统计时间范围
        timeRangeOptions: [
            { label: '最近7天', value: 7 },
            { label: '最近30天', value: 30 },
            { label: '最近90天', value: 90 },
            { label: '最近一年', value: 365 }
        ],
        
        // 是否启用数据导出
        enableDataExport: true,
        
        // 图表主题色
        chartColors: [
            '#409EFF',
            '#67C23A',
            '#E6A23C',
            '#F56C6C',
            '#909399'
        ],
    },

    // ==================== 系统设置配置 ====================
    SETTINGS_CONFIG: {
        // 是否启用配置备份
        enableConfigBackup: true,
        
        // 是否启用系统日志
        enableSystemLog: true,
        
        // 日志保留天数
        logRetentionDays: 90,
        
        // 是否启用邮件通知
        enableEmailNotification: true,
        
        // 是否启用Telegram通知
        enableTelegramNotification: false,
    },

    // ==================== 安全配置 ====================
    SECURITY_CONFIG: {
        // 是否启用前端域名验证
        enableFrontendDomainCheck: false,
        
        // 是否启用操作日志
        enableOperationLog: true,
        
        // 是否启用登录日志
        enableLoginLog: true,
        
        // 是否启用IP白名单
        enableIpWhitelist: false,
        
        // 是否启用双因素认证
        enableTwoFactorAuth: false,
    },

    // ==================== 授权的前端域名列表 ====================
    AUTHORIZED_DOMAINS: [
        "example.com",
        "example1.com",
        "example2.com",
        "localhost:8081",
        "127.0.0.1:8081"
    ],

    // ==================== 自定义请求标头配置 ====================
    CUSTOM_HEADERS: {
        // 是否启用自定义标头
        enabled: false,
        
        // 自定义标头列表
        headers: {
            // "X-Admin-Token": "your-admin-token"
        }
    },

    // ==================== 开发环境配置 ====================
    DEVELOPMENT_CONFIG: {
        // 是否启用调试模式
        enableDebugMode: process.env.NODE_ENV === 'development',
        
        // 是否显示API请求日志
        showApiLogs: process.env.NODE_ENV === 'development',
        
        // 是否启用Mock数据
        enableMockData: false,
        
        // Mock数据延迟（毫秒）
        mockDataDelay: 500,
    }
};

// 将配置挂载到全局对象
window.ADMIN_CONFIG = config;

export default config;
