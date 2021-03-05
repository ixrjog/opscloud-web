<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="50%">
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column label="文件名" width="250">
        <template slot-scope="props">
          <span>{{ props.row.fileName }}.xlsx</span>
        </template>
      </el-table-column>
      <el-table-column label="导出用户" width="150">
        <template slot-scope="props">
          <span>{{ props.row.ocUser | userFilters }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="props">
          <el-tag :type="getStatusColor(props.row.taskStatus)">{{ props.row.taskStatus | taskStatusFilters }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间"></el-table-column>
      <el-table-column prop="endTime" label="结束时间"></el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-link icon="el-icon-download" :underline="false"
                   :href="getDownloadUrl(scope.row.fileName)" target="_blank" :disabled="scope.row.taskStatus !== 2">
            下载
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                   layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
                   :current-page="pagination.currentPage" :page-size="pagination.pageSize">
    </el-pagination>
  </el-dialog>
</template>

<script>
import { userFilters } from '@/filters/user'
import { mapActions, mapState } from 'vuex'
import { queryOcExportTaskPage } from '@api/export/export.task'

export default {
  data () {
    return {
      title: '导出下载',
      tableData: [],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      taskType: ''
    }
  },
  name: 'ExportTaskDialog',
  props: ['formStatus'],
  mounted () {
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  components: {},
  filters: {
    userFilters,
    taskStatusFilters (taskStatus) {
      if (taskStatus === 0) {
        return '失败'
      }
      if (taskStatus === 1) {
        return '进行中'
      }
      if (taskStatus === 2) {
        return '完成'
      }
      return ''
    }
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
    initData (taskType) {
      this.taskType = taskType
      this.fetchData()
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'taskType': this.taskType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryOcExportTaskPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    getDownloadUrl (fileName) {
      let host = window.location.host
      let httpProtocol = window.location.href.split('://')[0]
      let url = httpProtocol + '://' + host + '/res/export/' + fileName + '.xlsx'
      return url
    },
    getStatusColor (taskStatus) {
      if (taskStatus === 0) {
        return 'danger'
      }
      if (taskStatus === 1) {
        return 'info'
      }
      if (taskStatus === 2) {
        return 'success'
      }
      return ''
    }
  }
}

</script>

<style scoped>

</style>
