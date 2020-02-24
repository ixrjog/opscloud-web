<template>
  <el-dialog :title="form.operationType ? form.addTitle : form.updateTitle"
             :visible.sync="form.visible">
    <el-form :model="role">
      <el-form-item label="名称" :label-width="form.labelWidth">
        <el-input v-model="role.roleName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>

    <el-form :model="role">
      <el-form-item label="资源路径" :label-width="form.labelWidth">
        <el-input v-model="role.resourceName" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="role">
      <el-form-item label="登录类型" :label-width="form.labelWidth">
        <el-select v-model="role.workflow" placeholder="选择类型">
          <el-option
            v-for="item in workflowOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="role">
      <el-form-item label="描述" :label-width="form.labelWidth">
        <el-input v-model="role.comment" placeholder="请输入内容"></el-input>
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
  import { addRole, updateRole } from '@api/auth/auth.role.js'

  export default {
    data () {
      return {
        loading: false,
        workflowOptions: [{
          value: 0,
          label: '不允许'
        }, {
          value: 1,
          label: '允许'
        }]
      }
    },
    name: 'dialog-role',
    props: {
      form: {},
      role: {
        id: '',
        roleName: '',
        resourceName: '',
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
          var requestBody = {}
          requestBody = Object.assign({}, this.role)
          if (this.form.operationType) {
            addRole(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.form.visible = false
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
                this.form.visible = false
                this.$emit('closeRoleDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
