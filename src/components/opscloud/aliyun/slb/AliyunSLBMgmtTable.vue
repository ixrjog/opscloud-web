<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-input v-model.trim="queryParam.queryName" placeholder="关键字查询" class="searchBarHeadStyle"/>
      <el-select v-model="queryParam.loadBalancerStatus" clearable placeholder="状态" class="searchBarStyle">
        <el-option
          v-for="item in loadBalancerStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="queryParam.addressType" clearable placeholder="网络类型" class="searchBarStyle">
        <el-option
          v-for="item in addressTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" class="searchBarStyle">查询</el-button>
      <el-button @click="handlerSync" class="searchBarStyle" :loading="syncLoading">同步</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName"
              @expand-change="getBackendServer">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand"
                   v-if="JSON.stringify(props.row.backendServers) !== '{}'">
            <el-form-item v-for="(value,key) in props.row.backendServers" :key="key" :label="key">
              <div v-for="item in value" :key="item.serverId">{{ item | serverFilters }}</div>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="loadBalancerName" label="名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-row>
            <span>{{ scope.row.loadBalancerName }}</span>
          </el-row>
          <el-row>
            <span v-clipboard:copy="scope.row.loadBalancerId" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.loadBalancerId }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          <el-row>
            <span v-clipboard:copy="scope.row.address" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.address }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="监听">
        <template slot-scope="scope">
          <div v-for="item in scope.row.listenerList" :key="item.id">
            <el-row>
              <el-col :span="12">
                <span v-if="item.accessControlListener !== null">
                  <el-tooltip effect="dark" :content="getAclName(item.accessControlListener)" placement="left">
                    <img v-if="item.accessControlListener.slbAclType === 'white'" :src="whiteListImageUrl"
                         style="width: 15px;margin-left: 5px">
                  </el-tooltip>
                  <el-tooltip effect="dark" :content="getAclName(item.accessControlListener)" placement="left">
                    <img v-if="item.accessControlListener.slbAclType === 'black'" :src="blackListImageUrl"
                         style="width: 15px;margin-left: 5px">
                  </el-tooltip>
                </span>
                <span v-if="item.httpsListenerList === null">
                  <el-tag style="margin-left: 5px">{{ item | listenerFilters }}</el-tag>
                </span>
                <span v-else>
                    <el-popover
                      placement="right" title="https监听证书详情" width="280" trigger="click">
                     <el-table :data="item.httpsListenerList">
                      <el-table-column width="100" property="serverCertificateType" label="证书类型">
                        <template slot-scope="scope">
                          {{ scope.row.serverCertificateType | serverCertificateTypeFilters }}
                      </template>
                      </el-table-column>
                      <el-table-column width="180" property="serverCertificateDomain" label="域名" show-overflow-tooltip>
                      </el-table-column>
                     </el-table>
                     <el-tag style="margin-left: 5px" slot="reference">{{ item | listenerFilters }}</el-tag>
                   </el-popover>
                </span>
              </el-col>
              <el-col :span="12" v-if="item.listenerForward === 'on'">
                <span style="margin-left: 5px">(R)</span>
                <i style="margin-left: 5px" class="fa fa-share" aria-hidden="true"></i>
                <span style="margin-left: 5px">{{ item.forwardPort }}</span>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="loadBalancerStatus" label="域名状态" width="150">
        <template slot-scope="scope">
          <el-tag :type="getStatusColor(scope.row.loadBalancerStatus)" size="small" disable-transitions>
            {{ scope.row.loadBalancerStatus | statusFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addressType" label="网络类型" width="150">
        <template slot-scope="scope">
          <el-tag :type="getTypeColor(scope.row.addressType)" size="small">
            {{ scope.row.addressType | typeFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="handlerRefresh(scope.row)" :loading="refreshing"
                     :disabled="refreshing">刷新
          </el-button>
          <el-button :type="scope.row.isLinkNginx === 1 ? 'success' : 'info'" plain size="mini"
                     @click="setLinkNginx(scope.row)">{{ scope.row.isLinkNginx === 1 ? '关联Ng' : '不关联Ng' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
  </div>
</template>
<script>

import {
  linkNginx,
  queryAliyunSLBPage,
  querySLBListenerBackendServers,
  refreshSLBListener,
  syncAliyunSLB
} from '@api/cloud/aliyun.slb'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      tableData: [],
      backendServers: '',
      options: {
        stripe: true
      },
      loading: false,
      refreshing: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: '',
        loadBalancerStatus: '',
        addressType: ''
      },
      addressTypeOptions: [{
        value: 'intranet',
        label: '私网'
      }, {
        value: 'internet',
        label: '公网'
      }],
      loadBalancerStatusOptions: [{
        value: 'active',
        label: '运行中'
      }, {
        value: 'inactive',
        label: '已停止'
      }, {
        value: 'locked',
        label: '已锁定'
      }],
      syncLoading: false,
      whiteListImageUrl: require('@/static/icons/white-list.svg'),
      blackListImageUrl: require('@/static/icons/black-list.svg')
    }
  },
  name: 'AliyunSLBMgmtTable',
  mounted () {
    this.fetchData()
    this.initPageSize()
  },
  components: {},
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  filters: {
    statusFilters (status) {
      if (status === 'active') {
        return '运行中'
      }
      if (status === 'inactive') {
        return '已停止'
      }
      if (status === 'locked') {
        return '已锁定'
      }
      return ''
    },
    typeFilters (type) {
      return type === 'intranet' ? '私网' : '公网'
    },
    internetChargeTypeFilters (internetChargeType) {
      return internetChargeType === '3' ? '按带宽计费' : '按流量计费'
    },
    listenerFilters (listener) {
      return listener.listenerProtocol + ':' + listener.listenerPort
    },
    httpsListenerFilters (httpsListenerList) {
      let result = ''
      for (let httpsListener of httpsListenerList) {
        let prefix = httpsListener.serverCertificateType === 1 ? '默认证书: ' : '拓展证书: '
        prefix = prefix + httpsListener.serverCertificateDomain + '<br/>'
        result = result + prefix
      }
      return result
    },
    serverCertificateTypeFilters (serverCertificateType) {
      return serverCertificateType === 1 ? '默认证书' : '拓展证书'
    },
    serverFilters (server) {
      return server.serverIp + ':' + server.port + ' # ' + server.serverName
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
    getAclName (accessControlListener) {
      return accessControlListener.slbAclName
    },
    tableRowClassName ({ row, rowindex }) {
      if (row.loadBalancerStatus === 'active') {
        return ''
      }
      return 'warning-row'
    },
    getTypeColor (type) {
      return type === 'intranet' ? 'success' : ''
    },
    getStatusColor (status) {
      if (status === 'active') {
        return 'success'
      }
      if (status === 'inactive') {
        return 'danger'
      }
      if (status === 'locked') {
        return 'warning'
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
    onCopy (e) {
      // this.queryParam.queryName = e.text
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'loadBalancerStatus': this.queryParam.loadBalancerStatus === '' ? '-1' : this.queryParam.loadBalancerStatus,
        'addressType': this.queryParam.addressType === '' ? '-1' : this.queryParam.addressType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryAliyunSLBPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    handlerSync () {
      this.$confirm('确定全量同步SLB吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncLoading = true
        setTimeout(() => {
          syncAliyunSLB()
            .then(res => {
              this.$message({
                message: '后台同步数据中',
                type: 'success'
              })
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
    setLinkNginx (row) {
      linkNginx(row.id).then(res => {
        this.fetchData()
        this.$message({
          type: 'success',
          message: '设置成功!'
        })
        this.fetchData()
      })
    },
    getBackendServer (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      querySLBListenerBackendServers(row.loadBalancerId)
        .then(res => {
          row.backendServers = res.body
        })
    },
    handlerRefresh (row) {
      this.refreshing = true
      refreshSLBListener(row.loadBalancerId).then(res => {
        this.fetchData()
        this.$message({
          type: 'success',
          message: '刷新成功!'
        })
        this.fetchData()
        this.refreshing = false
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

.el-table .warning-row {
  background: oldlace;
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
