<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字查询" class="searchBarStyle"/>
          <el-button @click="fetchData" class="searchBarStyle">查询</el-button>
          <el-popconfirm
            title="确定全量同步用户吗？" @onConfirm="handlerSync"
          >
            <el-button slot="reference" class="searchBarStyle" :loading="syncLoading" :disabled="syncLoading"
                       size="mini">同步
            </el-button>
          </el-popconfirm>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="绑定的OC用户" v-if="props.row.ocUser !== null">
                <span>{{ props.row.ocUser|userFilters }}</span>
              </el-form-item>
              <el-form-item label="唯一标识">
                <span>{{ props.row.accountId }}</span>
              </el-form-item>
              <el-form-item label="员工id">
                <span>{{ props.row.username }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="displayName" label="员工名称"></el-table-column>
        <el-table-column prop="email" label="邮箱">
          <template slot-scope="scope">
            <span v-clipboard:copy="scope.row.email" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.email }}
              <i style="margin-left: 5px" class="el-icon-copy-document"
                 v-if="scope.row.email !== '' && scope.row.email !== null"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号">
          <template slot-scope="scope">
            <span v-clipboard:copy="scope.row.phone" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.phone }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="是否激活">
          <template slot-scope="scope">
            <el-tag v-text="scope.row.isActive?'是':'否'" :type="scope.row.isActive?'success':'warning'">
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="handlerEdit(scope.row)">绑定</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <dingtalk-user-bind-dialog :formStatus="dingtalkUserBindDialogStatus" ref="dingtalkUserBindDialog"
                                 @closeDialog="fetchData"></dingtalk-user-bind-dialog>
    </template>
  </d2-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { queryDingtalkUserPage, syncUser } from '@api/dingtalk/dintalk.user'
import DingtalkUserBindDialog from '@/components/opscloud/dingtalk/DingtalkUserBindDialog'

export default {
  data () {
    return {
      title: '用户关系',
      syncLoading: false,
      queryParam: {
        queryName: ''
      },
      tableData: [],
      dingtalkUserBindDialogStatus: {
        visible: false
      },
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  filters: {
    userFilters (user) {
      return user.username + '<' + user.displayName + '>'
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
  components: {
    DingtalkUserBindDialog
  },
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
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryDingtalkUserPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    handlerEdit (row) {
      this.dingtalkUserBindDialogStatus.visible = true
      this.$refs.dingtalkUserBindDialog.initData(row)
    },
    handlerSync () {
      this.syncLoading = true
      setTimeout(() => {
        syncUser()
          .then(res => {
            this.$message({
              message: '后台同步数据中',
              type: 'success'
            })
            this.fetchData()
            this.syncLoading = false
          })
      }, 300)
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
    onCopy (e) {
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    }
  }
}
</script>

<style scoped>
.input {
  margin-left: 10px;
  display: inline-block;
  max-width: 200px;
}

.searchBarStyle {
  margin-left: 5px;
  max-width: 200px;
}

.el-table .warning-row {
  background: oldlace;
}

</style>

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
