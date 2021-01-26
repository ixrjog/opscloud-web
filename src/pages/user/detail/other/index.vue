<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="8">
            <user-detail-card :userDetail="formUserDetail"></user-detail-card>
          </el-col>
          <el-col :span="16">
            <user-detail-asset-card :userDetail="formUserDetail"></user-detail-asset-card>
            <user-detail-user-group-card :userDetail="formUserDetail"></user-detail-user-group-card>
            <user-detail-server-group-card :userDetail="formUserDetail"></user-detail-server-group-card>
            <user-detail-ram-card :userDetail="formUserDetail"></user-detail-ram-card>
            <user-detail-ssh-card :userDetail="formUserDetail"
                                  @fetchData="queryOtherUserDetail"></user-detail-ssh-card>
            <user-detail-api-token-card :userDetail="formUserDetail"
                                        @fetchData="queryOtherUserDetail"></user-detail-api-token-card>
          </el-col>
        </el-row>
      </div>
      <UserDialog :formStatus="formUserStatus" ref="userDialog" @closeUserDialog="queryOtherUserDetail"></UserDialog>
    </template>
  </d2-container>
</template>

<script>
// Component
import UserDialog from '@/components/opscloud/dialog/UserDialog'
import UserDetailCard from '@/components/opscloud/user/UserDetailCard'
import UserDetailAssetCard from '@/components/opscloud/user/UserDetailAssetCard'
import UserDetailUserGroupCard from '@/components/opscloud/user/UserDetailUserGroupCard'
import UserDetailRamCard from '@/components/opscloud/user/UserDetailRamCard'
import UserDetailServerGroupCard from '@/components/opscloud/user/UserDetailServerGroupCard'
import UserDetailSshCard from '@/components/opscloud/user/UserDetailSSHCard'
import UserDetailApiTokenCard from '@/components/opscloud/user/UserDetailApiTokenCard'

// API
import { queryUserDetailByUsername } from '@api/user/user'

export default {
  data () {
    return {
      formUserDetail: {},
      formUserStatus: {
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
      },
      username: '',
      title: '的详情'
    }
  },
  mounted () {
    this.username = this.$route.query.username
    this.queryOtherUserDetail()
  },
  computed: {},
  components: {
    UserDialog,
    UserDetailCard,
    UserDetailAssetCard,
    UserDetailUserGroupCard,
    UserDetailServerGroupCard,
    UserDetailRamCard,
    UserDetailSshCard,
    UserDetailApiTokenCard
  },
  filters: {},
  methods: {
    editItem () {
      this.formUserStatus.visible = true
      this.formUserStatus.operationType = false
      this.$refs.userDialog.initData(Object.assign({}, this.formUserDetail))
    },
    queryOtherUserDetail () {
      this.loading = true
      queryUserDetailByUsername(this.username)
        .then(res => {
          this.formUserDetail = res.body
          this.title = this.formUserDetail.displayName + this.title
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
