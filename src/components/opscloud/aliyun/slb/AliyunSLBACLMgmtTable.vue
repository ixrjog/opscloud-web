<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-input prefix-icon="el-icon-search" v-model.trim="queryName" placeholder="关键字查询"
                class="searchBarHeadStyle" @change="fetchData"/>
      <el-button @click="handlerSync" class="searchBarStyle" :loading="syncLoading">同步</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="访问控制策略组id">
              <span>{{ props.row.slbAclId }}</span>
            </el-form-item>
            <el-form-item label="资源组id">
              <span>{{ props.row.resourceGroupId }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="slbAclName" label="策略组名称"></el-table-column>
      <el-table-column label="关联监听">
        <template slot-scope="scope">
          <div v-for="item in scope.row.aclListenerList" :key="item.id">
            <el-tag style="margin-left: 5px">{{ item | listenerFilters }}</el-tag>
            <el-tooltip effect="dark" content="白名单" placement="right">
              <img v-show="item.slbAclType === 'white'" style="margin-left: 5px;width: 12px"
                   :src="whiteListImageUrl">
            </el-tooltip>
            <el-tooltip effect="dark" content="黑名单" placement="right">
              <img v-show="item.slbAclType === 'black'" style="margin-left: 5px;width: 12px"
                   :src="blackListImageUrl">
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="addressIpVersion" label="IP地址类型"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="getACLEntry(scope.row)">查询条目</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <aliyun-slb-acl-entry-dialog :formStatus="formEntryStatus"
                                 ref="aliyunSLBACLEntryDialog"></aliyun-slb-acl-entry-dialog>
  </div>
</template>
<script>
// Components
import AliyunSlbAclEntryDialog from '@/components/opscloud/aliyun/slb/AliyunSLBACLEntryDialog'
import { queryAccessControlEntry, queryAccessControlPage, syncSLBACL } from '@api/cloud/aliyun.slb.acl'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      queryName: '',
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
      syncLoading: false,
      formEntryStatus: {
        visible: false
      },
      whiteListImageUrl: require('@/static/icons/white-list.svg'),
      blackListImageUrl: require('@/static/icons/black-list.svg')
    }
  },
  name: 'aliyun-slb-acl-mgmt-table',
  mounted () {
    this.fetchData()
    this.initPageSize()
  },
  components: {
    AliyunSlbAclEntryDialog
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  filters: {
    listenerFilters (listener) {
      return listener.loadBalancerName + '-' + listener.slbAclProtocol + ':' + listener.slbAclListenerPort
    }
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
    handleClick () {
      this.$emit('input', !this.value)
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryAccessControlPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    handlerSync () {
      this.$confirm('确定全量同步SLB访问控制吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncLoading = true
        this.$message.info('后台数据同步中')
        setTimeout(() => {
          syncSLBACL()
            .then(res => {
              this.$message.success('同步完成')
              this.fetchData()
              this.syncLoading = false
            })
        }, 300)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        })
      })
    },
    getACLEntry (row) {
      this.formEntryStatus.visible = true
      queryAccessControlEntry(row.slbAclId)
        .then(res => {
          this.$refs.aliyunSLBACLEntryDialog.initData(res.body)
        })
    }
  }
}
</script>

<style scoped>
.searchBarHeadStyle {
  display: inline-block;
  max-width: 200px;
}

.searchBarStyle {
  margin-left: 5px;
  max-width: 200px;
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
