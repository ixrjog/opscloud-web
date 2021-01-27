<template>
  <div>
    <el-card class="box-card" shadow="never" style="margin-bottom: 10px">
      <div slot="header" class="clearfix">
        <span>开发者令牌<i class="header-icon el-icon-info"></i>(API-Token)</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="addApiToken">申请</el-button>
      </div>
      <el-table :data="userDetail.apiTokens" style="width: 100%">
        <el-table-column prop="tokenId" label="id" width="240"></el-table-column>
        <el-table-column prop="expiredTime" label="过期时间"></el-table-column>
        <el-table-column prop="comment" label="描述"></el-table-column>
        <el-table-column fixed="right" label="操作" width="80">
          <template slot-scope="scope">
            <el-button plain size="mini" @click="delApiToken(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <user-api-token-dialog :formStatus="formUserApiTokenStatus" ref="userApiTokenDialog"
                           @closeDialog="fetchData"></user-api-token-dialog>
  </div>

</template>

<script>
import { delApiTokenById } from '@api/user/user'
import UserApiTokenDialog from '@/components/opscloud/dialog/UserApiTokenDialog'

export default {
  data () {
    return {
      formUserApiTokenStatus: {
        visible: false,
        labelWidth: '100px',
        title: '申请ApiToken'
      }
    }
  },
  props: ['userDetail'],
  name: 'UserDetailApiTokenCard',
  components: {
    UserApiTokenDialog
  },
  methods: {
    addApiToken () {
      this.formUserApiTokenStatus.visible = true
      let userApiToken = {
        id: '',
        tokenId: '',
        token: '',
        expiredTime: '',
        comment: ''
      }
      this.$refs.userApiTokenDialog.initData(userApiToken)
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
    fetchData () {
      this.$emit('fetchData')
    }
  }
}
</script>

<style scoped>

</style>
