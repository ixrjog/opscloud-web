<template>
  <el-card class="box-card" shadow="never" style="margin-top: 10px"
           v-if="JSON.stringify(userDetail.userGroups) !== '[]'">
    <div slot="header" class="clearfix">用户组<i class="header-icon el-icon-info"></i>(角色授权)</div>
    <div class="tag-group">
      <span v-for="item in userDetail.userGroups" :key="item.id">
        <template>
          <el-tooltip class="item" effect="light" :content="item.comment || '没有填写'" placement="bottom">
            <el-tag style="margin-left: 5px">{{ item.name }}</el-tag>
          </el-tooltip>
        </template>
      </span>
    </div>
  </el-card>
</template>

<script>
export default {
  props: ['userDetail'],
  name: 'UserDetailUserGroupCard'
}
</script>

<style scoped>

</style>
