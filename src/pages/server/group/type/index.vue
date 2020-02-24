<template>
  <d2-container>
    <template>
      <div>
        <h1>服务器组类型</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.name" placeholder="名称"/>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="addItem">新增</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
<!--        <el-table-column prop="name" label="名称" ></el-table-column>-->
        <el-table-column prop="name" label="名称">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.color }">{{scope.row.name}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="grpType" label="类型值" ></el-table-column>
        <el-table-column prop="comment" label="描述" ></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
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
          <el-form-item label="名称" :label-width="formLabelWidth">
            <el-input v-model="form.name" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="类型值" :label-width="formLabelWidth">
            <el-input v-model="form.grpType" placeholder="请输入内容" :disabled="!dialogForm.operationType"></el-input>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="颜色" :label-width="formLabelWidth">
            <el-color-picker v-model="form.color"></el-color-picker>
          </el-form-item>
        </el-form>
        <el-form :model="form">
          <el-form-item label="描述" :label-width="formLabelWidth">
            <el-input v-model="form.comment" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="dialogForm.visible = false">取消</el-button>
          <el-button size="mini" type="primary" @click="saveInfo">确定</el-button>
        </div>
      </el-dialog>
    </template>
  </d2-container>
</template>

<script>
  // API
  import { queryServerGroupTypePage, deleteServerGroupTypeById, addServerGroupType, updateServerGroupType } from '@api/server/server.group.type.js'

  export default {
    data () {
      return {
        form: {
          id: '',
          name: '',
          grpType: '',
          color: '#dd4d3a',
          comment: ''
        },
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogForm: {
          visible: false,
          addTitle: '新增服务器组类型配置',
          updateTitle: '更新服务器组类型配置',
          operationType: true
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
          grpType: ''
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
          deleteServerGroupTypeById(row.id).then(res => {
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
      updateItem (row) {
        this.form = {
          id: row.id,
          name: row.name,
          grpType: row.grpType,
          color: row.color,
          comment: row.comment
        }
        this.dialogForm.operationType = false
        this.dialogForm.visible = true
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = {
            'id': this.form.id,
            'name': this.form.name,
            'grpType': this.form.grpType,
            'color': this.form.color,
            'comment': this.form.comment
          }
          if (this.dialogForm.operationType) {
            addServerGroupType(requestBody)
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
            updateServerGroupType(requestBody)
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
        queryServerGroupTypePage(this.queryParam.name, this.queryParam.grpType, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
