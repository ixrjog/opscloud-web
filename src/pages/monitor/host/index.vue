<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="24" style="margin-bottom: 5px">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字查询" class="input"/>
        <el-select v-model.trim="queryParam.serverGroupId" filterable clearable class="select"
                   remote reserve-keyword placeholder="搜索服务器组" :remote-method="getServerGroup" :loading="loading">
          <el-option
            v-for="item in serverGroupOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.envType" clearable placeholder="环境" class="select">
          <el-option
            v-for="item in envTypeOptions"
            :key="item.id"
            :label="item.envName"
            :value="item.envType">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.monitorStatus" clearable placeholder="监控状态" class="select">
          <el-option
            v-for="item in monitorStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.isActive" clearable placeholder="有效" class="select" v-if="false">
          <el-option
            v-for="item in activeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.serverStatus" clearable placeholder="状态" class="select" v-if="false">
          <el-option
            v-for="item in serverStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.tagId" filterable clearable remote reserve-keyword class="select"
                   placeholder="请输入关键词搜索标签" :remote-method="getTag" :loading="loading">
          <el-option
            v-for="item in tagOptions"
            :key="item.id"
            :label="item.tagKey"
            :value="item.id">
          </el-option>
        </el-select>
        <el-button @click="fetchData" class="button">查询</el-button>
        <el-button @click="handlerSyncHostMonitorStatus" class="button" :disabled="monitorStatusSynchronizing"
                   :loading="monitorStatusSynchronizing">同步监控状态
        </el-button>
      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="服务器组">
                <span>{{ props.row.serverGroup.name }}</span>
              </el-form-item>
              <el-form-item label="服务器组类型">
                <el-tag disable-transitions :style="{ color: props.row.serverGroup.serverGroupType.color }">
                  {{ props.row.serverGroup.serverGroupType.name }}
                </el-tag>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="serialNumber" label="序号" width="80" sortable></el-table-column>
        <el-table-column prop="publicIp" label="公网ip" v-if="false"></el-table-column>
        <el-table-column prop="privateIp" label="私网ip" width="150"></el-table-column>
        <el-table-column prop="env" label="环境" width="80">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.env.color }">{{ scope.row.env.envName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模版" width="380">
          <template slot-scope="props">
            <div class="tag-group">
              <span v-for="item in props.row.templates" :key="item.name">
                <el-tag effect="dark" style="margin-left: 5px" :type="item.isActive ? 'success': 'info'">{{ item.name }}</el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="宏" width="200">
          <template slot-scope="props">
            <div class="tag-group">
              <span v-for="item in props.row.macros" :key="item.macro">
                <el-tag effect="dark" style="margin-left: 5px" :type="item.isActive ? 'success': 'info'">{{ item.macro }}&#160;:&#160;{{ item.value }}</el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="监控状态" width="80">
          <template slot-scope="scope">
            <el-tag disable-transitions :type="scope.row.monitorStatus | getMonitorStatusType ">
              {{scope.row.monitorStatus | getMonitorStatusText}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可用" width="80">
          <template slot-scope="scope">
            <el-tag disable-transitions :type="scope.row.agentAvailable | getAvailableTagType">ZBX</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签">
          <template slot-scope="props">
            <div class="tag-group">
              <span v-for="item in props.row.tags" :key="item.id">
                <el-tooltip class="item" effect="light" :content="item.comment" placement="top-start">
                  <el-tag :style="{ color: item.color, marginLeft: '5px' }">{{ item.tagKey }}</el-tag>
                </el-tooltip>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250">
          <template slot-scope="scope">
            <el-button :type="scope.row.monitorStatus === 0 ? 'warning' : 'success'" plain size="mini" @click="handlerSetMonitorHostStatus(scope.row)"
                       style="margin-left: 5px" :loading="scope.row.isSetting"
                       v-if="scope.row.monitorStatus !== -1">{{ scope.row.monitorStatus === 0 ? '禁用' : '启用' }}
            </el-button>

            <el-button type="success" plain size="mini" @click="handlerCreateMonitorHost(scope.row)"
                       style="margin-left: 5px" :loading="scope.row.isCreating"
                       v-if="scope.row.monitorStatus === -1">创建
            </el-button>
            <el-button type="primary" plain size="mini" @click="handlerPushMonitorHost(scope.row)"
                       style="margin-left: 5px" :loading="scope.row.isPushing"
                       v-if="scope.row.monitorStatus !== -1">推送
            </el-button>
            <el-button type="primary" plain size="mini"  style="margin-left: 5px; float: right"  @click="handlerXTerm(scope.row)">登录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- server编辑-->
      <server-dialog :formStatus="formServerStatus" ref="serverDialog" @closeDialog="fetchData"></server-dialog>
      <!-- tag编辑-->
      <tag-transfer-dialog :formStatus="formTagTransferStatus" ref="tagTransferDialog"
                           @closeDialog="fetchData"></tag-transfer-dialog>
      <x-term :formStatus="formXtermStatus" ref="xtermDialog"></x-term>
    </template>
  </d2-container>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  // Component
  import ServerDialog from '@/components/opscloud/dialog/ServerDialog'
  import TagTransferDialog from '@/components/opscloud/dialog/TagTransferDialog'
  // XTerm
  import XTerm from '@/components/opscloud/xterm/XTerm'
  // Filters
  import { getMonitorStatusText, getMonitorStatusType } from '@/filters/server.js'
  import { getAvailableTagType } from '@/filters/monitor.js'
  // API
  import { queryEnvPage } from '@api/env/env.js'
  import { queryTagPage } from '@api/tag/tag.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'
  import { queryMonitorHostPage, syncMonitorHostStatus, createMonitorHost, pushMonitorHost, setMonitorHostStatus } from '@api/monitor/monitor.host.js'

  const monitorStatusOptions = [{
    value: 0,
    label: '启用'
  }, {
    value: 1,
    label: '禁用'
  }, {
    value: -1,
    label: '未监控'
  }]

  const activeOptions = [{
    value: true,
    label: '有效'
  }, {
    value: false,
    label: '无效'
  }]

  const serverStatusOptions = [{
    value: 0,
    label: '离线'
  }, {
    value: 1,
    label: '在线'
  }, {
    value: -1,
    label: '未知'
  }]

  export default {
    data () {
      return {
        formTagTransferStatus: {
          visible: false,
          title: '编辑服务器标签'
        },
        formServerStatus: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增服务器配置',
          updateTitle: '更新服务器配置'
        },
        formXtermStatus: {
          visible: false
        },
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
        queryParam: {
          queryName: '',
          serverGroupId: '',
          envType: '',
          tagId: '',
          monitorStatus: ''
        },
        title: 'Zabbix主机',
        tagOptions: [],
        envTypeOptions: [],
        serverGroupOptions: [],
        businessType: 1,
        activeOptions: activeOptions,
        serverStatusOptions: serverStatusOptions,
        monitorStatusOptions: monitorStatusOptions,
        monitorStatusSynchronizing: false
      }
    },
    mounted () {
      this.initPageSize()
      this.fetchData()
      this.getEnvType()
      this.getTag('')
    },
    computed: {
      ...mapState('d2admin/user', [
        'info'
      ])
    },
    components: {
      ServerDialog,
      TagTransferDialog,
      XTerm
    },
    filters: {
      getMonitorStatusText,
      getMonitorStatusType,
      getAvailableTagType
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
      getTag (tagKey) {
        queryTagPage(tagKey, 1, 100)
          .then(res => {
            this.tagOptions = res.body.data
          })
      },
      getEnvType () {
        queryEnvPage('', '', 1, 20)
          .then(res => {
            this.envTypeOptions = res.body.data
          })
      },
      getServerGroup (queryName) {
        queryServerGroupPage(queryName, '', 1, 20)
          .then(res => {
            this.serverGroupOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      handlerXTerm (row) {
        this.formXtermStatus.visible = true
        this.$refs.xtermDialog.initData(row)
      },
      handlerSyncHostMonitorStatus () {
        this.monitorStatusSynchronizing = true
        syncMonitorHostStatus()
          .then(res => {
            this.$message.success('后台同步数据中')
          })
      },
      handlerCreateMonitorHost (row) {
        row.isCreating = true
        let requestBody = {
          serverId: row.id
        }
        createMonitorHost(requestBody)
          .then(res => {
            row.isCreating = false
            if (res.success) {
              this.$message.success('添加监控主机成功')
              this.fetchData()
            } else {
              this.$message.error(res.msg)
            }
          })
      },
      handlerSetMonitorHostStatus (row) {
        row.isSetting = true
        setMonitorHostStatus(row.id)
          .then(res => {
            row.isSetting = false
            if (res.success) {
              this.$message.success('设置监控主机状态成功')
              this.fetchData()
            } else {
              this.$message.error(res.msg)
            }
          })
      },
      handlerPushMonitorHost (row) {
        row.isPushing = true
        let requestBody = {
          serverId: row.id
        }
        pushMonitorHost(requestBody)
          .then(res => {
            row.isPushing = false
            if (res.success) {
              this.$message.success('推送配置到监控主机成功')
              this.fetchData()
            } else {
              this.$message.error(res.msg)
            }
          })
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
      fetchData () {
        this.loading = true
        let requestBody = Object.assign({}, this.queryParam)
        requestBody.page = this.pagination.currentPage
        requestBody.length = this.pagination.pageSize
        queryMonitorHostPage(requestBody)
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

  .input {
    display: inline-block;
    max-width: 200px;
    margin-left: 10px;
  }

  .select {
    margin-left: 5px;
  }

  .button {
    margin-left: 5px;
  }
</style>
