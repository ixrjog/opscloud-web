<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-select v-model="queryParam.queryName" filterable remote reserve-keyword placeholder="搜索用户"
                     :remote-method="getUser" class="select" clearable>
            <el-option
              v-for="user in userOptions"
              :key="user.username"
              :label="user.displayName"
              :value="user.username">
              <span style="float: left">{{ user | userFilters }}</span>
              <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ user.email }}</span>
            </el-option>
          </el-select>
          <el-button @click="queryOtherUserDetail" class="button">查询</el-button>
        </el-row>
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="8">
            <user-detail-card :userDetail="formUserDetail" @fetchData="refreshData"></user-detail-card>
          </el-col>
          <!-- 用户资源详情-->
          <el-col :span="16">
            <user-detail-asset-card :userDetail="formUserDetail"></user-detail-asset-card>
            <user-detail-user-group-card :userDetail="formUserDetail"></user-detail-user-group-card>
            <user-detail-server-group-card :userDetail="formUserDetail"></user-detail-server-group-card>
            <user-detail-ram-card :userDetail="formUserDetail"></user-detail-ram-card>
            <user-detail-ssh-card :userDetail="formUserDetail"
                                  @fetchData="refreshData"></user-detail-ssh-card>
            <user-detail-api-token-card :userDetail="formUserDetail"
                                        @fetchData="refreshData"></user-detail-api-token-card>
          </el-col>
        </el-row>
        <!-- 用户资源详情-->
      </div>
    </template>
  </d2-container>
</template>

<script>
// Component
import UserDetailCard from '@/components/opscloud/user/UserDetailCard'
import UserDetailAssetCard from '@/components/opscloud/user/UserDetailAssetCard'
import UserDetailUserGroupCard from '@/components/opscloud/user/UserDetailUserGroupCard'
import UserDetailRamCard from '@/components/opscloud/user/UserDetailRamCard'
import UserDetailServerGroupCard from '@/components/opscloud/user/UserDetailServerGroupCard'
import UserDetailSshCard from '@/components/opscloud/user/UserDetailSSHCard'
import UserDetailApiTokenCard from '@/components/opscloud/user/UserDetailApiTokenCard'

// API
import { queryUserDetail, queryUserDetailByUsername, fuzzyQueryUserPage } from '@api/user/user'
import { userFilters } from '@/filters/user'

export default {
  data () {
    return {
      formUserDetail: {},
      user: {},
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: ''
      },
      title: '我的详情',
      userOptions: []
    }
  },
  mounted () {
    this.fetchData()
  },
  components: {
    UserDetailCard,
    UserDetailAssetCard,
    UserDetailUserGroupCard,
    UserDetailServerGroupCard,
    UserDetailRamCard,
    UserDetailSshCard,
    UserDetailApiTokenCard
  },
  filters: {
    userFilters
  },
  methods: {
    fetchData () {
      this.loading = true
      queryUserDetail()
        .then(res => {
          this.formUserDetail = res.body
          this.loading = false
        })
    },
    queryOtherUserDetail () {
      if (this.queryParam.queryName === '') {
        this.$message.warning('请选择用户')
        return
      }
      this.loading = true
      queryUserDetailByUsername(this.queryParam.queryName)
        .then(res => {
          this.formUserDetail = res.body
          this.loading = false
        })
    },
    getUser (queryName) {
      let requestBody = {
        'queryName': queryName,
        'extend': 0,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
        })
    },
    refreshData () {
      if (this.queryParam.queryName === '') {
        this.fetchData()
      } else {
        this.queryOtherUserDetail()
      }
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

.el-card__header {
  padding: 10px 10px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.button {
  margin-left: 5px;
}

.select {
  margin-left: 10px;
}

</style>
