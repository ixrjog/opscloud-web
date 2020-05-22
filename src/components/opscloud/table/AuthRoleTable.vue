<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-row :gutter="24" style="margin-bottom: 5px">
        <el-input v-model="queryParam.roleName" placeholder="角色名称" style="display: inline-block; max-width:200px"/>
        <el-input v-model="queryParam.resourceName" placeholder="资源名称"
                  style="display: inline-block; max-width:200px; margin-left: 5px"/>
        <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
        <el-button @click="addItem" style="margin-left: 5px">新增</el-button>
      </el-row>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="roleName" label="名称"></el-table-column>
      <el-table-column prop="resourceName" label="资源名称"></el-table-column>
      <el-table-column prop="inWorkorder" label="工作流" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.inWorkorder === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.inWorkorder
            === 0 ?
            '禁止' : '允许'}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="描述"></el-table-column>
      <el-table-column fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
          <el-button type="primary" plain size="mini" @click="editMenu(scope.row)">菜单</el-button>
          <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <!-- role编辑-->
    <RoleDialog :formStatus="formRoleStatus" :formData="role" @closeRoleDialog="fetchData"></RoleDialog>
    <MenuDialog :formStatus="formMenuStatus" ref="menuDialog"></MenuDialog>
  </div>
</template>

<script>

  import RoleDialog from '@/components/opscloud/dialog/RoleDialog'
  import MenuDialog from '@/components/opscloud/dialog/MenuDialog'
  // API
  import { queryRolePage, deleteRoleById } from '@api/auth/auth.role.js'

  export default {
    name: 'AuthRoleTable',
    data () {
      return {
        tableData: [],
        role: {},
        formMenuStatus: {
          visible: false
        },
        formRoleStatus: {
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
        title: '角色配置'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      RoleDialog,
      MenuDialog
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      editItem (row) {
        // form
        this.formRoleStatus.visible = true
        this.formRoleStatus.operationType = false
        // role
        this.role = Object.assign({}, row)
      },
      editMenu (row) {
        // form
        this.formMenuStatus.visible = true
        this.$refs.menuDialog.initData(row.id)
      },
      addItem () {
        this.formRoleStatus.operationType = true
        this.formRoleStatus.visible = true
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

<style scoped>

</style>
