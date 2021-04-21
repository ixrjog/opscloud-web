<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="20">
      <el-input v-model="queryParam.queryName" @change="fetchData" placeholder="关键字查询" class="input"/>
      <el-button plain size="mini" @click="fetchData" class="button">查询</el-button>
      <el-button plain size="mini" @click="handlerAdd" class="button">新增</el-button>
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
                      width="1000" height="600"></editor>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="instanceName" label="实例名称"></el-table-column>
      <el-table-column prop="instanceType" label="实例类型"></el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
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
    <nginx-custom-instance-dialog ref="nginxCustomInstanceDialog" :formStatus="formStatus"
                                       @closeDialog="fetchData">
    </nginx-custom-instance-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  delNginxCustomInstance,
  previewNginxCustomInstance, pushNginxCustomConf,
  queryNginxCustomInstancePage,
  syncNginxCustomConf
} from '@api/nginx/nginx.custom'
import NginxCustomInstanceDialog from '@/components/opscloud/nginx/NginxCustomInstanceDialog'

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
        id: '',
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
  name: 'NginxCustomInstanceTable',
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
    NginxCustomInstanceDialog
  },
  filters: {
    backEndTypeFilters (backEndType) {
      if (backEndType === 1) {
        return '服务器'
      }
      if (backEndType === 2) {
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
    getUrl (listenerPort) {
      return '116.62.142.248:' + listenerPort
    },
    handlerAdd () {
      let data = {
        instanceName: '',
        instanceType: 'server',
        remark: '',
        instanceContent: ''
      }
      this.formStatus.isUpdate = false
      this.formStatus.visible = true
      this.$refs.nginxCustomInstanceDialog.initData(data)
    },
    getConfContent (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      previewNginxCustomInstance(row)
        .then(res => {
          row.previewConf = res.body
        })
    },
    handlerSync () {
      syncNginxCustomConf()
        .then(res => {
          this.$message.success('Nginx配置同步中……')
        })
    },
    handlerEdit (row) {
      let data = {
        id: row.id,
        instanceName: row.instanceName,
        instanceType: row.instanceType,
        remark: row.remark,
        instanceContent: row.instanceContent
      }
      this.formStatus.isUpdate = true
      this.formStatus.visible = true
      this.$refs.nginxCustomInstanceDialog.initData(data)
    },
    handlerConfPush (row) {
      pushNginxCustomConf(row.instanceName)
        .then(res => {
          this.$message.success('Nginx配置推送中……')
        })
    },
    handlerDel (row) {
      delNginxCustomInstance(row.id)
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
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryNginxCustomInstancePage(requestBody)
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
