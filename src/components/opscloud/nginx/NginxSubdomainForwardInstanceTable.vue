<template>
  <div v-show="queryParam.subdomainId !== ''">
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
      <el-input v-model="queryParam.queryName" placeholder="关键字查询" class="input"/>
      <el-button @click="fetchData" class="button">查询</el-button>
      <el-button @click="handlerAdd" class="button">新增</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading" @expand-change="getConfContent">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="配置文件">
              <editor v-model="props.row.previewConf" @init="editorInit" lang="yaml" theme="kuroir"
                      width="800" height="300"></editor>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="子域名" width="320">
        <template slot-scope="scope">
          <el-row>
            <el-tooltip effect="dark" content="点击跳转" placement="right">
              <el-link :href="getUrl(scope.row)" target="_blank">{{ scope.row.subdomain }}</el-link>
            </el-tooltip>
            <el-tooltip effect="dark" content="点击复制" placement="right">
              <span v-clipboard:copy="scope.row.subdomain" v-clipboard:success="onCopy"
                    v-clipboard:error="onError" style="float: right">
                <i class="el-icon-copy-document"></i>
              </span>
            </el-tooltip>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="关联SLB" width="250">
        <template slot-scope="scope">
          <el-tag>
            {{ scope.row.loadBalance.loadBalancerName + ':' + scope.row.loadBalance.address }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="upstream名称">
        <template slot-scope="scope">
          <span>{{ scope.row.upstream.backendName }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" size="mini" @click="handlerRowEdit(scope.row)">
            编辑
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-truck">
                <el-popconfirm title="确定推送DNS吗？" @onConfirm="handlerRowDNSPush(scope.row)">
                  <el-button slot="reference" type="text" style="margin-left: 5px">配置解析</el-button>
                </el-popconfirm>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-position">
                <el-popconfirm title="确定推送配置文件吗？" @onConfirm="handlerRowConfPush(scope.row)">
                  <el-button slot="reference" type="text" style="margin-left: 5px">推送配置</el-button>
                </el-popconfirm>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete">
                <el-popconfirm title="确定删除吗？" @onConfirm="handlerRowDel(scope.row)">
                  <el-button slot="reference" type="text" style="margin-left: 5px;color: #F56C6C" size="mini">删除配置
                  </el-button>
                </el-popconfirm>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <nginx-subdomain-forward-instance-dialog ref="nginxSubdomainForwardDialog" :formStatus="formStatus"
                                             @closeDialog="fetchData" @handlerInstanceAdd="handlerInstanceAdd">
    </nginx-subdomain-forward-instance-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  querySubdomainForwardInstancePage,
  delSubdomainForwardInstance,
  previewSubdomainForwardInstance,
  querySubdomainForwardPage,
  pushDomainRecord,
  pushSubdomainConf
} from '@api/nginx/nginx.subdomain.js'
import NginxSubdomainForwardInstanceDialog from '@/components/opscloud/nginx/NginxSubdomainForwardInstanceDialog'
import { queryServerGroupById } from '@api/server/server.group'
import { queryUpstreamPage } from '@api/nginx/nginx.upstream'

export default {
  data () {
    return {
      tableData: [],
      loading: false,
      formStatus: {
        visible: false,
        isUpdate: true
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        subdomainId: '',
        queryName: ''
      },
      formPreviewStatus: {
        visible: false,
        labelWidth: '150px',
        title: '配置文件预览',
        lang: 'python'
      }
    }
  },
  name: 'NginxSubdomainForwardInstanceTable',
  mounted () {
    this.initPageSize()
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  components: {
    editor: require('vue2-ace-editor'),
    NginxSubdomainForwardInstanceDialog
  },
  filters: {
    backendTypeFilters (backendType) {
      if (backendType === 1) {
        return '服务器'
      }
      if (backendType === 2) {
        return '服务器组'
      }
      return ''
    }
  },
  methods: {
    ...mapActions({
      setPageSize: 'd2admin/user/set'
    }),
    editorInit: function (ed) {
      require('brace/ext/language_tools')
      require('brace/mode/yaml')
      require('brace/theme/chrome')
      require('brace/theme/kuroir')
      require('brace/snippets/yaml')
      ed.setReadOnly(true)
    },
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
    getConfContent (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      previewSubdomainForwardInstance(row)
        .then(res => {
          row.previewConf = res.body
        })
    },
    getUrl (row) {
      return 'http://' + row.subdomain
    },
    initData (subdomainId) {
      this.queryParam.subdomainId = subdomainId
      this.fetchData()
    },
    handlerAdd () {
      let requestBody = {
        'id': this.queryParam.subdomainId,
        'page': 1,
        'length': 10
      }
      querySubdomainForwardPage(requestBody)
        .then(res => {
          let data = {
            subdomainId: this.queryParam.subdomainId,
            recordRr: '',
            backendId: '',
            isWebSocket: false,
            serverGroupId: '',
            proxyTimeout: 60,
            locationParamList: '',
            remark: '',
            loadBalanceOptions: res.body.data[0].loadBalanceList,
            domainName: res.body.data[0].domainName
          }
          this.formStatus.isUpdate = false
          this.formStatus.visible = true
          this.$refs.nginxSubdomainForwardDialog.initData(data)
        })
    },
    handlerPush () {
      delSubdomainForwardInstance(this.queryParam.logId)
        .then(res => {
          // 返回数据
          if (res.success) {
            this.$message({
              message: '推送成功',
              type: 'success'
            })
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    handlerRowDNSPush (row) {
      pushDomainRecord(row)
        .then(res => {
          // 返回数据
          if (res.success) {
            this.$message({
              message: '推送DNS解析成功',
              type: 'success'
            })
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    handlerRowConfPush (row) {
      this.$message('Nginx配置推送中')
      pushSubdomainConf(row)
        .then(res => {
          // 返回数据
          if (res.success) {
            this.$message({
              message: '推送Nginx配置成功',
              type: 'success'
            })
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    handlerRowEdit (row) {
      let requestBody = {
        'id': this.queryParam.subdomainId,
        'page': 1,
        'length': 10
      }
      querySubdomainForwardPage(requestBody)
        .then(res => {
          let data = {
            subdomainId: this.queryParam.subdomainId,
            recordRr: row.recordRr,
            serverGroupId: row.serverGroupId,
            backendId: row.upstream.id,
            isWebSocket: row.isWebSocket,
            proxyTimeout: row.proxyTimeout,
            locationParamList: row.locationParamList,
            loadBalanceId: row.loadBalance.loadBalancerId,
            remark: row.remark,
            loadBalanceOptions: res.body.data[0].loadBalanceList,
            domainName: res.body.data[0].domainName
          }
          queryServerGroupById(row.serverGroupId)
            .then(res => {
              let serverGroupOptions = []
              serverGroupOptions.push(res.body)
              this.$refs.nginxSubdomainForwardDialog.initServerGroup(serverGroupOptions)
            })
          let requestBody = {
            'serverGroupId': row.serverGroupId,
            'queryName': '',
            'page': 1,
            'length': 20
          }
          queryUpstreamPage(requestBody)
            .then(res => {
              this.$refs.nginxSubdomainForwardDialog.initBackend(res.body.data)
            })
          this.formStatus.isUpdate = true
          this.formStatus.visible = true
          this.$refs.nginxSubdomainForwardDialog.initData(data)
        })
    },
    handlerRowDel (row) {
      this.$message('Nginx配置删除中')
      delSubdomainForwardInstance(row.id)
        .then(res => {
          // 返回数据
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.fetchData()
          this.handlerInstanceDel()
        })
    },
    handlerInstanceAdd () {
      this.$emit('handlerInstanceUpdate')
    },
    handlerInstanceDel () {
      this.$emit('handlerInstanceUpdate')
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
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'subdomainId': this.queryParam.subdomainId,
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      querySubdomainForwardInstancePage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>

.input {
  display: inline-block;
  max-width: 200px;
}

.button {
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
  width: 100%;
}
</style>
