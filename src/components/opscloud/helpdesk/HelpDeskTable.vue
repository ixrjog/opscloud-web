<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
      <el-select v-model="queryParam.helpdeskType" placeholder="消息类型" class="select" clearable filterable>
        <el-option
          v-for="item in helpdeskTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData">查询</el-button>
      <el-button @click="handlerAdd" style="margin-left: 5px">新增</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column label="Helpdesk类型">
        <template slot-scope="scope">
          <span>{{ scope.row.helpdeskType|helpdeskTypeFilters }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="weeks" label="时间"></el-table-column>
      <el-table-column prop="helpdeskCnt" label="总计"></el-table-column>
      <el-table-column prop="comment" label="说明"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-popconfirm
            title="是否删除改HelpDesk？" @onConfirm="handlerDel(scope.row)"
          >
            <el-button slot="reference" type="danger" plain size="mini" icon="el-icon-delete">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <help-desk-dialog ref="helpDeskDialog" :formStatus="helpDeskDialogStatus"
                      @closeDialog="fetchData"></help-desk-dialog>
  </div>
</template>

<script>
import HelpDeskDialog from '@/components/opscloud/helpdesk/HelpDeskDialog'

// API
import { mapActions, mapState } from 'vuex'
import { delHelpdeskReport, helpdeskReportPage } from '@api/helpdesk/helpdesk'

export default {
  data () {
    return {
      helpDeskDialogStatus: {
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
        helpdeskType: ''
      },
      helpdeskTypeOptions: [{
        value: 0,
        label: '桌面维护'
      }, {
        value: 1,
        label: '资产管理'
      }, {
        value: 2,
        label: '网络管理'
      }, {
        value: 3,
        label: '用户管理'
      }, {
        value: 4,
        label: '邮箱管理'
      }, {
        value: 5,
        label: 'IT知识库'
      }, {
        value: 6,
        label: '监控管理'
      }, {
        value: 7,
        label: '行为管理'
      }]
    }
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.fetchData()
  },
  components: {
    HelpDeskDialog
  },
  filters: {
    helpdeskTypeFilters (helpdeskType) {
      if (helpdeskType === 0) {
        return '桌面维护'
      }
      if (helpdeskType === 1) {
        return '资产管理'
      }
      if (helpdeskType === 2) {
        return '网络管理'
      }
      if (helpdeskType === 3) {
        return '用户管理'
      }
      if (helpdeskType === 4) {
        return '邮箱管理'
      }
      if (helpdeskType === 5) {
        return 'IT知识库'
      }
      if (helpdeskType === 6) {
        return '监控管理'
      }
      if (helpdeskType === 7) {
        return '行为管理'
      }
      return '暂未配置'
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
    handlerDel (row) {
      delHelpdeskReport(row.id)
        .then(res => {
          this.$message.success('删除成功')
          this.fetchData()
        })
    },
    handlerAdd () {
      this.helpDeskDialogStatus.visible = true
      this.$refs.helpDeskDialog.initData()
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'helpdeskType': this.queryParam.helpdeskType === '' ? -1 : this.queryParam.helpdeskType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      helpdeskReportPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.select {
  margin-right: 5px;
}
</style>
