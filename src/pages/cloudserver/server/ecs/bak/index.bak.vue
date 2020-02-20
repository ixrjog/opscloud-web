<template>
  <d2-container>
    <template>
      <div>
        <h1>Aliyun:ECS实例管理</h1>
      </div>
      <div>
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.serverName" placeholder="服务器名称"/>
          </el-col>
          <el-col :span="4">
            <el-input v-model="queryParam.queryIp" placeholder="ip"/>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParam.serverStatus" clearable placeholder="状态">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="handleSync">同步</el-button>
          </el-col>
        </el-row>
      </div>
      <div>
        <d2-crud
          ref="d2Crud"
          :columns="columns"
          :data="data"
          :options="options"
          add-title="新增角色"
          :add-template="addTemplate"
          edit-title="修改角色"
          :edit-template="addTemplate"
          :form-options="formOptions"
          @row-add="handleRowAdd"
          @dialog-cancel="handleDialogCancel"
          :rowHandle="rowHandle"
          @row-remove="handleRowRemove"
          @row-edit="handleRowEdit"
          :loading="loading"
          :pagination="pagination"
          @pagination-current-change="paginationCurrentChange">
        </d2-crud>
      </div>
    </template>
  </d2-container>
</template>

<script>
  import serverStatusTag from '../../serverStatusTag'
  // API
  import { queryCloudserverPage, syncCloudserverByKey, deleteCloudserverById } from '@api/cloudserver/server/cloudserver.js'

  export default {
    data () {
      return {
        columns: [
          {
            title: '实例名',
            key: 'instanceName',
            minWidth: '40%'
          },
          {
            title: '实例id',
            key: 'instanceId',
            minWidth: '40%'
          },
          {
            title: '公网ip',
            key: 'publicIp',
            minWidth: '30%'
          },
          {
            title: '私网ip',
            key: 'privateIp',
            minWidth: '30%'
          },
          {
            title: '区',
            key: 'zone',
            minWidth: '30%'
          },
          {
            title: '状态',
            key: 'serverStatus',
            component: {
              name: serverStatusTag,
              props: {
                myProps: ''
              }
            },
            minWidth: '20%'
          }
        ],
        data: [],
        addTemplate: {
          roleName: {
            title: '角色',
            value: ''
          },
          comment: {
            title: '描述',
            value: ''
          },
          workflow: {
            title: '允许工作流申请',
            value: 0,
            component: {
              name: 'el-select',
              options: [
                {
                  label: '允许',
                  value: 1
                },
                {
                  label: '禁止',
                  value: 0
                }]
            }
          }
        },
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
          cloudserverType: 2,
          serverName: '',
          queryIp: '',
          serverStatus: ''
        },
        statusOptions: [{
          value: 0,
          label: '新建(未录入)'
        }, {
          value: 1,
          label: '已录入'
        }, {
          value: 2,
          label: '标记删除'
        }, {
          value: 3,
          label: '服务器表未删除但云服务器已销毁'
        }],
        cloudserverKey: 'AliyunECSCloudserver',
        rowHandle: {
          remove: {
            icon: 'el-icon-delete',
            size: 'mini',
            fixed: 'right',
            confirm: true,
            show (index, row) {
              return true
            }
          },
          edit: {
            icon: 'el-icon-edit',
            type: 'primary',
            size: 'mini',
            fixed: 'left',
            confirm: false
          }
          // custom: [
          //   {
          //     text: '允许/禁止',
          //     type: 'warning',
          //     size: 'mini',
          //     fixed: 'left',
          //     emit: 'workflow-update'
          //   }
          // ]
        }
      }
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      // 普通的新增
      addRow () {
        this.$refs.d2Crud.showDialog({
          mode: 'add'
        })
      },
      handleRowRemove ({ index, row }, done) {
        setTimeout(() => {
          deleteCloudserverById(row.id)
            .then(res => {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.fetchData()
              done()
            })
        }, 300)
      },
      // handleRowEdit ({ index, row }, done) {
      //   setTimeout(() => {
      //     updateCloudserver({
      //       id: row.id,
      //       roleName: row.roleName,
      //       comment: row.comment,
      //       workflow: row.workflow
      //     })
      //       .then(res => {
      //         this.$message({
      //           message: '更新成功',
      //           type: 'success'
      //         })
      //         this.fetchData()
      //         done()
      //       })
      //   }, 300)
      // },
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
        queryCloudserverPage(
          this.queryParam.cloudserverType, this.queryParam.serverName, this.queryParam.queryIp, this.queryParam.serverStatus, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.data = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      },
      handleSync () {
        setTimeout(() => {
          syncCloudserverByKey(this.cloudserverKey)
            .then(res => {
              this.$message({
                message: '后台同步数据中',
                type: 'success'
              })
              this.fetchData()
            })
        }, 300)
      }
    }
  }
</script>
