<template>
  <d2-container>
    <template>
      <div>
        <h1>服务器组</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.name" placeholder="名称"/>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParam.grpType" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getGrpType" :loading="loading">
              <el-option
                v-for="item in grpTypeOptions"
                :key="item.grpType"
                :label="item.name"
                :value="item.grpType">
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
        <el-table-column prop="name" label="名称" ></el-table-column>
        <el-table-column prop="serverGroupType" label="组类型">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.serverGroupType.color }">{{scope.row.serverGroupType.name}}</el-tag>
          </template>
        </el-table-column>
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
          <el-form-item label="组类型" :label-width="formLabelWidth">
            <el-select v-model="form.grpType" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getDialogGrpType" :loading="loading">
              <el-option
                v-for="item in grpTypeDialogOptions"
                :key="item.id"
                :label="item.name"
                :value="item.grpType">
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
          <el-button size="mini" @click="dialogForm.visible = false">取消</el-button>
          <el-button size="mini" type="primary" @click="saveInfo">确定</el-button>
        </div>
      </el-dialog>
    </template>
  </d2-container>
</template>

<script>
  // API
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { queryServerGroupPage, deleteServerGroupById, addServerGroup, updateServerGroup } from '@api/server/server.group.js'

  export default {
    data () {
      return {
        form: {
          id: '',
          name: '',
          grpType: '',
          comment: ''
        },
        dialogImageUrl: '',
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogForm: {
          visible: false,
          addTitle: '新增服务器组配置',
          updateTitle: '更新服务器组配置',
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
        },
        grpTypeOptions: [],
        grpTypeDialogOptions: []
      }
    },
    mounted () {
      this.getGrpType('')
      this.fetchData()
    },
    methods: {
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      getDialogGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeDialogOptions = res.body.data
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
          deleteServerGroupById(row.id).then(res => {
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
        this.getDialogGrpType('')
        this.dialogForm.operationType = true
        this.dialogForm.visible = true
        this.form = {
          id: '',
          name: 'group_',
          grpType: '',
          comment: ''
        }
      },
      updateItem (row) {
        this.grpTypeDialogOptions = []
        this.grpTypeDialogOptions.push(row.serverGroupType)
        this.form = {
          id: row.id,
          name: row.name,
          grpType: row.grpType,
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
            'comment': this.form.comment
          }
          if (this.dialogForm.operationType) {
            addServerGroup(requestBody)
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
            updateServerGroup(requestBody)
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
        queryServerGroupPage(this.queryParam.name, this.queryParam.grpType, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
