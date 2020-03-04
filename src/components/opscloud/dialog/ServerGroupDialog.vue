<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="formData">
      <el-form-item label="名称" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.name" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="组类型" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.grpType" filterable clearable
                   remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getGrpType" :loading="loading">
          <el-option
            v-for="item in grpTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.grpType">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="描述" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button size="mini" type="primary" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { addServerGroup, updateServerGroup } from '@api/server/server.group.js'

  export default {
    data () {
      return {
        grpTypeOptions: [],
        loading: false
      }
    },
    name: 'tag-dialog',
    props: ['formStatus', 'formData'],
    mounted () {
      this.getGrpType('')
    },
    methods: {
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = Object.assign({}, this.formData)
          if (this.formStatus.operationType) {
            addServerGroup(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeServerGroupDialog')
              })
          } else {
            updateServerGroup(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeServerGroupDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
