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
          <el-col :span="4">
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
          <el-col :span="4">
            <el-select v-model="queryParam.envType" clearable placeholder="环境">
              <el-option
                v-for="item in envTypeOptions"
                :key="item.id"
                :label="item.envName"
                :value="item.envType">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
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
            <el-button type="primary" plain size="mini" @click="addItem(scope.row)">导入</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- tag编辑-->
      <el-dialog :title="dialogTagForm.title"
                 :visible.sync="dialogTagForm.visible">
        <el-form :model="tagForm">
          <el-transfer v-model="tagForm.serverTag"
                       :props="{ key: 'id', label: 'tagKey' }"
                       :data="tagForm.tagOptions"
                       :titles="['所有标签', '服务器标签']">
          </el-transfer>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogTagForm.visible = false">关闭</el-button>
          <el-button type="primary" @click="saveTag">确定</el-button>
        </div>
      </el-dialog>
      <!-- tag编辑-->
    </template>
  </d2-container>
</template>

<script>
  // Filters
  import { getLoginTypeText, getMonitorStatusText, getMonitorStatusType, getServerTypeText } from '@/filters/server.js'
  // API
  import { queryEnvPage } from '@api/env/env.js'
  import { queryBusinessTag, queryTagPage, updateTagBusiness } from '@api/tag/tag.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'
  // eslint-disable-next-line no-unused-vars
  import { queryServerPage, addServer, updateServer, deleteServerById } from '@api/server/server.js'

  export default {
    data () {
      return {
        tagForm: {
          serverId: '',
          serverTag: [],
          tagOptions: []
        },
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogTagForm: {
          visible: false,
          title: '编辑标签'
        },
        tableData: [],
        options: {
          stripe: true
        },
        formOptions: {
          labelWidth: '80px',
          labelPosition: 'left',
          saveLoading: false
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
          tagKey: ''
        },
        title: '服务器信息',
        envTypeOptions: [],
        serverGroupOptions: [],
        businessType: 1
      }
    },
    mounted () {
      this.fetchData()
      this.getEnvType()
    },
    filters: {
      getLoginTypeText,
      getMonitorStatusText,
      getMonitorStatusType,
      getServerTypeText
    },
    methods: {
      getServerTag () {
        queryBusinessTag(this.businessType, this.tagForm.businessId, '')
          .then(res => {
            this.tagForm.serverTag = []
            for (var index = 0; index < res.body.length; index++) {
              this.tagForm.serverTag.push(res.body[index].id)
            }
          })
      },
      getEditTag () {
        queryTagPage('', 1, 100)
          .then(res => {
            this.tagForm.tagOptions = res.body.data
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
        this.dialogTagForm.visible = true
        this.tagForm.businessId = row.id
        this.getServerTag()
        this.getEditTag()
      },
      addItem () {
        this.dialogForm.operationType = true
        this.dialogForm.visible = true
        this.form = {
          id: '',
          groupId: '',
          resourceName: '',
          comment: '',
          needAuth: 1
        }
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      saveTag () {
        setTimeout(() => {
          var requestBody = {
            'businessType': this.businessType,
            'businessId': this.tagForm.businessId,
            'tagIds': this.tagForm.serverTag
          }
          updateTagBusiness(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.dialogForm.visible = false
              this.fetchData()
            })
        }, 600)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryServerPage(
          this.queryParam.name, this.queryParam.serverGroupId, this.queryParam.queryIp, this.queryParam.envType, this.pagination.currentPage, this.pagination.pageSize)
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
