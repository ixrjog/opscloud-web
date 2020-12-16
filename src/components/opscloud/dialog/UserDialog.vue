<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible" :before-close="closeDialog">
    <el-form :model="user">
      <el-form-item label="用户名" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model="user.username" placeholder="请输入内容" :disabled="!formStatus.operationType"></el-input>
      </el-form-item>
      <el-form-item label="密码" :label-width="formStatus.labelWidth" :required="formStatus.operationType">
        <el-input v-model="password" clearable placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-key" @click="getUserRandomPassword"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="显示名" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model="user.displayName" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="姓名" :label-width="formStatus.labelWidth">
        <el-input v-model="user.name" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="部门" :label-width="formStatus.labelWidth">
        <el-cascader v-model="user.deptIds" :options="deptOptions"
                     :props="{ multiple: true, checkStrictly: true, expandTrigger: 'hover'}"
                     @change="handleChange" class="cascader" clearable></el-cascader>
        <el-button type="primary" icon="el-icon-refresh" @click="deptTreeRefresh" size="mini" plain
                   style="margin-left: 10px"></el-button>
      </el-form-item>
      <el-form-item label="电话" :label-width="formStatus.labelWidth">
        <el-input v-model="user.phone" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model="user.email" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="微信" :label-width="formStatus.labelWidth">
        <el-input v-model="user.wechat" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="留言" :label-width="formStatus.labelWidth">
        <el-input v-model="user.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="角色" :label-width="formStatus.labelWidth" v-if="formStatus.operationType">
        <el-checkbox v-model="user.isRD">研发工程师(授权dev角色)</el-checkbox>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { getRandomPassword, updateUser, createUser } from '@api/user/user.js'
import { queryDepartmentTreeV2, refreshDepartmentTreeV2 } from '@api/org/org'

export default {
  data () {
    return {
      user: '',
      password: '',
      rootDeptId: 0,
      deptOptions: []
    }
  },
  name: 'UserDialog',
  props: ['formStatus'],
  mounted () {
  },
  methods: {
    closeDialog () {
      this.password = ''
      this.formStatus.visible = false
      this.$emit('closeDialog')
    },
    initData (user) {
      this.user = user
      this.user.deptIds = []
      this.getDepartmentTree()
    },
    getUserRandomPassword () {
      getRandomPassword()
        .then(res => {
          this.password = res.body
        })
    },
    getDepartmentTree () {
      queryDepartmentTreeV2()
        .then(res => {
          this.deptOptions = res.body
        })
    },
    deptTreeRefresh () {
      this.$message.info('数据刷新中')
      refreshDepartmentTreeV2()
        .then(res => {
          this.deptOptions = res.body
          this.$message.success('数据刷新完成')
        })
    },
    handleChange (value) {
      if (JSON.stringify(value) === '[]') {
        this.user.deptIds = []
      }
      this.user.deptIdList = []
      value.map(deptIds => {
        this.user.deptIdList.push(deptIds[(deptIds.length - 1)])
      })
    },
    saveInfo () {
      setTimeout(() => {
        let requestBody = Object.assign({}, this.user)
        requestBody.password = this.password
        if (this.formStatus.operationType) {
          createUser(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.closeDialog()
            })
        } else {
          updateUser(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.closeDialog()
            })
        }
      }, 600)
    }
  }
}
</script>

<style scoped>
.cascader {
  display: inline-block;
  max-width: 300px;
  width: 300px;
}
</style>
