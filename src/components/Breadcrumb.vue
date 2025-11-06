<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    const breadcrumbs = ref([])

    const getBreadcrumbs = () => {
      const matched = route.matched.filter(item => item.meta && item.meta.title)
      const result = []
      
      matched.forEach(item => {
        result.push({
          title: item.meta.title,
          path: item.path
        })
      })
      
      return result
    }

    watch(() => route.path, () => {
      breadcrumbs.value = getBreadcrumbs()
    }, { immediate: true })

    return {
      breadcrumbs
    }
  }
}
</script>
