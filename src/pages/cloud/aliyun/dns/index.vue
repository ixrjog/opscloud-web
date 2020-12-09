<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-select v-model.trim="queryParam.domainName" filterable clearable remote reserve-keyword placeholder="搜索域名"
                     class="input" :remote-method="getDomain">
            <el-option
              v-for="item in domainOptions"
              :key="item.id"
              :label="item.domainName"
              :value="item.domainName">
            </el-option>
          </el-select>
          <el-input v-model.trim="queryParam.queryName" clearable placeholder="输入关键字查询" class="searchBarStyle"/>
          <el-select v-model="queryParam.recordType" clearable placeholder="记录类型" class="searchBarStyle">
            <el-option
              v-for="item in recordTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <span style="float: left">{{ item.value }}</span>
              <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.label }}</span>
            </el-option>
          </el-select>
          <el-select v-model="queryParam.recordStatus" clearable placeholder="状态" class="searchBarStyle">
            <el-option
              v-for="item in recordStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button @click="fetchData" class="searchBarStyle">查询</el-button>
          <el-popconfirm
            title="确定全量同步DNS解析吗？" @onConfirm="handleSync"
          >
            <el-button slot="reference" class="searchBarStyle" :loading="syncLoading" :disabled="syncLoading">同步
            </el-button>
          </el-popconfirm>
          <el-button @click="addItem" class="searchBarStyle">新增记录</el-button>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" :row-class-name="tableRowClassName">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="完整域名">
                <!--                <span>{{ getFullDomain(props.row) }}</span>-->
                <el-tooltip effect="dark" content="点击跳转" placement="right">
                  <el-link :href="getUrl(props.row)" target="_blank" :underline="false">
                    {{ getFullDomain(props.row) }}
                  </el-link>
                </el-tooltip>
                <el-tooltip effect="dark" content="点击复制" placement="right">
                  <span v-clipboard:copy="getUrl(props.row)" v-clipboard:success="onCopy"
                        v-clipboard:error="onError">
                  <i style="margin-left: 5px" class="el-icon-copy-document"></i>
                </span>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="解析记录ID">
                <span>{{ props.row.recordId }}</span>
              </el-form-item>
              <el-form-item label="TTL">
                <span>{{ props.row.recordTtl }}</span>
              </el-form-item>
              <el-form-item label="解析线路">
                <span>{{ props.row.recordLine }}</span>
              </el-form-item>
              <el-form-item label="负载均衡权重" v-show="props.row.recordWeight === ''">
                <span>{{ props.row.recordWeight }}</span>
              </el-form-item>
              <el-form-item label="域名备注" v-show="props.row.remark === ''">
                <span>{{ props.row.remark }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="domainName" label="域名" width="250">
          <template slot-scope="scope">
            <el-row>
              <span>{{ scope.row.domainName }}</span>
              <el-tooltip effect="dark" content="点击复制" placement="right">
                <span v-clipboard:copy="scope.row.domainName" v-clipboard:success="onCopy"
                      v-clipboard:error="onError">
                <i style="margin-left: 5px" class="el-icon-copy-document"></i>
                </span>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="recordType" label="记录类型" width="150"></el-table-column>
        <el-table-column prop="recordRr" label="主机记录" width="250">
          <template slot-scope="scope">
            <el-row>
              <span>{{ scope.row.recordRr }}</span>
              <el-tooltip effect="dark" content="点击复制" placement="right">
                <span v-clipboard:copy="scope.row.recordRr" v-clipboard:success="onCopy"
                      v-clipboard:error="onError">
                <i style="margin-left: 5px" class="el-icon-copy-document"></i>
                </span>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="记录值" width="500">
          <template slot-scope="scope">
            <el-row>
              <span>{{ scope.row.recordValue }}</span>
              <el-tooltip effect="dark" content="点击复制" placement="right">
                <span v-clipboard:copy="scope.row.recordValue" v-clipboard:success="onCopy"
                      v-clipboard:error="onError">
                <i style="margin-left: 5px" class="el-icon-copy-document"></i>
                </span>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="recordStatus" label="状态">
          <template slot-scope="scope">
            <el-tag :type="getColor(scope.row.recordStatus)" size="small" disable-transitions>
              {{ scope.row.recordStatus | recordStatusFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
            <el-button :type="scope.row.recordStatus === 'ENABLE' ? 'warning' : 'success'" plain size="mini"
                       @click="setRecordStatus(scope.row)">{{ scope.row.recordStatus === 'ENABLE' ? '暂停' : '启用' }}
            </el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <aliyun-domain-record-dialog :formStatus="formDomainRecordStatus" ref="domainRecordDialog"
                                   @closeDomainRecordDialog="fetchData"></aliyun-domain-record-dialog>
    </template>
  </d2-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  queryAliyunDNSPage,
  syncAliyunDomainRecord,
  delDomainRecord,
  domainRecordStatusUpdate
} from '@api/cloud/aliyun.dns'
import { queryAliyunDomainPage } from '@api/cloud/aliyun.domain'
import AliyunDomainRecordDialog from '@/components/opscloud/aliyun/dns/AliyunDomainRecordDialog'

export default {
  data () {
    return {
      title: '域名解析',
      syncLoading: false,
      queryParam: {
        domainName: '',
        queryName: '',
        recordType: '',
        recordStatus: ''
      },
      tagColorType: 'success',
      domainOptions: [],
      recordTypeOptions: [
        {
          value: 'A',
          label: '将域名指向IPv4地址格式'
        },
        {
          value: 'CNAME',
          label: '将域名指向另外一个域名'
        },
        {
          value: 'TXT',
          label: '文本长度限制512'
        },
        {
          value: 'REDIRECT_URL',
          label: '显性URL转发'
        },
        {
          value: 'FORWARD_URL',
          label: '隐性URL转发'
        }
      ],
      recordStatusOptions: [
        {
          value: 'ENABLE',
          label: '正常'
        },
        {
          value: 'DISABLE',
          label: '暂停'
        }
      ],
      tableData: [],
      formSubtaskStatus: {
        visible: false
      },
      loading: false,
      formDomainRecordStatus: {
        visible: false,
        labelWidth: '80px',
        isUpdate: false
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  filters: {
    recordStatusFilters (recordStatus) {
      return recordStatus === 'ENABLE' ? '正常' : '暂停'
    },
    fullDomainFilters (row) {
      if (row.recordRr === '@') {
        return row.domainName
      }
      if (row.recordRr === '_dnsauth') {
        return row.domainName
      }
      return row.recordRr + '.' + row.domainName
    }
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.initPageSize()
    this.fetchData()
    this.getDomain()
  },
  components: {
    AliyunDomainRecordDialog
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
    getUrl (row) {
      return 'https://' + this.getFullDomain(row)
    },
    getFullDomain (row) {
      if (row.recordRr === '@') {
        return row.domainName
      }
      if (row.recordRr === '_dnsauth') {
        return row.domainName
      }
      return row.recordRr + '.' + row.domainName
    },
    initPageSize () {
      if (typeof (this.info.pageSize) !== 'undefined') {
        this.pagination.pageSize = this.info.pageSize
      }
    },
    tableRowClassName ({ row, rowindex }) {
      if (row.recordStatus === 'ENABLE') {
        return ''
      }
      return 'warning-row'
    },
    getDomain (queryName) {
      let requestBody = {
        'domainName': queryName,
        'isActive': 1,
        'page': 1,
        'length': 20
      }
      queryAliyunDomainPage(requestBody)
        .then(res => {
          this.domainOptions = res.body.data
        })
    },
    getColor (recordStatus) {
      return recordStatus === 'ENABLE' ? 'success' : 'danger'
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'domainName': this.queryParam.domainName,
        'queryName': this.queryParam.queryName,
        'recordType': this.queryParam.recordType,
        'recordStatus': this.queryParam.recordStatus,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryAliyunDNSPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    addItem () {
      this.formDomainRecordStatus.visible = true
      this.formDomainRecordStatus.isUpdate = false
      let domainRecordData = {
        recordId: '',
        domainName: '',
        recordType: '',
        recordRr: '',
        recordValue: ''
      }
      this.$refs.domainRecordDialog.initData(domainRecordData)
    },
    editItem (row) {
      this.formDomainRecordStatus.visible = true
      this.formDomainRecordStatus.isUpdate = true
      let domainRecordData = {
        recordId: row.recordId,
        domainName: row.domainName,
        recordType: row.recordType,
        recordRr: row.recordRr,
        recordValue: row.recordValue
      }
      this.$refs.domainRecordDialog.initData(domainRecordData)
    },
    setRecordStatus (row) {
      this.$confirm('此操作将变更当前配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let requestBody = {
          'recordId': row.recordId,
          'recordStatus': row.recordStatus
        }
        domainRecordStatusUpdate(requestBody).then(res => {
          this.fetchData()
          this.$message({
            type: 'success',
            message: '设置成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消变更'
        })
      })
    },
    delItem (row) {
      this.$confirm('此操作将删除当前配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delDomainRecord(row.recordId).then(res => {
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
    handleSync () {
      this.syncLoading = true
      setTimeout(() => {
        syncAliyunDomainRecord()
          .then(res => {
            this.$message({
              message: '后台同步数据中',
              type: 'success'
            })
            this.fetchData()
            this.syncLoading = false
          })
      }, 300)
    },
    handleDialogCancel (done) {
      this.$message({
        message: '取消保存',
        type: 'warning'
      })
      done()
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    onCopy (e) {
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    }
  }
}
</script>

<style scoped>
.input {
  margin-left: 10px;
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
