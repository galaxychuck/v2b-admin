<template>
  <div class="coupon-list">
    <el-card>
      <template #header>
        <span>优惠券管理</span>
      </template>
      
      <div class="development-notice">
        <el-alert
          title="开发中"
          description="优惠券管理功能正在开发中，敬请期待..."
          type="info"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CouponList'
}
</script>

<style lang="scss" scoped>
.coupon-list {
  .development-notice {
    margin: 20px 0;
  }
}
</style>
