<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字模糊查询"
                    style="display: inline-block; max-width:200px;margin-left: 10px"/>
          <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
          <el-button @click="handlerSyncMonitorUser" style="margin-left: 5px">同步</el-button>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="电话" v-if="props.row.phone != null && props.row.phone != ''">
                <span>{{ props.row.phone }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="displayName" label="显示名"  width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱"  width="120"></el-table-column>
        <el-table-column prop="usrgrps" label="用户组">
          <template slot-scope="props">
            <div class="tag-group">
              <el-tag style="margin-left: 5px" v-for="item in props.row.usrgrps" :key="item.usrgrpid">{{ item.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" v-if="false">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
    </template>
  </d2-container>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  // API
  import { syncMonitorUsers, queryMonitorUserPage } from '@api/monitor/monitor.user.js'

  export default {
    data () {
      return {
        tableData: [],
        options: {
          stripe: true
        },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          queryName: '',
          accountType: 1,
          isActive: true
        },
        title: '用户配置'
      }
    },
    computed: {
      ...mapState('d2admin/user', [
        'info'
      ])
    },
    mounted () {
      this.initPageSize()
      this.fetchData()
    },
    components: {},
    methods: {
      ...mapActions({
        setPageSize: 'd2admin/user/set'
      }),
      handleSizeChange (size) {
        this.pagination.pageSize = size
        this.info.pageSize = size
        this.setPageSize(this.info)
        this.fetchData()
      },
      initPageSize () {
        if (typeof (this.info.pageSize) !== 'undefined') {
          this.pagination.pageSize = this.info.pageSize
        }
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      handlerSyncMonitorUser () {
        setTimeout(() => {
          syncMonitorUsers()
            .then(res => {
              this.$message({
                message: '后台同步中！',
                type: 'success'
              })
            })
        }, 300)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        let requestBody = {
          'queryName': this.queryParam.queryName,
          'accountType': this.queryParam.accountType,
          'page': this.pagination.currentPage,
          'length': this.pagination.pageSize
        }
        queryMonitorUserPage(requestBody)
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
