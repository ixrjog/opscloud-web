<template>
  <div>
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
                    </el-tooltip>
                 </span>
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
        </template>
      </el-table-column>
      <el-table-column prop="displayName" label="显示名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="userGroups.length" label="用户组"></el-table-column>
      <el-table-column prop="serverGroups.length" label="服务器组"></el-table-column>
      <el-table-column prop="ramUsers.length" label="阿里云RAM账户"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="danger" plain size="mini" @click="retireUser(scope.row)">离职</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { queryOrgByUser } from '@api/org/org'
import util from '@/libs/util'
import { queryUserToBeRetired, retireUserById } from '@api/user/user'

export default {
  data () {
    return {
      tableData: [],
      loading: false
    }
  },
  mounted () {
    this.fetchData()
  },
  name: 'UserToBeRetiredTable',
  methods: {
    retireUser (row) {
      this.$confirm('确认用户离职操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        retireUserById(row.id).then(res => {
          this.fetchData()
          this.$message({
            type: 'success',
            message: '离职成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
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
    fetchData () {
      this.loading = true
      queryUserToBeRetired()
        .then(res => {
          this.tableData = res.body
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>

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
