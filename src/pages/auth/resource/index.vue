<template>
  <d2-container>
    <template>
      <div>
        <h1>资源配置</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-select v-model="queryParam.groupId" filterable clearable
                     remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading"
                     style="display: inline-block; max-width:200px">
            <el-option
              v-for="item in groupOptions"
              :key="item.id"
              :label="item.groupCode"
              :value="item.id">
            </el-option>
          </el-select>
          <el-input v-model="queryParam.resourceName" placeholder="资源路径"
                    style="display: inline-block; max-width:200px; margin-left: 5px"/>
          <el-select v-model="queryParam.needAuth" clearable placeholder="鉴权" style="margin-left: 5px">
            <el-option
              v-for="item in authOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
          <el-button @click="addItem" style="margin-left: 5px">新增</el-button>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="groupCode" label="资源组"></el-table-column>
        <el-table-column prop="resourceName" label="资源路径"></el-table-column>
        <el-table-column prop="comment" label="描述"></el-table-column>
        <el-table-column prop="needAuth" label="鉴权">
          <template slot-scope="scope">
            <el-tag :type="scope.row.needAuth === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.needAuth ===
              0 ? '不鉴权' : '鉴权'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth ===
              0 ? '鉴权' : '不鉴权'}}
            </el-button>
            <el-button type="warning" plain size="mini" @click="updateItem(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <ResourceDialog :formStatus="formResourceStatus" :formData="resource"
                      @closeResourceDialog="fetchData"></ResourceDialog>
    </template>
  </d2-container>
</template>

<script>
  import ResourceDialog from '@/components/opscloud/dialog/ResourceDialog'
  // API
  import { queryGroupPage } from '@api/auth/auth.group.js'
  import { queryResourcePage, deleteResourceById, updateResourceNeedAuth } from '@api/auth/auth.resource.js'

  export default {
    data () {
      return {
        resource: {},
        formResourceStatus: {
          visible: false,
          addTitle: '新增资源配置',
          updateTitle: '更新资源配置',
          labelWidth: '100px',
          operationType: true
        },
        tableData: [],
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          groupId: '',
          groupCode: '',
          resourceName: '',
          needAuth: ''
        },
        authOptions: [{
          value: -1,
          label: '全部'
        }, {
          value: 0,
          label: '不鉴权'
        }, {
          value: 1,
          label: '鉴权'
        }],
        needAuthOptions: [{
          value: 0,
          label: '不鉴权'
        }, {
          value: 1,
          label: '鉴权'
        }],
        groupOptions: []
      }
    },
    mounted () {
      this.fetchData()
      this.getGroup('')
    },
    components: {
      ResourceDialog
    },
    methods: {
      getGroup (groupCode) {
        queryGroupPage(groupCode, 1, 10)
          .then(res => {
            this.groupOptions = res.body.data
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
          deleteResourceById(row.id).then(res => {
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
        this.formResourceStatus.operationType = true
        this.formResourceStatus.visible = true
        this.resource = {
          id: '',
          groupId: '',
          resourceName: '',
          comment: '',
          needAuth: 1
        }
      },
      updateItemNeedAuth (row) {
        var requestBody = {
          'id': row.id,
          'needAuth': row.needAuth === 0 ? 1 : 0
        }
        updateResourceNeedAuth(requestBody)
          .then(res => {
            // 返回数据
            this.$message({
              message: '成功',
              type: 'success'
            })
            this.fetchData()
          })
      },
      updateItem (row) {
        var resource = Object.assign({}, row)
        resource.groupOptions = []
        resource.groupOptions.push(resource.group)
        this.resource = resource
        this.formResourceStatus.operationType = false
        this.formResourceStatus.visible = true
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryResourcePage(this.queryParam.groupId, this.queryParam.resourceName, this.queryParam.needAuth, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
