<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="clearfix">
      <span>个人信息</span>
      <el-button style="float: right; padding: 3px 0" type="text" @click="editItem()">修改基本信息</el-button>
    </div>
    <el-form :model="userDetail" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="userDetail.username" readonly></el-input>
      </el-form-item>
      <el-form-item label="显示名">
        <el-input v-model="userDetail.displayName" readonly></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="userDetail.name" readonly></el-input>
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="userDetail.phone" readonly></el-input>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userDetail.email" readonly></el-input>
      </el-form-item>
      <el-form-item label="微信">
        <el-input v-model="userDetail.wechat" readonly></el-input>
      </el-form-item>
      <el-form-item label="留言">
        <el-input v-model="userDetail.comment" readonly></el-input>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  props: ['userDetail'],
  name: 'UserDetailCard'
}
</script>

<style scoped>

</style>
