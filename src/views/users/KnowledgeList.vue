<template>
  <div class="knowledge-list">
    <el-card>
      <template #header>
        <span>知识库管理</span>
      </template>
      
      <div class="development-notice">
        <el-alert
          title="开发中"
          description="知识库管理功能正在开发中，敬请期待..."
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
  name: 'KnowledgeList'
}
</script>

<style lang="scss" scoped>
.knowledge-list {
  .development-notice {
    margin: 20px 0;
  }
}
</style>
