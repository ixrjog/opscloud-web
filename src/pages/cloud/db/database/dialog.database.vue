<template>
  <el-dialog :title="form.title"
             :visible.sync="form.visible">
    <el-form :model="database">
      <el-form-item label="名称" :label-width="form.labelWidth">
        <el-input v-model="database.dbName" placeholder="请输入内容" readonly></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="database">
      <el-form-item label="环境" :label-width="form.labelWidth">
        <el-select v-model="database.envType" filterable clearable
                   remote reserve-keyword
                   :loading="loading">
          <el-option
            v-for="item in database.envTypeOptions"
            :key="item.envType"
            :label="item.envName"
            :value="item.envType">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="database">
      <el-form-item label="描述" :label-width="form.labelWidth">
        <el-input v-model="database.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="form.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="saveItem">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { updateCloudDBDatabase } from '@api/cloud/cloud.db.database.js'

  export default {
    data () {
      return {
        loading: false
      }
    },
    name: 'dialog-database',
    props: {
      form: {},
      database: {
        id: '',
        dbName: '',
        envType: '',
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
          var requestBody = {}
          requestBody = Object.assign({}, this.database)
          delete requestBody.env
          updateCloudDBDatabase(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.form.visible = false
              this.$emit('closeDatabaseDialog')
            })
        }, 600)
      }
    }
  }
</script>
