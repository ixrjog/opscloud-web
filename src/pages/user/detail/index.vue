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
                <el-button style="float: right; padding: 3px 0" type="text">修改基本信息</el-button>
              </div>
              <el-form :model="userDetailForm">
                <el-form-item label="用户名" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.username" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="显示名" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.displayName" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="姓名" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.name" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="电话" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.phone" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="邮箱" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.email" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="微信" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.wechat" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="留言" :label-width="labelWidth">
                  <el-input v-model="userDetailForm.comment" readonly></el-input>
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
                          v-for="item in userDetailForm.userGroups"
                          :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-collapse-item>
              <el-collapse-item title="服务器组">
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in userDetailForm.serverGroups"
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
                  <el-tag style="margin-left: 5px">pubKey</el-tag>
                  <el-tag style="margin-left: 5px">{{ userDetailForm.credentialMap.sshPubKey.title }}</el-tag>
                </el-col>
                <el-button style="margin-top: 5px" size="mini" @click="editSshKey">编辑</el-button>
              </el-collapse-item>
              <el-collapse-item>
                <template slot="title">
                  开发者令牌<i class="header-icon el-icon-info"></i>(API-Token)
                </template>
                <el-table :data="userDetailForm.apiTokens" style="width: 100%">
                  <el-table-column prop="tokenId" label="id" width="240">
                  </el-table-column>
                  <el-table-column prop="token" label="api-token">
                  </el-table-column>
                  <el-table-column prop="expiredTime" label="过期时间">
                  </el-table-column>
                  <el-table-column prop="comment" label="描述">
                  </el-table-column>
                </el-table>
                <el-button style="margin-top: 5px" size="mini" @click="addApiToken">申请</el-button>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
        <!-- 用户资源详情-->
      </div>
      <!-- api-token申请对话框 -->
      <dialogtoken :form="tokenForm" @closeDialog="fetchData"></dialogtoken>
      <!-- ssh-pubkey编辑对话框 -->
      <dialogsshkey :form="sshKeyForm" @closeDialog="fetchData"></dialogsshkey>
    </template>
  </d2-container>
</template>

<script>
  // Component
  import dialogtoken from './dialog.api.token'
  import dialogsshkey from './dialog.ssh.key'

  // API
  import { queryUserDetail } from '@api/user/user.js'

  export default {
    data () {
      return {
        userDetailForm: {},
        user: {},
        tokenForm: {
          data: {
            id: '',
            tokenId: '',
            token: '',
            expiredTime: '',
            comment: ''
          },
          visible: false,
          labelWidth: '100px',
          title: '申请ApiToken'
        },
        sshKeyForm: {
          data: {
            id: '',
            userId: '',
            username: '',
            title: '',
            credential: '',
            credentialType: 2 // ssh pub-key
          },
          visible: false,
          labelWidth: '100px',
          title: '编辑SSH公钥'
        },
        labelWidth: '100px',
        formLabelColor: '#99a9bf',
        tableData: [],
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
          queryName: ''
        },
        title: '我的详情'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      dialogtoken,
      dialogsshkey
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      editItem (row) {
        // form
        this.form.visible = true
        this.form.operationType = false
        // user
        this.user = {
          id: row.id,
          username: row.username,
          name: row.name,
          displayName: row.displayName,
          wechat: row.wechat,
          email: row.email,
          phone: row.phone,
          comment: row.comment
        }
      },
      addApiToken () {
        // form
        this.tokenForm.visible = true
      },
      editSshKey () {
        // form
        if (this.userDetailForm.credentialMap.sshPubKey != null) {
          this.sshKeyForm.data = Object.assign({}, this.userDetailForm.credentialMap.sshPubKey)
        }
        this.sshKeyForm.visible = true
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryUserDetail()
          .then(res => {
            this.userDetailForm = res.body
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
