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
            <el-form-item label="证书id">
              <span>{{ props.row.serverCertificateId }}</span>
            </el-form-item>
            <el-form-item label="地域">
              <span>{{ props.row.regionId }}</span>
            </el-form-item>
            <el-form-item label="指纹">
              <span>{{ props.row.fingerprint }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="serverCertificateName" label="证书名称"></el-table-column>
      <el-table-column prop="commonName" label="证书域名"></el-table-column>
      <el-table-column label="关联监听">
        <template slot-scope="scope">
          <div v-for="item in scope.row.httpsListenerList"
               :key="item.id">
            <el-row>
              <el-col :span="18">
                <el-tooltip effect="dark" :content="getHttpsListenerContent(item)" placement="top">
                  <el-tag style="margin-left: 5px">
                    {{ item | httpsListenerFilters }}
                  </el-tag>
                </el-tooltip>
              </el-col>
              <el-col :span="6" v-show="scope.row.updateServerCertificateName !== null">
                <el-tooltip effect="dark" content="更换" placement="right">
                  <el-popconfirm title="确定更换证书吗？" @onConfirm="handlerReplace(item,scope.row)">
                    <el-button slot="reference" type="success" plain icon="fa fa-level-up" size="mini"></el-button>
                  </el-popconfirm>
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="expireTime" label="过期时间"></el-table-column>
      <el-table-column prop="updateServerCertificateName" label="更换证书"></el-table-column>
      <el-table-column prop="expirationCurrDateDiff" label="状态">
        <template slot-scope="scope">
          <el-tag :type="getStatusColor(scope.row.expirationCurrDateDiff)" size="mini" disable-transitions>
            {{ scope.row.expirationCurrDateDiff | statusFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="handlerEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <aliyun-slb-sc-set-dialog :formStatus="formStatus" ref="aliyunSLBSCSetDialog"
                          @handlerSetActive="fetchData"></aliyun-slb-sc-set-dialog>
  </div>
</template>
<script>
// Components
import { queryAliyunSlbSCPage, replaceSC, syncSLBSC } from '@api/cloud/aliyun.slb.sc'
import AliyunSlbScSetDialog from '@/components/opscloud/aliyun/slb/AliyunSLBSCSetDialog'
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
      formStatus: {
        visible: false
      }
    }
  },
  name: 'certificate-mgmt-table',
  mounted () {
    this.fetchData()
    this.initPageSize()
  },
  components: {
    AliyunSlbScSetDialog
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  filters: {
    statusFilters (expirationCurrDateDiff) {
      if (expirationCurrDateDiff <= 0) {
        return '已过期'
      }
      if (expirationCurrDateDiff < 90 && expirationCurrDateDiff > 0) {
        return '即将过期'
      }
      if (expirationCurrDateDiff >= 90) {
        return '正常'
      }
      return ''
    },
    httpsListenerFilters (httpsListener) {
      return httpsListener.loadBalancerName + ':' + httpsListener.httpsListenerPort
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
    getHttpsListenerContent (item) {
      if (item.serverCertificateType === 1) {
        return '默认证书： ' + item.serverCertificateDomain
      }
      if (item.serverCertificateType === 2) {
        return '扩展证书： ' + item.serverCertificateDomain
      }
      return 'unknown'
    },
    getStatusColor (expirationCurrDateDiff) {
      if (expirationCurrDateDiff <= 0) {
        return 'danger'
      }
      if (expirationCurrDateDiff < 90 && expirationCurrDateDiff > 0) {
        return 'warning'
      }
      if (expirationCurrDateDiff >= 90) {
        return 'success'
      }
      return ''
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
      queryAliyunSlbSCPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    tableRowClassName ({ row, rowindex }) {
      if (row.expirationCurrDateDiff > 90) {
        return ''
      }
      if (row.expirationCurrDateDiff <= 90 && row.expirationCurrDateDiff > 7) {
        return 'warning-row'
      }
      return 'danger-row'
    },
    handlerSync () {
      this.$confirm('确定全量同步SLB证书吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncLoading = true
        this.$message.info('后台数据同步中')
        setTimeout(() => {
          syncSLBSC()
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
    handlerEdit (row) {
      this.formStatus.visible = true
      this.$refs.aliyunSLBSCSetDialog.initData(row)
    },
    handlerReplace (item, row) {
      let requestBody = {
        'updateServerCertificateId': row.updateServerCertificateId,
        'serverCertificateType': item.serverCertificateType
      }
      if (item.serverCertificateType === 1) {
        requestBody.loadBalancerId = item.loadBalancerId
        requestBody.listenerPort = item.httpsListenerPort
      }
      if (item.serverCertificateType === 2) {
        requestBody.domainExtensionId = item.domainExtensionId
      }
      replaceSC(requestBody)
        .then(res => {
          this.$message({
            message: '更换证书成功',
            type: 'success'
          })
          this.fetchData()
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
