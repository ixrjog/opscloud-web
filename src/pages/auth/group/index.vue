<template>
  <d2-container>
    <template>
      <div>
        <h1>资源组配置</h1>
      </div>
      <div>
        <el-row :gutter="24" style="margin-bottom: 5px">
            <el-input v-model="queryParam.groupCode" placeholder="资源组名称" style="display: inline-block; max-width:200px"/>
            <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
            <el-button @click="addRow" style="margin-left: 5px">新增</el-button>
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

  // API
  import { queryGroupPage, deleteGroupById, addGroup, updateGroup } from '@api/auth/auth.group.js'

  export default {
    data () {
      return {
        columns: [
          {
            title: '资源组名称',
            key: 'groupCode',
            minWidth: '40%'
          },
          {
            title: '描述',
            key: 'comment',
            minWidth: '30%'
          }
        ],
        data: [],
        addTemplate: {
          groupCode: {
            title: '资源组名称',
            value: ''
          },
          comment: {
            title: '描述',
            value: ''
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
          groupCode: ''
        },
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
            'groupCode': row.groupCode,
            'comment': row.comment
          }
          addGroup(requestBody)
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
          deleteGroupById(row.id)
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
          updateGroup({
            id: row.id,
            groupCode: row.groupCode,
            comment: row.comment
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
        queryGroupPage(
          this.queryParam.groupCode, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.data = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
