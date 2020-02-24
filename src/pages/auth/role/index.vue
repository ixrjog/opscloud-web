<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.roleName" placeholder="角色名称"/>
          </el-col>
          <el-col :span="4">
            <el-input v-model="queryParam.resourceName" placeholder="资源名称"/>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="addItem">新增</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="roleName" label="名称"></el-table-column>
        <el-table-column prop="resourceName" label="资源名称"></el-table-column>
        <el-table-column prop="workflow" label="工作流" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.workflow === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.workflow === 0 ? '不允许' : '允许'}}</el-tag>
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
      <!-- role编辑-->
      <dialogrole :form="form" :role="role" @closeRoleDialog="fetchData"></dialogrole>
      <!-- role编辑-->
    </template>
  </d2-container>
</template>

<script>
  // import workflowTag from './workflow.tag'
  import dialogrole from './dialog.role'
  // API
  import { queryRolePage, deleteRoleById } from '@api/auth/auth.role.js'

  export default {
    data () {
      return {
        tableData: [],
        options: {
          stripe: true
        },
        form: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增角色配置',
          updateTitle: '更新角色配置'
        },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          roleName: '',
          resourceName: ''
        },
        role: {},
        title: '角色配置'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      dialogrole
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      editItem (row) {
        // form
        this.form.visible = true
        this.form.operationType = false
        // role
        this.role = Object.assign({}, row)
      },
      addItem () {
        this.form.operationType = true
        this.form.visible = true
        this.role = {
          id: '',
          roleName: '',
          resourceName: '',
          workflow: 0,
          comment: ''
        }
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRoleById(row.id).then(res => {
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
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryRolePage(
          this.queryParam.roleName, this.queryParam.resourceName, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
