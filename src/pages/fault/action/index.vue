<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="关键字查询" class="input"/>
          <el-select v-model="queryParam.actionStatus" placeholder="选择状态" class="select" clearable>
            <el-option
              v-for="item in actionStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button @click="fetchData" class="button" :loading="loading">查询</el-button>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%" :span-method="arraySpanMethod">
        <el-table-column prop="faultTitle" label="故障标题"></el-table-column>
        <el-table-column prop="faultAction" label="Action"></el-table-column>
        <el-table-column label="跟进人" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.followUser.displayName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120"></el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getActionStatusColor(scope.row.actionStatus)">
              {{ scope.row.actionStatus | actionStatusFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-select v-model="actionUpdateStatus" placeholder="更新状态" @change="updateAction(scope.row)">
              <el-option v-for="item in actionStatusOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
    </template>
  </d2-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { queryFaultActionPage, updateFaultAction } from '@api/fault/fault.info.js'

export default {
  data () {
    return {
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: '',
        actionStatus: ''
      },
      actionUpdateStatus: '',
      actionStatusOptions: [{
        value: 0,
        label: '完成'
      }, {
        value: 1,
        label: '待完成'
      }, {
        value: 2,
        label: '关闭'
      }],
      title: '故障Action',
      tableData: []
    }
  },
  mounted () {
    this.fetchData()
    this.initPageSize()
  },
  filters: {
    actionStatusFilters (actionStatus) {
      if (actionStatus === 0) {
        return '完成'
      }
      if (actionStatus === 1) {
        return '待完成'
      }
      if (actionStatus === 2) {
        return '关闭'
      }
    }
  },
  components: {},
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
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
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'actionStatus': this.queryParam.actionStatus === '' ? -1 : this.queryParam.actionStatus,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryFaultActionPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    getActionStatusColor (actionStatus) {
      if (actionStatus === 0) {
        return 'success'
      }
      if (actionStatus === 1) {
        return 'danger'
      }
      if (actionStatus === 2) {
        return 'info'
      }
    },
    updateAction (row) {
      if (this.actionUpdateStatus === '') {
        this.$message.warning('状态错误')
        return
      }
      row.actionStatus = this.actionUpdateStatus
      updateFaultAction(row)
        .then(res => {
          this.$message.success('更新故障Action成功')
          this.actionUpdateStatus = ''
        })
    },
    arraySpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        // 当 当前行与上一行内容相同时 返回0 0 意味消除
        if (rowIndex > 0 && row.faultId === this.tableData[rowIndex - 1].faultId) {
          return {
            rowspan: 0,
            colspan: 0
          }
        } else {
          let rows = 1
          // 反之 查询相同的内容有多少行 进行合并
          for (let i = rowIndex; i < this.tableData.length - 1; i++) {
            if (row.faultId === this.tableData[i + 1].faultId) {
              rows++
            }
          }
          // 返回相同内容的行数
          return {
            rowspan: rows,
            colspan: 1
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.input {
  margin-left: 12px;
  display: inline-block;
  max-width: 200px;
}

.button {
  margin-left: 5px;
}

.select {
  margin-left: 5px;
}
</style>
