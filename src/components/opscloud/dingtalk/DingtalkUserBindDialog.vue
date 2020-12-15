<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="35%">
    <el-form :model="bindData" label-width="120px" class="demo-ruleForm"
             label-position="left">
      <el-form-item label="员工名称">
        <el-input v-model.trim="bindData.displayName" readonly></el-input>
      </el-form-item>
      <el-form-item label="oc用户" required>
        <el-select v-model="bindData.ocUserId" filterable remote reserve-keyword placeholder="搜索用户"
                   :remote-method="getUser" @change="handlerChange">
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.displayName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="handlerSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { fuzzyQueryUserPage } from '@api/user/user'
import { bindOcUser } from '@api/dingtalk/dintalk.user'

const bindData = {
  displayName: '',
  accountId: '',
  ocUserId: ''
}

export default {
  data () {
    return {
      title: '绑定OC用户',
      bindData: bindData,
      userOptions: []
    }
  },
  name: 'DingtalkUserBindDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {},
  filters: {},
  methods: {
    initData (user) {
      this.bindData = Object.assign({}, bindData)
      this.bindData.accountId = user.id
      this.bindData.displayName = user.displayName
    },
    getUser (queryName) {
      let requestBody = {
        'queryName': queryName,
        'extend': 0,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
        })
    },
    handlerChange (userId) {
      this.bindData.ocUserId = userId
    },
    handlerSave () {
      if (this.bindData.ocUserId === '') {
        this.$message.warning('请选择需要绑定的oc用户')
        return
      }
      bindOcUser(this.bindData)
        .then(res => {
          this.$message.success('绑定成功')
          this.handlerCloseDialog()
        })
    },
    handlerCloseDialog () {
      this.formStatus.visible = false
      this.$emit('closeDialog')
    }
  }
}
</script>

<style scoped>
</style>
