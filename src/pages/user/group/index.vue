<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.name" placeholder="输入关键字查询用户组"/>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="syncLdapUserGroup">同步</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="用户成员">
                <div class="tag-group">
                    <el-tag style="margin-left: 5px"
                            v-for="item in props.row.users"
                            :key="item.id">{{ item.username }}&lt;{{ item.displayName }}&gt;</el-tag>
                </div>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="用户组名称"></el-table-column>
        <el-table-column prop="users.length" label="成员数" width="100"></el-table-column>
        <el-table-column prop="workflow" label="工作流" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.workflow === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.workflow ===
              0 ? '不允许' : '允许'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="描述"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- userGroup编辑对话框-->
      <dialoggroup :form="form" :group="group" @closeDialog="fetchData"></dialoggroup>
      <!-- userGroup编辑对话框-->
    </template>
  </d2-container>
</template>

<script>
  // Component
  import dialoggroup from './dialog.group'

  // API
  import { queryUserGroupPage, deleteUserGroupById, syncUserGroup } from '@api/user/user.group.js'

  export default {
    data () {
      return {
        group: {},
        form: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增用户信息',
          updateTitle: '更新用户信息'
        },
        dialogVisible: false,
        formLabelWidth: '150px',
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
          name: '',
          workflow: ''
        },
        title: '用户组管理'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      dialoggroup
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteUserGroupById(row.id).then(res => {
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
      editItem (row) {
        // form
        this.form.visible = true
        this.form.operationType = false
        // user
        this.user = {
          id: row.id,
          name: row.name,
          grpType: row.grpType,
          workflow: row.workflow,
          comment: row.comment
        }
      },
      addItem () {
        // form
        this.form.visible = true
        this.form.operationType = true
        // user
        this.user = {
          id: '',
          name: '',
          grpType: 0,
          workflow: 0,
          comment: ''
        }
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      syncLdapUserGroup (done) {
        setTimeout(() => {
          syncUserGroup()
            .then(res => {
              this.$message({
                message: '同步成功',
                type: 'success'
              })
              this.fetchData()
              done()
            })
        }, 300)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryUserGroupPage(this.queryParam.name, '', this.queryParam.workflow, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>

<style>
  .table-expand {
    font-size: 0;
  }

  .table-expand label {
    width: 150px;
    color: #99a9bf;
  }

  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }
</style>
