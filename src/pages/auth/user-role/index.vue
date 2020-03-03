<template>
  <d2-container>
    <template>
      <div>
        <h1>用户角色配置</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
            <el-input v-model="queryParam.username" placeholder="用户名" style="display: inline-block; max-width:200px"/>
            <el-select v-model="queryParam.roleId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索角色" :remote-method="getRole" :loading="loading" style="margin-left: 5px">
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
            <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
            <el-button @click="addItem" style="margin-left: 5px">新增</el-button>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="displayName" label="显示名"></el-table-column>
        <el-table-column prop="roleName" label="角色"></el-table-column>
        <el-table-column prop="roleComment" label="描述"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <el-dialog :title="dialogForm.title"
                 :visible.sync="dialogForm.visible">
        <el-form :model="form">
          <el-form-item label="用户" :label-width="formLabelWidth">
            <el-select v-model="form.username" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索用户" :remote-method="getUser" :loading="loading">
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.username"
                :value="item.username">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="角色" :label-width="formLabelWidth">
            <el-select v-model="form.roleId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索角色" :remote-method="getRole" :loading="loading">
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogForm.visible = false">取消</el-button>
          <el-button type="primary" @click="saveInfo">确定</el-button>
        </div>
      </el-dialog>
    </template>
  </d2-container>
</template>

<script>
  // API
  import { queryRolePage } from '@api/auth/auth.role.js'
  import { queryUserPage } from '@api/user/user.js'
  import { queryUserRolePage, addUserRole, deleteUserRoleById } from '@api/auth/auth.user.role.js'

  export default {
    data () {
      return {
        form: {
          id: '',
          username: '',
          roleId: ''
        },
        dialogImageUrl: '',
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogForm: {
          visible: false,
          title: '用户角色绑定配置'
        },
        tableData: [],
        options: {
          stripe: true
        },
        formOptions: {
          labelWidth: '80px',
          labelPosition: 'left',
          saveLoading: false
        },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          roleId: '',
          username: ''
        },
        userOptions: [],
        roleOptions: []
      }
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      getRole (roleName) {
        queryRolePage(roleName, '', 1, 10)
          .then(res => {
            this.roleOptions = res.body.data
          })
      },
      getUser (username) {
        queryUserPage(username, '', 1, 20)
          .then(res => {
            this.userOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteUserRoleById(row.id).then(res => {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      addItem () {
        this.dialogForm.visible = true
        this.form = {
          id: '',
          username: '',
          roleId: ''
        }
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = {
            'id': this.form.id,
            'username': this.form.username,
            'roleId': this.form.roleId
          }
          addUserRole(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.dialogForm.visible = false
              this.fetchData()
            })
        }, 600)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryUserRolePage(this.queryParam.username, this.queryParam.roleId, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
