<template>
  <el-card class="box-card" shadow="never" style="margin-top: 10px"
           v-if="JSON.stringify(userDetail.serverGroups) !== '[]'">
    <div slot="header" class="clearfix">服务器组<i class="header-icon el-icon-info"></i>(深色标签拥有管理员权限)</div>
    <div class="tag-group">
      <span v-for="item in userDetail.serverGroups" :key="item.id">
        <el-tooltip class="item" effect="light" :content="item.comment || '没有填写'" placement="bottom">
          <el-tag style="margin-left: 5px" :type=" item.isAdmin ? 'danger': '' ">{{ item.name }}</el-tag>
        </el-tooltip>
      </span>
    </div>
  </el-card>
</template>

<script>
export default {
  props: ['userDetail'],
  name: 'UserDetailServerGroupCard'
}
</script>

<style scoped>

</style>
