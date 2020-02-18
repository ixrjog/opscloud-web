<template>
  <d2-container>
    <template>
      <div>
        <h1>资源配置</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-select v-model="queryParam.groupId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading">
              <el-option
                v-for="item in groupOptions"
                :key="item.id"
                :label="item.groupCode"
                :value="item.id">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-input v-model="queryParam.resourceName" placeholder="资源路径"/>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParam.needAuth" clearable placeholder="鉴权">
              <el-option
                v-for="item in authOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="addItem">新增</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="groupCode" label="资源组" ></el-table-column>
        <el-table-column prop="resourceName" label="资源路径" ></el-table-column>
        <el-table-column prop="comment" label="描述" ></el-table-column>
        <el-table-column prop="needAuth" label="鉴权">
          <template slot-scope="scope">
            <el-tag :type="scope.row.needAuth === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.needAuth === 0 ? '不鉴权' : '鉴权'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth === 0 ? '鉴权' : '不鉴权'}}</el-button>
            <el-button type="warning" plain size="mini" @click="updateItem(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage" :page-size="pagination.pageSize">
      </el-pagination>
      <el-dialog :title="dialogForm.operationType ? dialogForm.addTitle : dialogForm.updateTitle"
                 :visible.sync="dialogForm.visible">
        <el-form :model="form">
          <el-form-item label="资源组" :label-width="formLabelWidth">
            <el-select v-model="form.group" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading">
              <el-option
                v-for="item in groupOptions"
                :key="item.id"
                :label="item.groupCode"
                :value="item">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="资源路径" :label-width="formLabelWidth">
            <el-input v-model="form.resourceName" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="鉴权" :label-width="formLabelWidth">
            <el-select v-model="form.needAuth" placeholder="是否鉴权">
              <el-option
                v-for="item in needAuthOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="描述" :label-width="formLabelWidth">
            <el-input v-model="form.comment" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogForm.visible = false">取消</el-button>
          <el-button type="primary" @click="saveInfo">确定</el-button>
        </div>
      </el-dialog>
    </template>
  </d2-container>
</template>

<script>
  import authTag from './authTag'
  // API
  import { queryGroupPage } from '@api/auth/auth.group.js'
  import { queryResourcePage, deleteResourceById, addResource, updateResource, updateResourceNeedAuth } from '@api/auth/auth.resource.js'

  export default {
    data () {
      return {
        form: {
          group: '',
          id: '',
          groupId: '',
          resourceName: '',
          comment: '',
          typeLogo: '',
          needAuth: 1
        },
        dialogImageUrl: '',
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogForm: {
          visible: false,
          addTitle: '新增资源配置',
          updateTitle: '更新资源配置',
          operationType: true
        },
        columns: [
          {
            title: '资源组',
            key: 'groupCode',
            minWidth: '40%'
          },
          {
            title: '资源路径',
            key: 'resourceName',
            minWidth: '40%'
          },
          {
            title: '描述',
            key: 'comment',
            minWidth: '30%'
          },
          {
            title: '鉴权',
            key: 'needAuth',
            component: {
              name: authTag,
              props: {
                myProps: ''
              }
            },
            minWidth: '20%'
          }
        ],
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
          groupId: '',
          groupCode: '',
          resourceName: '',
          needAuth: ''
        },
        authOptions: [{
          value: -1,
          label: '全部'
        }, {
          value: 0,
          label: '不鉴权'
        }, {
          value: 1,
          label: '鉴权'
        }],
        needAuthOptions: [{
          value: 0,
          label: '不鉴权'
        }, {
          value: 1,
          label: '鉴权'
        }],
        groupOptions: []
      }
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      getGroup (groupCode) {
        queryGroupPage(groupCode, 1, 10)
          .then(res => {
            this.groupOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteResourceById(row.id).then(res => {
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
      updateItemNeedAuth (row) {
        var requestBody = {
          'id': row.id,
          'needAuth': row.needAuth === 0 ? 1 : 0
        }
        updateResourceNeedAuth(requestBody)
          .then(res => {
            // 返回数据
            this.$message({
              message: '成功',
              type: 'success'
            })
            this.fetchData()
          })
      },
      updateItem (row) {
        var group = {
          'id': row.groupId,
          'groupCode': row.groupCode
        }
        this.groupOptions = []
        this.groupOptions.push(group)
        this.form = {
          group: group,
          id: row.id,
          groupId: row.groupId,
          resourceName: row.resourceName,
          comment: row.comment,
          needAuth: row.needAuth
        }
        this.dialogForm.operationType = false
        this.dialogForm.visible = true
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = {
            'id': this.form.id,
            'groupId': this.form.group.id,
            'resourceName': this.form.resourceName,
            'comment': this.form.comment,
            'needAuth': this.form.needAuth
          }
          if (this.dialogForm.operationType) {
            addResource(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.dialogForm.visible = false
                this.fetchData()
              })
          } else {
            updateResource(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.dialogForm.visible = false
                this.fetchData()
              })
          }
        }, 600)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryResourcePage(this.queryParam.groupId, this.queryParam.resourceName, this.queryParam.needAuth, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
