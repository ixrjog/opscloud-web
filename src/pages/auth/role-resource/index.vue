<template>
  <d2-container>
    <template>
      <div>
        <h1>角色资源配置</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
            <el-select v-model="queryParam.roleId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索角色" :remote-method="getRole" :loading="loading" style="display: inline-block; max-width:200px">
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
            <el-select v-model="queryParam.groupId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading" style="margin-left: 5px">
              <el-option
                v-for="item in groupOptions"
                :key="item.id"
                :label="item.groupCode"
                :value="item.id">
              </el-option>
            </el-select>
            <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
        </el-row>
      </div>
      <el-row>
        <el-col :span="12" v-if="tableUnbindData.length != 0">
          <div>
            <h3>未绑定资源</h3>
          </div>
          <el-table :data="tableUnbindData" style="width: 100%">
            <el-table-column prop="resourceName" label="资源路径"></el-table-column>
            <el-table-column prop="comment" label="描述"></el-table-column>
            <el-table-column fixed="right" label="操作" width="280">
              <template slot-scope="scope">
                <el-button type="success" plain size="mini" @click="roleBindResource(scope.row)">绑定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="paginationCurrentChange"
                         layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                         :page-size="pagination.pageSize">
          </el-pagination>
        </el-col>
        <el-col :span="12" v-if="tableBindData.length != 0">
          <div>
            <h3>已绑定资源</h3>
          </div>
          <el-table :data="tableBindData" style="width: 100%">
            <el-table-column prop="resourceName" label="资源路径"></el-table-column>
            <el-table-column prop="comment" label="描述"></el-table-column>
            <el-table-column fixed="right" label="操作" width="280">
              <template slot-scope="scope">
                <el-button type="danger" plain size="mini" @click="roleUnbindResource(scope.row)">解除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="paginationCurrentChange"
                         layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                         :page-size="pagination.pageSize">
          </el-pagination>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
  // API
  import { queryRolePage } from '@api/auth/auth.role.js'
  import { queryGroupPage } from '@api/auth/auth.group.js'
  import { queryRoleBindResourcePage, queryRoleUnbindResourcePage, bindRoleResource, unbindRoleResource } from '@api/auth/auth.role.resource.js'

  export default {
    data () {
      return {
        tableUnbindData: [],
        tableBindData: [],
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
          groupId: ''
        },
        roleOptions: [],
        groupOptions: []
      }
    },
    mounted () {
      this.getRole('')
      this.getGroup('')
    },
    methods: {
      getRole (roleName) {
        queryRolePage(roleName, '', 1, 20)
          .then(res => {
            this.roleOptions = res.body.data
          })
      },
      getGroup (groupCode) {
        queryGroupPage(groupCode, 1, 20)
          .then(res => {
            this.groupOptions = res.body.data
          })
      },
      roleBindResource (row) {
        setTimeout(() => {
          var requestBody = {
            'resourceId': row.id,
            'roleId': this.queryParam.roleId
          }
          bindRoleResource(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '绑定成功',
                type: 'success'
              })
              this.fetchData()
            })
        }, 600)
      },
      roleUnbindResource (row) {
        setTimeout(() => {
          unbindRoleResource(row.id)
            .then(res => {
              // 返回数据
              this.$message({
                message: '解除绑定成功',
                type: 'success'
              })
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
        // 绑定的资源
        queryRoleBindResourcePage(this.queryParam.roleId, this.queryParam.groupId, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableBindData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
        // 未绑定的资源
        queryRoleUnbindResourcePage(this.queryParam.roleId, this.queryParam.groupId, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableUnbindData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
