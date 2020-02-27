<template>
  <el-dialog :title="form.title" :visible.sync="form.visible" :before-close="closeDialog">
    <el-form :model="form.data">
      <el-form-item label="id" :label-width="form.labelWidth">
        <el-input v-model="form.data.tokenId" placeholder="自动生成无需输入" readonly></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="form.data">
      <el-form-item label="api-token" :label-width="form.labelWidth">
        <el-input v-model="form.data.token" clearable placeholder="自动生成无需输入" readonly>
        </el-input>
      </el-form-item>
    </el-form>
    <el-form :model="form.data">
      <el-form-item label="过期时间" :label-width="form.labelWidth">
        <el-date-picker
          v-model="form.data.expiredTime" value-format="yyyy-MM-dd HH:mm:ss"
          align="right"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions">
        </el-date-picker>
        <!--        <el-input v-model="form.data.expiredTime" placeholder="请输入内容"></el-input>-->
      </el-form-item>
    </el-form>
    <el-form :model="form.data">
      <el-form-item label="描述" :label-width="form.labelWidth">
        <el-input v-model="form.data.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
      <el-button type="primary" @click="saveItem" v-show="form.data.tokenId == null || form.data.tokenId ==''">申请</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { applyApiToken } from '@api/user/user.js'

  export default {
    data () {
      return {
        pickerOptions: {
          disabledDate (time) {
            return false
          },
          shortcuts: [{
            text: '30天',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 30)
              picker.$emit('pick', date)
            }
          }, {
            text: '90天',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 90)
              picker.$emit('pick', date)
            }
          }, {
            text: '180天',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 180)
              picker.$emit('pick', date)
            }
          },
            {
              text: '1年',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 365)
                picker.$emit('pick', date)
              }
            },
            {
              text: '2年',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 2)
                picker.$emit('pick', date)
              }
            },
            {
              text: '3年',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 3)
                picker.$emit('pick', date)
              }
            }]
        }
      }
    },
    name: 'dialog-token',
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
          applyApiToken(this.form.data)
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
