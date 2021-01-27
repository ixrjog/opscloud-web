<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="已离职" name="retired">
        <user-retired-table></user-retired-table>
      </el-tab-pane>
      <el-tab-pane label="待离职" name="toBeRetired">
        <user-to-be-retired-table></user-to-be-retired-table>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>
import UserToBeRetiredTable from '@/components/opscloud/user/UserToBeRetiredTable'
import UserRetiredTable from '@/components/opscloud/user/UserRetiredTable'

export default {
  data () {
    return {
      activeName: 'retired',
      title: '用户离职管理'
    }
  },
  mounted () {
  },
  components: {
    UserToBeRetiredTable,
    UserRetiredTable
  }
}
</script>

<style scoped>
</style>
