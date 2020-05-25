<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-row :gutter="24" style="margin-bottom: 5px">
        <el-input v-model.trim="queryParam.username" placeholder="用户名查询" class="input-bar"/>
        <el-select v-model="queryParam.isClosed" clearable placeholder="会话" class="select-bar">
          <el-option
            v-for="item in closeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button @click="fetchData" class="buuton">查询</el-button>
      </el-row>
      <el-row :gutter="24" style="margin-bottom: 5px">
        <el-col :span="12">
          <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline class="table-expand">
                  <el-form-item label="会话id">
                    <span>{{ props.row.sessionId }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="sessionInstances" label="会话实例">
              <template slot-scope="prop">
                <el-tag :type="prop.row.sessionInstances.length === 0 ? 'info': ''">{{ prop.row.sessionInstances ===
                  null ? 0 : prop.row.sessionInstances.length }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isClosed" label="会话状态">
              <template slot-scope="prop">
                <el-tag :type="prop.row.isClosed ? 'info': 'success'">{{ prop.row.isClosed ? '已关闭' : '活跃' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="closeTime" label="关闭时间"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <!--            <el-button type="primary" plain size="mini" @click="editTag(scope.row)">标签</el-button>-->
                <!--            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>-->
                <el-button type="primary" plain size="mini" @click="handlerSetSessionInstances(scope.row)">查看
                </el-button>
                <!--            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>-->
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="paginationCurrentChange"
                         layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                         :page-size="pagination.pageSize">
          </el-pagination>
        </el-col>
        <el-col :span="12">
          <el-table :data="sessionInstances" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline class="table-expand">
                  <el-form-item label="会话id">
                    <span>{{ props.row.sessionId }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="instanceId" label="实例id"></el-table-column>
            <el-table-column prop="hostIp" label="主机">
            </el-table-column>
            <el-table-column prop="isClosed" label="会话状态">
              <template slot-scope="props">
                <el-tag :type="props.row.isClosed ? 'info': 'success'">{{ props.row.isClosed ? '已关闭' : '活跃' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="closeTime" label="关闭时间"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="primary" plain size="mini" v-if="!scope.row.auditLog.isEmpty"
                           @click="handlerPreviewAuditLog(scope.row)">日志
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <PreviewTermAuditLogDialog ref="previewTermAuditLogDialog" :formStatus="formStatus"></PreviewTermAuditLogDialog>
    </template>
  </d2-container>
</template>

<script>

  import PreviewTermAuditLogDialog from '@/components/opscloud/dialog/PreviewTermAuditLogDialog'
  // API
  import { querySessionPage } from '@api/term/term.session.js'

  const closeOptions = [{
    value: false,
    label: '活跃会话'
  }, {
    value: true,
    label: '已关闭会话'
  }]

  export default {
    data () {
      return {
        formStatus: {
          visible: false
        },
        tableData: [],
        sessionInstances: [],
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          uername: '',
          isClosed: null,
          extend: 1
        },
        title: '终端会话管理',
        closeOptions: closeOptions
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      PreviewTermAuditLogDialog
    },
    methods: {
      handlerPreviewAuditLog (row) {
        this.$refs.previewTermAuditLogDialog.initData(row.id)
        this.formStatus.visible = true
      },
      handlerSetSessionInstances (row) {
        this.sessionInstances = row.sessionInstances
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        let requestBody = Object.assign({}, this.queryParam)
        requestBody.page = this.pagination.currentPage
        requestBody.length = this.pagination.pageSize
        querySessionPage(requestBody)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
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

  .input-bar {
    display: inline-block;
    max-width: 200px;
    margin-left: 10px;
  }

  .select-bar {
    margin-left: 5px;
  }

  .buuton {
    margin-left: 5px;
  }
</style>
