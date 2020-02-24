<template>
  <el-dialog :title="form.operationType ? form.addTitle : form.updateTitle" :visible.sync="form.visible">
    <el-form :model="group">
      <el-form-item label="用户名" :label-width="form.labelWidth">
        <el-input v-model="group.name" placeholder="请输入内容" :disabled="!form.operationType"></el-input>
      </el-form-item>
    </el-form>

    <el-form :model="group">
      <el-form-item label="描述" :label-width="form.labelWidth">
        <el-input v-model="group.comment" placeholder="请输入内容"></el-input>
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
  import { updateUserGroup, addUserGroup } from '@api/user/user.group.js'

  export default {
    name: 'dialog-user-group',
    props: {
      form: {},
      group: {
        id: '',
        name: '',
        grpType: 0,
        workflow: 0,
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
            addUserGroup(requestBody)
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
            updateUserGroup(requestBody)
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
