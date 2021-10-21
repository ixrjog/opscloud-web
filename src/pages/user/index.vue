<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字模糊查询"
                    style="display: inline-block; max-width:200px;margin-left: 10px"/>
          <el-button @click="fetchData" size="mini" style="margin-left: 5px">查询</el-button>
          <el-button @click="syncLdapUser" size="mini" style="margin-left: 5px">同步</el-button>
          <el-button @click="addItem" size="mini" style="margin-left: 5px">新建</el-button>
          <el-popconfirm title="确定吊销所有用户的令牌吗？" @onConfirm="cleanToken()">
            <el-button slot="reference" size="mini" style="margin-left: 5px">吊销令牌
            </el-button>
          </el-popconfirm>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" @expand-change="getUserOrgList">
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
              <el-form-item label="用户组">
                <div class="tag-group">
                  <el-tag style="margin-left: 5px" v-for="item in props.row.userGroups" :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-form-item>
              <el-form-item label="服务器组">
                <div class="tag-group">
                       <span v-for="item in props.row.serverGroups" :key="item.id">
                          <el-tooltip class="item" effect="light" :content="item.comment || '没有填写'" placement="bottom">
                           <el-tag style="margin-left: 5px"
                                   :type=" item.isAdmin ? 'danger': '' ">{{ item.name }}</el-tag>
                          </el-tooltip></span>
                </div>
              </el-form-item>
              <el-form-item label="部门" v-if="JSON.stringify(props.row.orgDeptMap) !== '{}'">
                <span v-for="(value,key) in props.row.orgDeptMap" :key="key" :label="key">
                  <el-popover
                    placement="top"
                    trigger="hover">
                    <el-breadcrumb separator="/">
                      <el-breadcrumb-item v-for="item in value" :key="item.id">
                        {{ item.name }}
                      </el-breadcrumb-item>
                    </el-breadcrumb>
                    <span slot="reference" style="margin-left: 10px">{{ key }}</span>
                  </el-popover>
                </span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="点击查看用户详情" placement="right">
              <el-button type="text" @click="openUserDetail(scope.row.username)">{{ scope.row.username }}</el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="点击复制" placement="right">
              <span v-clipboard:copy="scope.row.username" v-clipboard:success="onCopy"
                    v-clipboard:error="onError">
                <i style="margin-left: 5px" class="el-icon-copy-document"></i>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="displayName" label="显示名">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="点击复制" placement="right">
              <span v-clipboard:copy="scope.row.displayName" v-clipboard:success="onCopy"
                    v-clipboard:error="onError">{{ scope.row.displayName }}
                <i style="margin-left: 5px" class="el-icon-copy-document"></i>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="userGroups.length" label="用户组"></el-table-column>
        <el-table-column prop="serverGroups.length" label="服务器组"></el-table-column>
        <el-table-column prop="ramUsers.length" label="阿里云RAM账户"></el-table-column>
        <el-table-column fixed="right" label="操作" width="380">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
            <el-tooltip class="item" effect="light" content="用户组授权" placement="top-start">
              <el-button type="primary" plain size="mini" icon="el-icon-user-solid" @click="editUserGroup(scope.row)">
                授权
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="light" content="服务器组授权" placement="top-start">
              <el-button type="primary" plain size="mini" icon="fa fa-server" @click="editServerGroup(scope.row)">授权
              </el-button>
            </el-tooltip>
            <el-button type="danger" plain size="mini" @click="retireUser(scope.row)">离职</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- user编辑对话框 -->
      <UserDialog ref="userDialog" :formStatus="formUserStatus" @closeDialog="fetchData"></UserDialog>
      <!-- 用户组授权编辑对话框-->
      <UserUserGroupDialog ref="userUserGroupDialog" :formStatus="formUserUserGroupStatus"
                           @closeUserUserGroupDialog="fetchData"></UserUserGroupDialog>
      <!-- 服务器组授权编辑对话框-->
      <UserServerGroupDialog ref="userServerGroupDialog" :formStatus="formUserServerGroupStatus"
                             @closeUserServerGroupDialog="fetchData"></UserServerGroupDialog>
    </template>
  </d2-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

// Component
import UserDialog from '@/components/opscloud/user/UserDialog'
import UserUserGroupDialog from '@/components/opscloud/dialog/UserUserGroupDialog'
import UserServerGroupDialog from '@/components/opscloud/dialog/UserServerGroupDialog'
// API
import { fuzzyQueryUserPage, syncUser, retireUserById, cleanUserToken } from '@api/user/user.js'
import { queryOrgByUser } from '@api/org/org'
import util from '@/libs/util'

export default {
  data () {
    return {
      formUserStatus: {
        visible: false,
        operationType: true,
        addTitle: '新增用户信息',
        updateTitle: '更新用户信息'
      },
      formUserUserGroupStatus: {
        visible: false,
        labelWidth: '150px',
        title: '用户组授权'
      },
      formUserServerGroupStatus: {
        visible: false,
        labelWidth: '150px',
        title: '服务器组授权'
      },
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
        isActive: true
      },
      title: '用户管理'
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
    UserDialog,
    UserUserGroupDialog,
    UserServerGroupDialog
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
    retireUser (row) {
      this.$confirm('确认用户离职操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        retireUserById(row.id)
          .then(res => {
            this.fetchData()
            this.$message.success('离职成功')
          })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    editItem (row) {
      // user
      let user = Object.assign({}, row)
      this.formUserStatus.visible = true
      this.formUserStatus.operationType = false
      this.$refs.userDialog.initData(user)
    },
    editUserGroup (row) {
      let user = Object.assign({}, row)
      this.$refs.userUserGroupDialog.initData(user)
      this.formUserUserGroupStatus.visible = true
    },
    editServerGroup (row) {
      let user = Object.assign({}, row)
      this.$refs.userServerGroupDialog.initData(user)
      this.formUserServerGroupStatus.visible = true
    },
    cleanToken () {
      cleanUserToken()
        .then(res => {
          this.$message.success('操作成功')
        })
    },
    addItem () {
      let user = {
        id: '',
        username: '',
        name: '',
        displayName: '',
        wechat: '',
        email: '',
        phone: '',
        comment: '',
        isRD: false
      }
      this.formUserStatus.visible = true
      this.formUserStatus.operationType = true
      this.$refs.userDialog.initData(user)
    },
    handleDialogCancel (done) {
      this.$message({
        message: '取消保存',
        type: 'warning'
      })
      done()
    },
    syncLdapUser () {
      setTimeout(() => {
        this.loading = true
        syncUser()
          .then(res => {
            this.$message({
              message: '同步成功',
              type: 'success'
            })
            this.fetchData()
          })
      }, 300)
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    getUserOrgList (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      queryOrgByUser(row.id)
        .then(res => {
          row.orgDeptMap = res.body
        })
    },
    openUserDetail (username) {
      let host = window.location.host
      let httpProtocol = window.location.href.split('://')[0]
      let buildDetailsUrl = httpProtocol + '://' + host + '/#/user/detail/other?username=' + username
      util.open(buildDetailsUrl)
    },
    onCopy (e) {
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'isActive': this.queryParam.isActive,
        'extend': 1,
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
