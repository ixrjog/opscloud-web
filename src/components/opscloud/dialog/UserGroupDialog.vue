<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle" :visible.sync="formStatus.visible">
    <el-form :model="formData">
      <el-form-item label="用户名" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.name" placeholder="请输入内容" :disabled="!formStatus.operationType"></el-input>
      </el-form-item>
    </el-form>

    <el-form :model="formData">
      <el-form-item label="描述" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>

  // API
  import { updateUserGroup, addUserGroup } from '@api/user/user.group.js'

  export default {
    data () {
      return {
      }
    },
    name: 'user-group-dialog',
    props: ['formStatus', 'formData'],
    mounted () {
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = Object.assign({}, this.formData)
          if (this.formStatus.operationType) {
            addUserGroup(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeUserGroupDialog')
              })
          } else {
            updateUserGroup(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeUserGroupDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
