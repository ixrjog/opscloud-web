<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="formData">
      <el-form-item label="资源组" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.groupId" filterable clearable
                   remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading">
          <el-option
            v-for="item in formData.groupOptions"
            :key="item.id"
            :label="item.groupCode"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="资源路径" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.resourceName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="鉴权" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.needAuth" placeholder="是否鉴权">
          <el-option
            v-for="item in needAuthOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
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
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

  // API
  import { queryGroupPage } from '@api/auth/auth.group.js'
  import { addResource, updateResource } from '@api/auth/auth.resource.js'

  export default {
    data () {
      return {
        loading: false,
        // groupOptions: this.formData.groupOptions,
        // group: this.formData.group,
        needAuthOptions: [{
          value: 0,
          label: '不鉴权'
        }, {
          value: 1,
          label: '鉴权'
        }]
      }
    },
    name: 'resource-dialog',
    props: ['formStatus', 'formData'],
    mounted () {
    },
    methods: {
      getGroup (groupCode) {
        queryGroupPage(groupCode, 1, 10)
          .then(res => {
            this.formData.groupOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = Object.assign({}, this.formData)
          if (this.formStatus.operationType) {
            addResource(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeResourceDialog')
              })
          } else {
            updateResource(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeResourceDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
