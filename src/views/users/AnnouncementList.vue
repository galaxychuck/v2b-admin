<template>
  <div class="announcement-list">
    <el-card>
      <template #header>
        <span>公告管理</span>
      </template>
      
      <div class="development-notice">
        <el-alert
          title="开发中"
          description="公告管理功能正在开发中，敬请期待..."
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
  name: 'AnnouncementList'
}
</script>

<style lang="scss" scoped>
.announcement-list {
  .development-notice {
    margin: 20px 0;
  }
}
</style>
