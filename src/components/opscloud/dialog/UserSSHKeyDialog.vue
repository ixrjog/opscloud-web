<template>
  <el-dialog :title="formStatus.title" :visible.sync="formStatus.visible" :before-close="closeDialog">
    <el-form :model="formData">
      <el-form-item label="标题" :label-width="formStatus.labelWidth">
        <el-input v-show="keyTitle == ''" v-model="formData.title" placeholder="自动识别" readonly></el-input>
        <el-input v-show="keyTitle != ''" v-model="keyTitle" placeholder="自动识别" readonly></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="ssh公钥" :label-width="formStatus.labelWidth">
        <el-input v-show="keyCredential == ''" v-model="formData.credential" type="textarea"
                  :autosize="{ minRows: 4, maxRows: 16}" clearable placeholder="请输入内容"></el-input>
        <el-input v-show="keyCredential != ''" v-model="keyCredential" type="textarea"
                  :autosize="{ minRows: 4, maxRows: 16}" readonly></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
      <el-button type="primary" v-show="keyCredential == ''" @click="saveInfo">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { saveUserCredential } from '@api/user/user.js'

  export default {
    data () {
      return {
        keyTitle: '',
        keyCredential: ''
      }
    },
    name: 'user-ssh-key-dialog',
    props: ['formStatus', 'formData'],
    mixins: [],
    mounted () {
    },
    mutation () {
    },
    methods: {
      closeDialog () {
        this.keyTitle = ''
        this.keyCredential = ''
        this.formStatus.visible = false
        this.$emit('closeUserSSHKeyDialog')
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveInfo () {
        setTimeout(() => {
          saveUserCredential(this.formData)
            .then(res => {
              // 返回数据
              if (res.success) {
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.keyTitle = res.body.title
                this.keyCredential = res.body.credential
              } else {
                this.$message.error('错误:' + res.msg)
              }
            })
        }, 30)
      }
    }
  }
</script>
