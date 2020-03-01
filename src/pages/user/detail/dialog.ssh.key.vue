<template>
  <el-dialog :title="form.title" :visible.sync="form.visible" :before-close="closeDialog">
    <el-form :model="form.data">
      <el-form-item label="标题" :label-width="form.labelWidth">
        <el-input v-model="form.data.title" placeholder="自动识别" readonly></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="form.data">
      <el-form-item label="ssh公钥" :label-width="form.labelWidth">
        <el-input v-model="form.data.credential" type="textarea" :autosize="{ minRows: 4, maxRows: 16}" clearable placeholder="请输入内容">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
      <el-button type="primary" @click="saveItem">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { saveUserCredential } from '@api/user/user.js'

  export default {
    data () {
      return {
      }
    },
    name: 'dialog-ssh-key',
    props: {
      form: {}
    },
    mixins: [],
    mounted () {
    },
    mutation () {
    },
    methods: {
      closeDialog () {
        this.form.data = {}
        this.form.visible = false
        this.$emit('closeDialog')
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveItem () {
        setTimeout(() => {
          saveUserCredential(this.form.data)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.form.data = res.body
            })
        }, 30)
      }
    }
  }
</script>
