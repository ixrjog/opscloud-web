<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="10">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>个人信息</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="editItem()">修改基本信息</el-button>
              </div>
              <el-form :model="formUserDetail">
                <el-form-item label="用户名" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.username" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="显示名" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.displayName" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="姓名" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.name" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="电话" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.phone" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="邮箱" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.email" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="微信" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.wechat" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="formUserDetail">
                <el-form-item label="留言" :label-width="labelWidth">
                  <el-input v-model="formUserDetail.comment" readonly></el-input>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <!-- 用户资源详情-->
          <el-col :span="14">
            <el-collapse accordion>
              <el-collapse-item>
                <template slot="title">
                  用户组<i class="header-icon el-icon-info"></i>(角色授权)
                </template>
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in formUserDetail.userGroups"
                          :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-collapse-item>
              <el-collapse-item title="服务器组">
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in formUserDetail.serverGroups"
                          :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-collapse-item>
              <el-collapse-item title="AliyunRAM授权策略">
                <div>简化流程：设计简洁直观的操作流程；</div>
                <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
                <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
              </el-collapse-item>
              <el-collapse-item>
                <template slot="title">
                  SSH密钥<i class="header-icon el-icon-info"></i>(堡垒机,Gitlab)
                </template>
                <el-col>
                  <el-tag v-if="formUserDetail.credentialMap != null && formUserDetail.credentialMap.sshPubKey != null"
                          style="margin-left: 5px">{{ formUserDetail.credentialMap.sshPubKey.title }} {{ formUserDetail.credentialMap.sshPubKey.fingerprint }}
                  </el-tag>
                </el-col>
                <el-button style="margin-top: 5px" size="mini" @click="editSSHKey">编辑</el-button>
              </el-collapse-item>
              <el-collapse-item>
                <template slot="title">
                  开发者令牌<i class="header-icon el-icon-info"></i>(API-Token)
                </template>
                <el-table :data="formUserDetail.apiTokens" style="width: 100%">
                  <el-table-column prop="tokenId" label="id" width="240"></el-table-column>
<!--                  <el-table-column prop="token" label="api-token"></el-table-column>-->
                  <el-table-column prop="expiredTime" label="过期时间"></el-table-column>
                  <el-table-column prop="comment" label="描述"></el-table-column>
                  <el-table-column fixed="right" label="操作" width="80">
                    <template slot-scope="scope">
<!--                      <el-button style="float: right; padding: 3px 0" type="text"  @click="delItem(scope.row)">修改基本信息</el-button>-->
                      <el-button plain size="mini" @click="delApiToken(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button style="margin-top: 5px" size="mini" @click="addApiToken">申请</el-button>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
        <!-- 用户资源详情-->
      </div>
      <!--用户编辑-->
      <UserDialog :formStatus="formUserStatus" :formData="user" @closeUserDialog="fetchData"></UserDialog>
      <!-- api-token申请对话框 -->
      <UserApiTokenDialog :formStatus="formUserApiTokenStatus" :formData="userApiToken"
                          @closeUserApiTokenDialog="fetchData"></UserApiTokenDialog>
      <!-- ssh-pubkey编辑对话框 -->
      <UserSSHKeyDialog :formStatus="formUserSSHKeyStatus" ref="userSSHKeyDialog"
                        @closeUserSSHKeyDialog="fetchData"></UserSSHKeyDialog>
    </template>
  </d2-container>
</template>

<script>
  // Component
  import UserDialog from '@/components/opscloud/dialog/UserDialog'
  import UserApiTokenDialog from '@/components/opscloud/dialog/UserApiTokenDialog'
  import UserSSHKeyDialog from '@/components/opscloud/dialog/UserSSHKeyDialog'

  // API
  import { queryUserDetail, delApiTokenById } from '@api/user/user.js'

  export default {
    data () {
      return {
        formUserDetail: {},
        user: {},
        formUserStatus: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增用户信息',
          updateTitle: '更新用户信息'
        },
        formUserApiTokenStatus: {
          visible: false,
          labelWidth: '100px',
          title: '申请ApiToken'
        },
        userApiToken: {},
        userSSHKey: {},
        formUserSSHKeyStatus: {
          visible: false,
          labelWidth: '100px',
          title: '编辑SSH公钥'
        },
        labelWidth: '100px',
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          queryName: ''
        },
        title: '我的详情'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      UserDialog,
      UserApiTokenDialog,
      UserSSHKeyDialog
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      editItem () {
        // form
        this.formUserStatus.visible = true
        this.formUserStatus.operationType = false
        // user
        this.user = Object.assign({}, this.formUserDetail)
      },
      delApiToken (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delApiTokenById(row.id).then(res => {
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
      addApiToken () {
        // form
        this.formUserApiTokenStatus.visible = true
        this.userApiToken = {
          id: '',
          tokenId: '',
          token: '',
          expiredTime: '',
          comment: ''
        }
      },
      editSSHKey () {
        // form
        if (this.formUserDetail.credentialMap.sshPubKey != null) {
          this.userSSHKey = Object.assign({}, this.formUserDetail.credentialMap.sshPubKey)
        } else {
          this.userSSHKey = {
            id: '',
            userId: this.formUserDetail.id,
            username: this.formUserDetail.username,
            title: '',
            credential: '',
            credentialType: 2 // ssh pub-key
          }
        }
        this.$refs.userSSHKeyDialog.initData(this.userSSHKey)
        this.formUserSSHKeyStatus.visible = true
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryUserDetail()
          .then(res => {
            this.formUserDetail = res.body
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
