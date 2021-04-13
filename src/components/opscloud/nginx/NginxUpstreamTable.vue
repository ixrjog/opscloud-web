<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="20">
      <el-input v-model="queryParam.queryName" placeholder="关键字查询" class="input"/>
      <el-select v-model.trim="queryParam.serverGroupId" filterable clearable class="select"
                 remote reserve-keyword placeholder="搜索服务器组" :remote-method="getServerGroup" :loading="loading">
        <el-option
          v-for="item in serverGroupOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-button @click="fetchData" plain class="button" size="mini">查询</el-button>
      <el-button @click="handlerAdd" plain class="button" size="mini">新增</el-button>
      <el-popconfirm title="确定同步所有配置文件吗？" @onConfirm="handlerSync()">
        <el-button size="mini" slot="reference" plain class="button">同步</el-button>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading" @expand-change="getConfContent">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="配置文件">
              <editor v-model="props.row.previewConf" @init="editorInit" lang="yaml" theme="kuroir"
                      width="800" height="150"></editor>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="backendName" label="名称"></el-table-column>
      <el-table-column label="后端类型">
        <template slot-scope="scope">
          <el-tag style="margin-left: 5px">{{ scope.row.backendType | backendTypeFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="healthCheckPath" label="健康检查路径" show-overflow-tooltip></el-table-column>
      <el-table-column label="管理配置" width="400">
        <template slot-scope="scope">
          <div v-for="(value,key) in scope.row.confMap" :key="key">
            <el-row v-if="JSON.stringify(value) !== '[]'">
              <el-col :span="5">
                <el-tag>{{ key }}</el-tag>
              </el-col>
              <el-col :span="10">
                <el-row v-for="(item,index) in value" :key="index">
                  <span>{{ item }}</span>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" size="mini" @click="handlerEdit(scope.row)">
            编辑
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-position">
                <el-popconfirm title="确定推送配置文件吗？" @onConfirm="handlerConfPush(scope.row)">
                  <el-button slot="reference" type="text" style="margin-left: 5px">推送配置</el-button>
                </el-popconfirm>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete">
                <el-popconfirm title="确定删除吗？" @onConfirm="handlerDel(scope.row)">
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
    <nginx-upstream-dialog ref="nginxUpstreamDialog" :formStatus="formStatus" @closeDialog="fetchData">
    </nginx-upstream-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import NginxUpstreamDialog from '@/components/opscloud/nginx/NginxUpstreamDialog'
import {
  delUpstream,
  previewUpstream,
  pushUpstreamConf,
  queryUpstreamPage,
  syncUpstreamConf
} from '@api/nginx/nginx.upstream'
import { queryServerGroupById, queryServerGroupPage } from '@api/server/server.group'
import { queryServerByServerGroup } from '@api/server/server'
import { queryEnvPage } from '@api/env/env'

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
        serverGroupId: '',
        queryName: ''
      },
      formPreviewStatus: {
        visible: false,
        labelWidth: '150px',
        title: '配置文件预览',
        lang: 'python'
      },
      serverGroupOptions: []
    }
  },
  name: 'NginxUpstreamTable',
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
    NginxUpstreamDialog
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
    initData (id) {
      this.queryParam.id = id
      this.fetchData()
    },
    handlerAdd () {
      let data = {
        id: '',
        backendType: 1,
        backendPort: '',
        remark: '',
        serverGroupId: '',
        needHealthCheck: false,
        healthCheckPath: '/webStatus'
      }
      this.formStatus.isUpdate = false
      this.formStatus.visible = true
      this.$refs.nginxUpstreamDialog.initData(data)
    },
    getServerGroup (queryName) {
      queryServerGroupPage(queryName, '', 1, 20)
        .then(res => {
          this.serverGroupOptions = res.body.data
        })
    },
    handlerSync () {
      syncUpstreamConf()
        .then(res => {
          this.$message.success('Nginx配置推送中……')
        })
    },
    handlerEdit (row) {
      let data = {
        id: row.id,
        backendType: row.backendType,
        backendPort: row.backendPort,
        remark: row.remark,
        serverId: '',
        envType: '',
        needHealthCheck: row.needHealthCheck,
        healthCheckPath: row.healthCheckPath,
        serverGroupId: row.serverGroupId
      }
      this.formStatus.isUpdate = true
      queryServerGroupById(row.serverGroupId)
        .then(res => {
          let serverGroupOptions = []
          serverGroupOptions.push(res.body)
          this.$refs.nginxUpstreamDialog.initServerGroup(serverGroupOptions)
        })
      if (row.backendType === 1) {
        let requestBody = {
          'serverGroupId': row.serverGroupId
        }
        queryServerByServerGroup(requestBody)
          .then(res => {
            data.serverId = row.backendLinkKey
            this.$refs.nginxUpstreamDialog.initServer(res.body)
          })
      }
      if (row.backendType === 2) {
        queryEnvPage('', '', 1, 20)
          .then(res => {
            data.envType = row.backendLinkKey
            this.$refs.nginxUpstreamDialog.initEnvType(res.body.data)
          })
      }
      this.$refs.nginxUpstreamDialog.initData(data)
      this.formStatus.visible = true
    },
    handlerConfPush (row) {
      pushUpstreamConf(row.backendName)
        .then(res => {
          this.$message.success('Nginx配置推送中……')
        })
    },
    handlerDel (row) {
      delUpstream(row.id)
        .then(res => {
          // 返回数据
          this.$message.success('删除成功')
          this.fetchData()
        })
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    getConfContent (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      previewUpstream(row)
        .then(res => {
          row.previewConf = res.body
        })
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'serverGroupId': this.queryParam.serverGroupId === '' ? -1 : this.queryParam.serverGroupId,
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryUpstreamPage(requestBody)
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

.select {
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
