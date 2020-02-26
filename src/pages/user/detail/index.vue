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
                <el-form-item label="用户名" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.username" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="显示名" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.displayName" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="姓名" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.name" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="电话" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.phone" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="邮箱" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.email" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="微信" :label-width="form.labelWidth">
                  <el-input v-model="userDetailForm.wechat" readonly></el-input>
                </el-form-item>
              </el-form>
              <el-form :model="userDetailForm">
                <el-form-item label="留言" :label-width="form.labelWidth">
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
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in userDetailForm.userGroups"
                          :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-collapse-item>
              <el-collapse-item>
                <template slot="title">
                  开发者令牌<i class="header-icon el-icon-info"></i>(API-Token)
                </template>
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in userDetailForm.userGroups"
                          :key="item.id">{{ item.name }}
                  </el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
        <!-- 用户资源详情-->
      </div>
      <!-- user编辑对话框 -->
      <dialoguser :form="form" :user="user" @closeDialog="fetchData"></dialoguser>
      <!-- user编辑对话框-->
    </template>
  </d2-container>
</template>

<script>
  // Component
  import dialoguser from '../dialog.user'

  // API
  import { queryUserDetail } from '@api/user/user.js'

  export default {
    data () {
      return {
        userDetailForm: {},
        user: {},
        form: {
          visible: false,
          labelWidth: '100px',
          operationType: true,
          addTitle: '新增用户信息',
          updateTitle: '更新用户信息'
        },
        dialogVisible: false,
        formLabelWidth: '100px',
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
      dialoguser
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
      addItem () {
        // form
        this.form.visible = true
        this.form.operationType = true
        // user
        this.user = {
          id: '',
          username: '',
          name: '',
          displayName: '',
          wechat: '',
          email: '',
          phone: '',
          comment: ''
        }
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
