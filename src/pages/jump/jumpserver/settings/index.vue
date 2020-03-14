<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-col>
        <el-tabs tab-position="top" style="height: 200px;">
          <el-tab-pane label="设置面板">
            <!--              页面布局-->
            <el-row :gutter="20">
              <el-col :span="10">
                <el-card class="box-card" shadow="never">
                  <div slot="header" class="clearfix">
                    <span>全局设置</span>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="saveSettings">保存</el-button>
                  </div>
                  <el-form :model="settings">
                    <el-form-item label="管理账户" :label-width="labelWidth" :required="true">
                      <template>
                        <el-select v-model="settings.assetsAdminuserId" placeholder="请选择" clearable>
                          <el-option
                            v-for="item in settings.assetsAdminusers"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                          </el-option>
                        </el-select>
                      </template>
                    </el-form-item>
                    <el-form-item label="系统账户" :label-width="labelWidth" :required="true">
                      <template>
                        <el-select v-model="settings.assetsSystemuserId" placeholder="请选择" clearable>
                          <el-option
                            v-for="item in settings.assetsSystemusers"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                          </el-option>
                        </el-select>
                      </template>
                    </el-form-item>
                  </el-form>
                </el-card>
                <div style="margin: 15px 0;"></div>
                <el-card class="box-card" shadow="never">
                  <div slot="header" class="clearfix">
                    <span>管理员</span>
                  </div>
                  <!--用户搜索-->
                  <div style="margin-bottom: 5px">
                    <!--            :gutter="24"-->
                    <el-row style="margin-bottom: 5px">
                      <el-select filterable clearable :style="searchBarHeadStyle" v-model="userId"
                                 remote reserve-keyword placeholder="搜索用户" :remote-method="getUser"
                                 :loading="searchUserLoading">
                        <el-option
                          v-for="item in userOptions"
                          :key="item.id"
                          :label="item.username"
                          :value="item.id">
                        </el-option>
                      </el-select>
<!--                      <el-button @click="fetchUserData" :style="searchBarStyle">授权</el-button>-->
                    </el-row>
                  </div>
                  <el-row style="margin-bottom: 5px">
                    <el-table :data="adminUserTableData" style="width: 100%" v-loading="adminUserLoading">
                      <el-table-column prop="username" label="用户名"></el-table-column>
                      <el-table-column prop="name" label="显示名"></el-table-column>
                      <el-table-column fixed="right" label="操作" width="80">
                        <template slot-scope="scope">
                          <el-button type="danger" plain size="mini" @click="revokeItem(scope.row)">撤销</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <!--用户翻页-->
                    <el-pagination background @current-change="adminUserPaginationCurrentChange"
                                   layout="prev, pager, next" :total="adminUserPagination.total"
                                   :current-page="adminUserPagination.currentPage"
                                   :page-size="adminUserPagination.pageSize">
                    </el-pagination>
                  </el-row>
                </el-card>
              </el-col>
              <el-col :span="14">
                <el-card class="box-card" shadow="never">
                  <div slot="header" class="clearfix">
                    <span>终端(koko)</span>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="getTerminal">刷新</el-button>
                  </div>
                  <el-table :data="terminals" style="width: 100%" v-loading="terminalLoding">
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="remoteAddr" label="ip"></el-table-column>
                    <el-table-column prop="sshPort" label="ssh"></el-table-column>
                    <el-table-column prop="httpPort" label="http"></el-table-column>
                    <el-table-column prop="sessions" label="会话"></el-table-column>
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="帮助">
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </template>
  </d2-container>
</template>

<script>
  // Component
  // import ServerAttributeCard from '@/components/opscloud/card/ServerAttributeCard'
  // Filters
  import { getUserRoleType, getUserRoleText, getActiveType, getActiveText } from '@/filters/jumpserver.js'

  // API
  import { fuzzyQueryAdminUserPage } from '@api/jump/jump.jumpserver.user.js'
  import { querySettings, queryTerminal, saveSettings } from '@api/jump/jump.jumpserver.js'

  export default {
    data () {
      return {
        searchBarHeadStyle: {
          display: 'inline-block',
          maxWidth: '200px'
        },
        searchBarStyle: {
          marginLeft: '5px'
        },
        adminUserTableData: [],
        adminUserLoading: false,
        adminUserPagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryAdminUserParam: {
          queryName: '',
          isAdmin: 1
        },
        userOptions: [],
        userId: '',
        searchUserLoading: false,
        labelWidth: '150px',
        settings: {},
        terminals: [],
        terminalLoding: false,
        title: 'Jumpserver控制面板'
      }
    },
    mounted () {
      this.getSettings()
      this.getTerminal()
      this.fetchAdminUserData()
    },
    filters: {
      getUserRoleType,
      getUserRoleText,
      getActiveType,
      getActiveText
    },
    // components: {
    //   ServerAttributeCard
    // },
    methods: {
      getUser (queryName) {
        this.searchUserLoading = true
        var requestBody = {
          queryName: queryName,
          isAdmin: 0,
          page: 0,
          length: 20
        }
        fuzzyQueryAdminUserPage(requestBody)
          .then(res => {
            this.userOptions = res.body.data
            this.searchUserLoading = false
          })
      },
      getSettings () {
        querySettings()
          .then(res => {
            this.settings = res.body
          })
      },
      saveSettings () {
        saveSettings(this.settings)
          .then(res => {
            if (res.success) {
              this.getSettings()
              this.$message({
                type: 'success',
                message: '设置成功!'
              })
            } else {
              this.$message({
                type: 'warning',
                message: '设置失败!'
              })
            }
          })
      },
      getTerminal () {
        this.terminalLoding = true
        queryTerminal()
          .then(res => {
            this.terminals = res.body
            this.terminalLoding = false
          })
      },
      adminUserPaginationCurrentChange (currentPage) {
        this.adminUserPagination.currentPage = currentPage
        this.fetchAdminUserData()
      },
      fetchAdminUserData () {
        this.adminUserLoading = true
        var requestBody = Object.assign({}, this.queryAdminUserParam)
        requestBody.page = this.adminUserPagination.currentPage
        requestBody.length = this.adminUserPagination.pageSize
        fuzzyQueryAdminUserPage(requestBody)
          .then(res => {
            this.adminUserTableData = res.body.data
            this.adminUserPagination.total = res.body.totalNum
            this.adminUserLoading = false
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

  .el-row {
    margin-bottom: 20px;

  &
  :last-child {
    margin-bottom: 0;
  }

  }
  .el-col {
    border-radius: 4px;
  }

  .bg-purple-dark {
    background: #99a9bf;
  }

  .bg-purple {
    background: #d3dce6;
  }

  .bg-purple-light {
    background: #e5e9f2;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
