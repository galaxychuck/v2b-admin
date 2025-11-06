// 移动端工具函数
import { ref, onMounted, onUnmounted } from 'vue'

// 断点定义
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  SMALL_MOBILE: 480
}

// 移动端检测Hook
export function useMobileDetection() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isSmallMobile = ref(false)
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  const checkScreenSize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    screenWidth.value = width
    screenHeight.value = height
    
    isMobile.value = width <= BREAKPOINTS.MOBILE
    isTablet.value = width <= BREAKPOINTS.TABLET && width > BREAKPOINTS.MOBILE
    isSmallMobile.value = width <= BREAKPOINTS.SMALL_MOBILE
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    window.addEventListener('orientationchange', checkScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
    window.removeEventListener('orientationchange', checkScreenSize)
  })

  return {
    isMobile,
    isTablet,
    isSmallMobile,
    screenWidth,
    screenHeight,
    checkScreenSize
  }
}

// 设备类型检测
export function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/ipad/i.test(userAgent)) {
      return 'tablet'
    }
    return 'mobile'
  }
  
  return 'desktop'
}

// 触摸设备检测
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 移动端优化配置
export const MOBILE_CONFIG = {
  // 表格配置
  table: {
    mobile: {
      cellPadding: '8px 4px',
      fontSize: '12px',
      headerFontSize: '12px'
    },
    smallMobile: {
      cellPadding: '6px 2px',
      fontSize: '11px',
      headerFontSize: '11px'
    }
  },
  
  // 表单配置
  form: {
    mobile: {
      itemMargin: '12px 0',
      inputHeight: '44px',
      buttonHeight: '44px'
    }
  },
  
  // 对话框配置
  dialog: {
    mobile: {
      width: '95%',
      margin: '5vh auto'
    },
    smallMobile: {
      width: '98%',
      margin: '2vh auto'
    }
  },
  
  // 按钮配置
  button: {
    mobile: {
      minHeight: '44px',
      padding: '12px 16px',
      fontSize: '16px'
    }
  }
}

// 响应式类名生成器
export function getResponsiveClasses(baseClass, mobileClass = '', tabletClass = '') {
  return {
    [baseClass]: true,
    [`${baseClass}--mobile`]: mobileClass,
    [`${baseClass}--tablet`]: tabletClass
  }
}

// 移动端样式应用器
export function applyMobileStyles(element, config = {}) {
  if (!element) return
  
  const { isMobile, isSmallMobile } = config
  
  if (isMobile) {
    element.classList.add('mobile-optimized')
    
    if (isSmallMobile) {
      element.classList.add('mobile-optimized--small')
    }
  }
}

// 移动端事件优化
export function optimizeMobileEvents(element, options = {}) {
  if (!element) return
  
  const { 
    preventZoom = true, 
    preventScroll = false,
    touchAction = 'manipulation'
  } = options
  
  if (preventZoom) {
    element.style.touchAction = touchAction
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }, { passive: false })
  }
  
  if (preventScroll) {
    element.addEventListener('touchmove', (e) => {
      e.preventDefault()
    }, { passive: false })
  }
}

// 移动端性能优化
export function optimizeMobilePerformance() {
  // 减少重绘和回流
  const style = document.createElement('style')
  style.textContent = `
    .mobile-optimized * {
      will-change: auto;
      transform: translateZ(0);
    }
    
    .mobile-optimized .el-table {
      contain: layout style paint;
    }
  `
  document.head.appendChild(style)
}

// 移动端存储优化
export function optimizeMobileStorage() {
  // 清理不必要的localStorage数据
  const keysToKeep = ['admin_auth_data', 'user_auth_data', 'theme', 'language']
  const allKeys = Object.keys(localStorage)
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      try {
        const value = localStorage.getItem(key)
        if (value && value.length > 1024) { // 大于1KB的数据
          localStorage.removeItem(key)
        }
      } catch (e) {
        // 忽略错误
      }
    }
  })
}

// 导出默认配置
export default {
  BREAKPOINTS,
  useMobileDetection,
  getDeviceType,
  isTouchDevice,
  MOBILE_CONFIG,
  getResponsiveClasses,
  applyMobileStyles,
  optimizeMobileEvents,
  optimizeMobilePerformance,
  optimizeMobileStorage
}
