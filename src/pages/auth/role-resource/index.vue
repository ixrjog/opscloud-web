<template>
  <d2-container>
    <template>
      <div>
        <h1>角色配置</h1>
      </div>
      <div>
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.roleName" placeholder="角色名称"/>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="addRow">新增</el-button>
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
  import workflowTag from './workflowTag'
  // API
  import { queryRolePage, deleteRoleById, addRole, updateRole } from '@api/auth/auth.role.js'

  export default {
    data () {
      return {
        columns: [
          {
            title: '角色',
            key: 'roleName',
            minWidth: '40%'
          },
          {
            title: '描述',
            key: 'comment',
            minWidth: '30%'
          },
          {
            title: '允许工作流申请',
            key: 'workflow',
            component: {
              name: workflowTag,
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
          roleName: ''
        },
        selectOptions: [{
          value: 0,
          label: '禁用'
        }, {
          value: 1,
          label: '允许'
        }],
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
      handleRowAdd (row, done) {
        this.formOptions.saveLoading = true
        setTimeout(() => {
          var requestBody = {
            'roleName': row.roleName,
            'comment': row.comment,
            'workflow': row.workflow
          }
          addRole(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.fetchData()
              done()
            })

          // done可以传入一个对象来修改提交的某个字段
          this.formOptions.saveLoading = false
        }, 600)
      },
      handleRowRemove ({ index, row }, done) {
        setTimeout(() => {
          deleteRoleById(row.id)
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
      handleRowEdit ({ index, row }, done) {
        setTimeout(() => {
          updateRole({
            id: row.id,
            roleName: row.roleName,
            comment: row.comment,
            workflow: row.workflow
          })
            .then(res => {
              this.$message({
                message: '更新成功',
                type: 'success'
              })
              this.fetchData()
              done()
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
      fetchData () {
        this.loading = true
        queryRolePage(
          this.queryParam.roleName, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.data = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
