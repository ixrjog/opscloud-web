<template>
  <div>
    <el-input v-model="queryParam.queryName" placeholder="系统账户查询" style="display: inline-block; max-width:200px"/>
    <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
    <el-button @click="addItem">新增</el-button>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="systemUser" label="系统账户"></el-table-column>
      <el-table-column prop="keyType" label="密钥类型">
        <template slot-scope="scope">
          <el-tag :type="scope.row.keyType === 0 ? 'success': 'info'"> {{ scope.row.keyType === 0 ? 'sshKey': 'password' }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fingerprint" label="指纹"></el-table-column>
      <el-table-column fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <KeyboxDialog :formStatus="formStatus" ref="keyboxDialog"
                          @closeKeyboxDialog="fetchData"></KeyboxDialog>
  </div>
</template>

<script>

  import KeyboxDialog from '@/components/opscloud/keybox/KeyboxDialog.vue'

  // API
  import { queryKeyboxPage, delKeyboxById } from '@api/keybox/keybox.js'

  export default {
    data () {
      return {
        formStatus: {
          visible: false
        },
        tableData: [],
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          queryName: ''
        }
      }
    },
    name: 'KeyboxTable',
    props: [],
    mounted () {
      this.fetchData()
    },
    components: {
      KeyboxDialog
    },
    methods: {
      addItem () {
        this.formStatus.visible = true
        this.$refs.keyboxDialog.initData()
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delKeyboxById(row.id).then(res => {
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
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        let requestBody = {
          querySystemUser: this.queryParam.queryName,
          page: this.pagination.currentPage,
          length: this.pagination.pageSize
        }
        queryKeyboxPage(requestBody)
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
