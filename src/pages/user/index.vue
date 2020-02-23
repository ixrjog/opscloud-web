<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.queryName" placeholder="输入关键字模糊查询"/>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="姓名" v-if="props.row.name != null && props.row.name != ''">
                <span>{{ props.row.name }}</span>
              </el-form-item>
              <el-form-item label="电话" v-if="props.row.phone != null && props.row.phone != ''">
                <span>{{ props.row.phone }}</span>
              </el-form-item>
              <el-form-item label="微信" v-if="props.row.wechat != null && props.row.wechat != ''">
                <span>{{ props.row.wechat }}</span>
              </el-form-item>
              <el-form-item label="数据源" v-if="props.row.source != null && props.row.source != ''">
                <span>{{ props.row.source }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="displayName" label="显示名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column v-if="false" prop="name" label="环境">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.env.color }">{{scope.row.env.envName}}</el-tag>
          </template>
        </el-table-column>
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
      <!-- user编辑对话框-->
      <dialoguser :form="form" :user="user" @closeDialog="fetchData">
      </dialoguser>
      <!-- user编辑对话框-->
    </template>
  </d2-container>
</template>

<script>
  // Component
  import dialoguser from './dialog.user'

  // API
  import { fuzzyQueryUserPage, deleteUserById } from '@api/user/user.js'

  export default {
    data () {
      return {
        // user: {
        //   id: '',
        //   username: '',
        //   name: '',
        //   password: '',
        //   displayName: '',
        //   email: '',
        //   wechat: '',
        //   phone: '',
        //   comment: ''
        // },
        user: {},
        form: {
          visible: false,
          labelWidth: '150px',
          operationType: true
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
          queryName: ''
        },
        title: '用户信息'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      dialoguser
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      // getUserRandomPassword () {
      //   getRandomPassword()
      //     .then(res => {
      //       this.form.password = res.body
      //     })
      // },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteUserById(row.id).then(res => {
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
          username: row.username,
          name: row.name,
          displayName: row.displayName,
          wechat: row.wechat,
          email: row.email,
          phone: row.phone,
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
          username: '',
          name: '',
          displayName: '',
          wechat: '',
          email: '',
          phone: '',
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
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        var requestBody = {
          'queryName': this.queryParam.queryName,
          'page': this.pagination.currentPage,
          'length': this.pagination.pageSize
        }
        fuzzyQueryUserPage(requestBody)
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
    width: 50%;
  }
</style>
