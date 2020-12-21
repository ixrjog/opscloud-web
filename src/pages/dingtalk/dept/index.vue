<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="20">
        <el-col :span="24">
          <dingtalk-dept-tree></dingtalk-dept-tree>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
// Component
import DingtalkDeptTree from '@/components/opscloud/dingtalk/DingtalkDeptTree'

export default {
  data () {
    return {
      title: '部门管理'
    }
  },
  computed: {},
  mounted () {
  },
  components: {
    DingtalkDeptTree
  },
  filters: {},
  methods: {}
}
</script>

<style scoped>
</style>
