<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.name" placeholder="服务器名称"/>
          </el-col>
          <el-col :span="4">
            <el-input v-model="queryParam.queryIp" placeholder="ip"/>
          </el-col>
          <el-col :span="3">
            <el-select v-model="queryParam.serverGroupId" filterable clearable
                       remote reserve-keyword placeholder="搜索服务器组" :remote-method="getServerGroup" :loading="loading">
              <el-option
                v-for="item in serverGroupOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select v-model="queryParam.envType" clearable placeholder="环境">
              <el-option
                v-for="item in envTypeOptions"
                :key="item.id"
                :label="item.envName"
                :value="item.envType">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="queryParam.tagId" filterable clearable remote reserve-keyword
              placeholder="请输入关键词搜索标签" :remote-method="getTag" :loading="loading">
              <el-option
                v-for="item in tagOptions"
                :key="item.id"
                :label="item.tagKey"
                :value="item.id">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="addItem">新增</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="服务器类型">
                <span>{{props.row.serverType | getServerTypeText}}</span>
              </el-form-item>
              <el-form-item label="服务器描述">
                <span>{{ props.row.comment }}</span>
              </el-form-item>
              <el-form-item label="服务器组">
                <span>{{ props.row.serverGroup.name }}</span>
              </el-form-item>
              <el-form-item label="服务器组描述">
                <span>{{ props.row.serverGroup.comment }}</span>
              </el-form-item>
              <el-form-item label="服务器组类型">
                <el-tag disable-transitions :style="{ color: props.row.serverGroup.serverGroupType.color }">
                  {{props.row.serverGroup.serverGroupType.name}}
                </el-tag>
              </el-form-item>
              <el-form-item label="登录类型">
                <span>{{props.row.loginType | getLoginTypeText}}</span>
              </el-form-item>
              <el-form-item label="登录用户">
                <span>{{ props.row.loginUser }}</span>
              </el-form-item>
              <el-form-item label="区">
                <span>{{ props.row.area }}</span>
              </el-form-item>
              <el-form-item label="监控状态">
                <el-tag disable-transitions :type=" props.row.monitorStatus | getMonitorStatusType ">{{
                  props.row.monitorStatus | getMonitorStatusText}}
                </el-tag>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="serialNumber" label="序号" width="60"></el-table-column>
        <el-table-column prop="publicIp" label="公网ip"></el-table-column>
        <el-table-column prop="privateIp" label="私网ip"></el-table-column>
        <el-table-column prop="name" label="环境">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.env.color }">{{scope.row.env.envName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签">
          <template slot-scope="scope">
            <div class="tag-group">
              <el-tag style="margin-left: 5px"
                      v-for="item in scope.row.tags"
                      :key="item.id"
                      :style="{ color: item.color }">
                {{ item.tagKey }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <!--            <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth ===-->
            <!--              0 ? '鉴权' : '不鉴权'}}-->
            <!--            </el-button>-->
            <el-button type="primary" plain size="mini" @click="editTag(scope.row)">标签</el-button>
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- server编辑-->
      <dialogserver :form="formServer" :server="server" @closeServerDialog="fetchData"></dialogserver>
      <!-- server编辑-->
      <!-- tag编辑-->
      <dialogtag :form="formTag" :tag="tag" @closeTagDialog="fetchData"></dialogtag>
      <!-- tag编辑-->
    </template>
  </d2-container>
</template>

<script>
  // Component
  import dialogserver from './dialog.server'
  import dialogtag from '@/components/opscloud/tag/dialog.tag'
  // Filters
  import { getLoginTypeText, getMonitorStatusText, getMonitorStatusType, getServerTypeText } from '@/filters/server.js'
  // API
  import { queryEnvPage } from '@api/env/env.js'
  import { queryBusinessTag, queryTagPage } from '@api/tag/tag.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'
  import { queryServerPage, deleteServerById } from '@api/server/server.js'

  export default {
    data () {
      return {
        formServer: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增服务器配置',
          updateTitle: '更新服务器配置'
        },
        server: {},
        tag: {},
        formTag: {
          visible: false,
          title: '编辑标签'
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
          name: '',
          serverGroupId: '',
          queryIp: '',
          envType: '',
          tagId: ''
        },
        title: '服务器信息',
        tagOptions: [],
        envTypeOptions: [],
        serverGroupOptions: [],
        businessType: 1
      }
    },
    mounted () {
      this.fetchData()
      this.getEnvType()
      this.getTag('')
    },
    components: {
      dialogserver,
      dialogtag
    },
    filters: {
      getLoginTypeText,
      getMonitorStatusText,
      getMonitorStatusType,
      getServerTypeText
    },
    methods: {
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
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteServerById(row.id).then(res => {
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
      editTag (row) {
        this.formTag.visible = true
        this.tag = {
          businessId: row.id,
          businessType: this.businessType,
          serverTag: [],
          tagOptions: []
        }
        queryTagPage('', 1, 100)
          .then(res => {
            this.tag.tagOptions = res.body.data
          })
        queryBusinessTag(this.businessType, this.tag.businessId, '')
          .then(res => {
            this.tag.serverTag = []
            for (var index = 0; index < res.body.length; index++) {
              this.tag.serverTag.push(res.body[index].id)
            }
          })
        this.formTag.visible = true
      },
      editItem (row) {
        // form
        this.formServer.visible = true
        this.formServer.operationType = false
        // server
        this.server = Object.assign({}, row)
        this.server.envTypeOptions = this.envTypeOptions
        this.server.serverGroupOptions = []
        this.server.serverGroupOptions.push(row.serverGroup)
      },
      addItem () {
        this.formServer.operationType = true
        this.formServer.visible = true
        this.server = {
          serverGroup: '',
          id: '',
          name: '',
          serverGroupId: '',
          loginType: 0,
          loginUser: '',
          envType: 4,
          publicIp: '',
          privateIp: '',
          serverType: 0,
          area: '',
          serialNumber: 1,
          monitorStatus: -1,
          comment: '',
          // options
          serverGroupOptions: []
        }
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
        queryServerPage(
          this.queryParam.name, this.queryParam.serverGroupId, this.queryParam.queryIp, this.queryParam.envType, this.queryParam.tagId, this.pagination.currentPage, this.pagination.pageSize)
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
</style>
