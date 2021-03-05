<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px" :gutter="24">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入资产编码模糊查询" class="input"/>
        <el-select v-model="queryParam.userOrgDeptId" filterable remote reserve-keyword placeholder="搜索部门"
                   :remote-method="getOrgDept" class="select" clearable>
          <el-option
            v-for="item in orgDeptOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.userId" filterable remote reserve-keyword placeholder="搜索用户"
                   :remote-method="getUser" class="select" clearable>
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.displayName"
            :value="user.id">
            <span style="float: left">{{ user | userFilters }}</span>
            <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ user.email }}</span>
          </el-option>
        </el-select>
        <el-select v-model="queryParam.applyType" placeholder="选择申领方式" class="select" clearable>
          <el-option
            v-for="item in applyTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.isReturn" placeholder="使用情况" class="select" clearable>
          <el-option
            v-for="item in isReturnOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button @click="fetchData" class="button" v-if="!queryMore">查询</el-button>
        <el-checkbox v-model="queryMore" class="button">更多</el-checkbox>
        <el-button-group style="float: right;margin-right: 10px">
          <el-button @click="handlerExport" class="button">导出</el-button>
          <el-button @click="handlerDownload" class="button">下载</el-button>
        </el-button-group>
      </el-row>
      <el-row style="margin-bottom: 5px" v-if="queryMore">
        <el-date-picker
          v-model="applyTime" type="daterange" align="right" unlink-panels value-format="timestamp"
          start-placeholder="领用开始日期" range-separator="至" end-placeholder="领用结束日期"
          :picker-options="pickerOptions">
        </el-date-picker>
        <el-date-picker
          v-model="returnTime" type="daterange" align="right" unlink-panels value-format="timestamp"
          start-placeholder="归还开始日期" range-separator="至" end-placeholder="归还结束日期"
          :picker-options="pickerOptions" class="picker">
        </el-date-picker>
        <el-button @click="fetchData" class="button">查询</el-button>
      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" @expand-change="getAssetDetail">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand"
                     v-if="props.row.asset !== null && props.row.asset !== ''">
              <el-form-item label="资产分类/名称">
                <span>{{ props.row.asset.assetType }} / {{ props.row.asset.assetName }}</span>
              </el-form-item>
              <el-form-item label="归属公司">
                <span>{{ props.row.asset | assetCompanyFilters }}</span>
              </el-form-item>
              <el-form-item label="资产配置">
                <span>{{ props.row.asset.assetConfiguration }}</span>
              </el-form-item>
              <el-form-item label="放置地点">
                <span>{{ props.row.asset.assetPlace }}</span>
              </el-form-item>
              <el-form-item label="购置/起租日期">
                <span>{{ props.row.asset.assetAddTime }}</span>
              </el-form-item>
              <el-form-item label="金额">
                <span>{{ props.row.asset.assetPrice }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="assetCode" label="资产编码">
          <template slot-scope="scope">
            <span v-clipboard:copy="scope.row.assetCode" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.assetCode }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="userOrgDeptName" label="所在部门"></el-table-column>
        <el-table-column label="申领用户" width="220">
          <template slot-scope="props">
            <span>{{ props.row | userFilters }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申领方式">
          <template slot-scope="props">
            <el-tag :type="props.row.applyType === 1?'success':'primary'">
              {{ props.row.applyType | applyTypeFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="领用/借用日期"></el-table-column>
        <el-table-column prop="expectReturnTime" label="预计归还时间"></el-table-column>
        <el-table-column prop="returnTime" label="归还时间"></el-table-column>
        <el-table-column label="使用情况">
          <template slot-scope="props">
            <span v-text="props.row.isReturn?'已归还':'使用中'"></span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button v-if="!scope.row.isReturn" type="primary" @click="handlerRowEdit(scope.row)" plain>编辑</el-button>
            <el-button v-if="!scope.row.isReturn" type="primary" @click="handleReturn(scope.row)" plain>归还</el-button>
            <el-button v-if="scope.row.isReturn" type="primary" @click="handleReturnEdit(scope.row)" plain>编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
                     :current-page="pagination.currentPage" :page-size="pagination.pageSize">
      </el-pagination>
      <it-asset-apply-dialog ref="itAssetApplyDialog" :formStatus="itAssetApplyDialogStatus"
                             @closeDialog="fetchData"></it-asset-apply-dialog>
      <it-asset-return-dialog ref="itAssetReturnDialog" :formStatus="itAssetReturnDialogStatus"
                              @closeDialog="fetchData"></it-asset-return-dialog>
      <export-task-dialog ref="exportTaskDialog" :formStatus="exportTaskDialogStatus"></export-task-dialog>
    </template>
  </d2-container>
</template>

<script>
import ItAssetReturnDialog from '@/components/opscloud/it/ItAssetReturnDialog'
import ItAssetApplyDialog from '@/components/opscloud/it/ItAssetApplyDialog'

// API
import { exportItAssetApply, queryOcItAssetApplyPage } from '@api/it/it.asset.apply'
import { mapActions, mapState } from 'vuex'
import { fuzzyQueryUserPage } from '@api/user/user'
import { queryFirstLevelDepartmentPage } from '@api/org/org'
import { userFilters } from '@/filters/user'
import { queryAssetById } from '@api/it/it.asset'
import ExportTaskDialog from '@/components/opscloud/export/ExportTaskDialog'

export default {
  data () {
    return {
      title: '资产分配记录',
      itAssetReturnDialogStatus: {
        isUpdate: false,
        visible: false
      },
      itAssetApplyDialogStatus: {
        isUpdate: true,
        visible: false
      },
      exportTaskDialogStatus: {
        visible: false
      },
      tableData: [],
      loading: false,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      returnTime: [],
      applyTime: [],
      queryMore: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: '',
        userId: '',
        userOrgDeptId: '',
        applyType: '',
        isReturn: ''
      },
      userOptions: [],
      orgDeptOptions: [],
      applyTypeOptions: [{
        value: 1,
        label: '使用'
      }, {
        value: 2,
        label: '借用'
      }],
      isReturnOptions: [{
        value: 1,
        label: '已归还'
      }, {
        value: 0,
        label: '使用中'
      }],
      exportType: 2
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
    ItAssetReturnDialog,
    ItAssetApplyDialog,
    ExportTaskDialog
  },
  filters: {
    userFilters,
    applyTypeFilters (applyType) {
      if (applyType === 1) {
        return '使用'
      }
      if (applyType === 2) {
        return '借用'
      }
      return ''
    },
    assetCompanyFilters (assetCompany) {
      if (assetCompany === null || assetCompany === '') {
        return ''
      }
      if (assetCompany.assetCompanyType === 1) {
        return assetCompany.assetCompanyName + ' <采购>'
      }
      if (assetCompany.assetCompanyType === 2) {
        return assetCompany.assetCompanyName + ' <租赁>'
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
    getUser (queryName) {
      let requestBody = {
        'queryName': queryName,
        'extend': 0,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
        })
    },
    getOrgDept (queryName) {
      let requestBody = {
        'queryName': queryName,
        'page': 1,
        'length': 20
      }
      queryFirstLevelDepartmentPage(requestBody)
        .then(res => {
          this.orgDeptOptions = res.body.data
        })
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    handlerRowEdit (row) {
      this.itAssetApplyDialogStatus.visible = true
      this.$refs.itAssetApplyDialog.initData(row)
    },
    handleReturnEdit (row) {
      let data = {
        id: row.id,
        assetCode: row.assetCode,
        returnTime: row.returnTime
      }
      this.itAssetReturnDialogStatus.isUpdate = true
      this.itAssetReturnDialogStatus.visible = true
      this.$refs.itAssetReturnDialog.initData(data)
    },
    handleReturn (row) {
      let data = {
        assetId: row.assetId,
        assetCode: row.assetCode
      }
      this.itAssetReturnDialogStatus.isUpdate = false
      this.itAssetReturnDialogStatus.visible = true
      this.$refs.itAssetReturnDialog.initData(data)
    },
    getAssetDetail (row, expandedRows) {
      if (JSON.stringify(expandedRows) === '[]') {
        return
      }
      queryAssetById(row.assetId)
        .then(res => {
          row.asset = res.body
        })
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'userId': this.queryParam.userId === '' ? -1 : this.queryParam.userId,
        'userOrgDeptId': this.queryParam.userOrgDeptId === '' ? -1 : this.queryParam.userOrgDeptId,
        'applyType': this.queryParam.applyType === '' ? -1 : this.queryParam.applyType,
        'isReturn': this.queryParam.isReturn === '' ? -1 : this.queryParam.isReturn,
        'applyStartTime': '',
        'applyEndTime': '',
        'returnStartTime': '',
        'returnEndTime': '',
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      if (Array.isArray(this.applyTime) && this.applyTime.length > 0) {
        requestBody.applyStartTime = this.applyTime[0]
        requestBody.applyEndTime = this.applyTime[1]
      }
      if (Array.isArray(this.returnTime) && this.returnTime.length > 0) {
        requestBody.returnStartTime = this.returnTime[0]
        requestBody.returnEndTime = this.returnTime[1]
      }
      queryOcItAssetApplyPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    onCopy (e) {
      // this.queryParam.queryName = e.text
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    },
    handlerExport () {
      this.$confirm('确定全量导出资产派发记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          exportItAssetApply()
            .then(res => {
              this.$message.info('正在导出，文件于下载页面下载')
            })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        })
      })
    },
    handlerDownload () {
      this.exportTaskDialogStatus.visible = true
      this.$refs.exportTaskDialog.initData(this.exportType)
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

.select {
  margin-left: 5px;
}

.button {
  margin-left: 5px;
}

.picker {
  margin-left: 5px;
}
</style>

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
