<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字查询" class="input"/>
          <el-select v-model.trim="queryParam.isBind" clearable placeholder="是否绑定OC" class="select">
            <el-option
              v-for="item in isBindOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button @click="fetchData" class="button">查询</el-button>
          <el-popconfirm title="确定全量同步用户吗？" @onConfirm="handlerSync">
            <el-button slot="reference" :loading="syncLoading" :disabled="syncLoading"
                       size="mini" class="button">同步
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
        <el-table-column label="所属部门" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-for="(value,key) in scope.row.deptMap" :key="key" :label="key">
              <el-popover
                placement="top"
                trigger="hover">
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item v-for="item in value" :key="item.id">
                    {{ item.deptName }}
                  </el-breadcrumb-item>
                </el-breadcrumb>
                <span slot="reference" style="margin-left: 10px">{{ key }}</span>
              </el-popover>
            </span>
          </template>
        </el-table-column>
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
        <el-table-column prop="isActive" label="是否绑定OC">
          <template slot-scope="scope">
            <el-tag v-text="scope.row.ocUser !== null?'是':'否'" :type="scope.row.ocUser !== null?'success':'warning'">
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="270">
          <template slot-scope="scope">
            <el-button-group>
              <el-button plain size="mini" @click="handlerUpdate(scope.row)">刷新</el-button>
              <el-button plain size="mini" @click="handlerEdit(scope.row)">绑定</el-button>
              <el-button plain size="mini" @click="handlerImport(scope.row)" v-if="scope.row.ocUser === null">导入
              </el-button>
            </el-button-group>
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
      <user-dialog :formStatus="userDialogStatus" ref="userDialog"
                   @closeDialog="fetchData"></user-dialog>
    </template>
  </d2-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { queryDingtalkUserPage, syncUser, updateDingtalkUser } from '@api/dingtalk/dintalk.user'
import DingtalkUserBindDialog from '@/components/opscloud/dingtalk/DingtalkUserBindDialog'
import UserDialog from '@/components/opscloud/dialog/UserDialog'
import { chineseToPinYin } from '@api/opscloud/opscloud.common'
import { userFilters } from '@/filters/user'

export default {
  data () {
    return {
      title: '用户管理',
      syncLoading: false,
      queryParam: {
        queryName: '',
        isBind: ''
      },
      isBindOptions: [{
        value: 1,
        label: '已绑定'
      }, {
        value: 0,
        label: '未绑定'
      }],
      tableData: [],
      dingtalkUserBindDialogStatus: {
        visible: false
      },
      userDialogStatus: {
        visible: false,
        labelWidth: '150px',
        operationType: true,
        addTitle: '新增用户信息',
        updateTitle: '更新用户信息'
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
    userFilters
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
    DingtalkUserBindDialog,
    UserDialog
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
        'isBind': this.queryParam.isBind,
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
    handlerUpdate (row) {
      let requestBody = {
        'uid': row.uid,
        'userid': row.username
      }
      updateDingtalkUser(requestBody)
        .then(res => {
          this.$message.success('刷新成功')
          this.fetchData()
        })
    },
    handlerImport (row) {
      let requestBody = {
        'text': row.displayName
      }
      chineseToPinYin(requestBody)
        .then(res => {
          let user = {
            dingtalkUserId: row.id,
            id: '',
            username: res.body,
            name: row.displayName,
            displayName: row.displayName,
            wechat: '',
            email: row.email,
            phone: row.phone,
            comment: '',
            isRD: false
          }
          this.userDialogStatus.visible = true
          this.userDialogStatus.operationType = true
          this.$refs.userDialog.initData(user)
        })
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
  max-width: 200px;
}

.select {
  margin-left: 5px;
}

.button {
  margin-left: 5px;
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
