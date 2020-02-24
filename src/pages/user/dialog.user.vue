<template>
  <el-dialog :title="form.operationType ? form.addTitle : form.updateTitle" :visible.sync="form.visible">
    <el-form :model="form">
      <el-form-item label="用户名" :label-width="form.labelWidth">
        <el-input v-model="user.username" placeholder="请输入内容" :disabled="!form.operationType"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="密码" :label-width="form.labelWidth">
        <el-input v-model="user.password" clearable placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-key" @click="getUserRandomPassword"></el-button>
        </el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="显示名" :label-width="form.labelWidth">
        <el-input v-model="user.displayName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="姓名" :label-width="form.labelWidth">
        <el-input v-model="user.name" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="电话" :label-width="form.labelWidth">
        <el-input v-model="user.phone" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="邮箱" :label-width="form.labelWidth">
        <el-input v-model="user.email" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="微信" :label-width="form.labelWidth">
        <el-input v-model="user.wechat" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="user">
      <el-form-item label="留言" :label-width="form.labelWidth">
        <el-input v-model="user.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="form.visible = false">取消</el-button>
      <el-button type="primary" @click="saveItem">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { getRandomPassword, updateUser, addUser } from '@api/user/user.js'

  export default {
    name: 'dialog-user',
    props: {
      form: {
      },
      user: {
        id: '',
        username: '',
        name: '',
        password: '',
        displayName: '',
        email: '',
        wechat: '',
        phone: '',
        comment: ''
      }
    },
    mixins: [],
    mounted () {
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      getUserRandomPassword () {
        getRandomPassword()
          .then(res => {
            this.user.password = res.body
          })
      },
      saveItem () {
        setTimeout(() => {
          var requestBody = {
            'id': this.user.id,
            'name': this.user.name,
            'password': this.user.password,
            'displayName': this.user.displayName,
            'email': this.user.email,
            'wechat': this.user.wechat,
            'phone': this.user.phone,
            'comment': this.user.comment
          }
          if (this.form.operationType) {
            addUser(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.form.visible = false
                this.$emit('closeDialog')
              })
          } else {
            updateUser(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.form.visible = false
                this.$emit('closeDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
