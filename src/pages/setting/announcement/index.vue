<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px" :gutter="24">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字模糊查询" class="input"/>
        <el-button @click="fetchData" class="button">查询</el-button>
        <el-button @click="handlerAdd" class="button">新增</el-button>
      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="公告标题" show-overflow-tooltip></el-table-column>
        <el-table-column prop="content" label="公告内容" show-overflow-tooltip></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="handlerEdit(scope.row)">编辑</el-button>
            <el-button :type="scope.row.valid ? 'success' : 'info'" plain size="mini"
                       @click="handlerValid(scope.row)">{{ scope.row.isActive ? '有效' : '无效' }}
            </el-button>
            <el-popconfirm title="是否删除该公告？" @onConfirm="handlerDel(scope.row)">
              <el-button slot="reference" type="danger" plain size="mini" icon="el-icon-delete" style="margin-left: 10px">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
                     :current-page="pagination.currentPage" :page-size="pagination.pageSize">
      </el-pagination>
      <announcement-dialog ref="announcementDialog" :formStatus="announcementDialogStatus"
                           @closeDialog="fetchData"></announcement-dialog>
    </template>
  </d2-container>
</template>

<script>
import AnnouncementDialog from '@/components/opscloud/announcement/AnnouncementDialog'

// API
import { mapActions, mapState } from 'vuex'
import { delAnnouncement, queryOcAnnouncementPage, saveAnnouncement } from '@api/announcement/announcement'

export default {
  data () {
    return {
      title: '公告管理',
      announcementDialogStatus: {
        operationType: false,
        visible: false,
        addTitle: '新增公告',
        updateTitle: '更新公告'
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
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.fetchData()
  },
  components: {
    AnnouncementDialog
  },
  filters: {},
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
    handlerAdd () {
      this.announcementDialogStatus.operationType = true
      this.announcementDialogStatus.visible = true
      let data = {
        'id': 0
      }
      this.$refs.announcementDialog.initData(data)
    },
    handlerEdit (row) {
      this.announcementDialogStatus.operationType = false
      this.announcementDialogStatus.visible = true
      this.$refs.announcementDialog.initData(row)
    },
    handlerValid (row) {
      row.valid = !row.valid
      saveAnnouncement(row)
        .then(res => {
          this.fetchData()
          this.$message.success('变更成功')
        })
    },
    handlerDel (row) {
      delAnnouncement(row.id)
        .then(res => {
          this.fetchData()
          this.$message.success('资产还原成功')
        })
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryOcAnnouncementPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    onCopy (e) {
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    }
  }
}
</script>

<style scoped>
.input {
  display: inline-block;
  max-width: 200px;
  margin-left: 10px;
}
.button {
  margin-left: 5px
}
</style>
