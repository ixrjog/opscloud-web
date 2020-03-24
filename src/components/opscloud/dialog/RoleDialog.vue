<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="formData">
      <el-form-item label="名称" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.roleName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>

    <el-form :model="formData">
      <el-form-item label="资源路径" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.resourceName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="工作流" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.workflow" placeholder="选择类型">
          <el-option
            v-for="item in workflowOptions"
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
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { addRole, updateRole } from '@api/auth/auth.role.js'

  export default {
    data () {
      return {
        workflowOptions: [{
          value: 0,
          label: '不允许'
        }, {
          value: 1,
          label: '允许'
        }]
      }
    },
    name: 'role-dialog',
    props: ['formStatus', 'formData'],
    mixins: [],
    mounted () {
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = {}
          requestBody = Object.assign({}, this.formData)
          if (this.formStatus.operationType) {
            addRole(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeRoleDialog')
              })
          } else {
            updateRole(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeRoleDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
