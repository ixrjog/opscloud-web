<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px" :gutter="24">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入资产编码模糊查询" class="input"/>
        <el-select v-model="queryParam.assetStatus" placeholder="选择状态" class="select" clearable>
          <el-option
            v-for="item in assetStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-cascader :options="assetTypeOptions" :props="assetTypeProps" clearable
                     @change="handleChange" class="cascader" placeholder="选择分类/名称" collapse-tags>
        </el-cascader>
        <el-select v-model="queryParam.assetCompany" filterable clearable class="select"
                   remote placeholder="选择归属公司" :remote-method="getAssetCompany">
          <el-option
            v-for="item in companyOptions"
            :key="item.id"
            :label="item.assetCompanyName"
            :value="item.id">
            <span style="float: left">{{ item.assetCompanyName }}</span>
            <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">
              {{ item.assetCompanyType | assetCompanyTypeFilters }}</span>
          </el-option>
        </el-select>
        <el-date-picker
          v-model="userTime" type="daterange" align="right" unlink-panels value-format="timestamp"
          start-placeholder="领用开始日期" range-separator="至" end-placeholder="领用结束日期"
          :picker-options="pickerOptions" class="picker">
        </el-date-picker>
        <el-button @click="fetchData" class="button">查询</el-button>
        <el-button @click="handlerAdd" class="button">新增</el-button>
        <el-button-group style="float: right;margin-right: 10px">
          <el-button @click="handlerExport" class="button">导出</el-button>
          <el-button @click="handlerDownload" class="button">下载</el-button>
        </el-button-group>

      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="资产配置">
                <span>{{ props.row.assetConfiguration }}</span>
              </el-form-item>
              <el-form-item label="放置地点">
                <span>{{ props.row.assetPlace }}</span>
              </el-form-item>
              <el-form-item label="购置/起租日期">
                <span>{{ props.row.assetAddTime }}</span>
              </el-form-item>
              <el-form-item label="金额">
                <span>{{ props.row.assetPrice }}</span>
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
        <el-table-column label="资产状态">
          <template slot-scope="props">
            <el-tag :type="getAssetStatusColor(props.row.assetStatus)">
              {{ props.row.assetStatus | assetStatusFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资产分类/名称">
          <template slot-scope="props">
            <span>{{ props.row.assetType }} / {{ props.row.assetName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="归属公司">
          <template slot-scope="props">
            <span>{{ props.row | assetCompanyFilters }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申领用户" width="220">
          <template slot-scope="props">
            <span>{{ props.row.user | userFilters }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="useTime" label="领用/借用日期"></el-table-column>
        <el-table-column label="备注">
          <template slot-scope="props">
            <span v-if="props.row.assetStatus===4">{{ props.row.disposeRemark }}</span>
            <span v-else>{{ props.row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-dropdown split-button type="primary" size="mini" @click="handlerRowEdit(scope.row)">
              编辑
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-circle-plus" v-if="scope.row.assetStatus === 1">
                  <el-button type="text" @click="handlerApply(scope.row)" style="margin-left: 5px">派发资产</el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-plus"
                                  v-if="scope.row.assetStatus === 2 ||scope.row.assetStatus === 3">
                  <el-button type="text" @click="handleReturn(scope.row)" style="margin-left: 5px">归还资产</el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-plus" v-if="scope.row.assetStatus === 1">
                  <el-button type="text" style="margin-left: 5px;color: #F56C6C"
                             @click="handlerDisPose(scope.row)">处置资产
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-plus" v-if="scope.row.assetStatus === 4">
                  <el-popconfirm @onConfirm="handlerAble(scope.row)" title="确定要还原此资产吗">
                    <el-button slot="reference" type="text" style="margin-left: 5px;color: #67C23A">还原资产</el-button>
                  </el-popconfirm>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
                     :current-page="pagination.currentPage" :page-size="pagination.pageSize">
      </el-pagination>
      <it-asset-dialog ref="itAssetDialog" :formStatus="itAssetDialogStatus" @closeDialog="fetchData"></it-asset-dialog>
      <it-asset-apply-dialog ref="itAssetApplyDialog" :formStatus="itAssetApplyDialogStatus"
                             @closeDialog="fetchData"></it-asset-apply-dialog>
      <it-asset-return-dialog ref="itAssetReturnDialog" :formStatus="itAssetReturnDialogStatus"
                              @closeDialog="fetchData"></it-asset-return-dialog>
      <it-asset-dispose-dialog ref="itAssetDisposeDialog" :formStatus="itAssetDisposeDialogStatus"
                               @closeDialog="fetchData"></it-asset-dispose-dialog>
      <export-task-dialog ref="exportTaskDialog" :formStatus="exportTaskDialogStatus"></export-task-dialog>
    </template>
  </d2-container>
</template>

<script>
import ItAssetDialog from '@/components/opscloud/it/ItAssetDialog'
import ItAssetApplyDialog from '@/components/opscloud/it/ItAssetApplyDialog'
import ItAssetReturnDialog from '@/components/opscloud/it/ItAssetReturnDialog'
import ItAssetDisposeDialog from '@/components/opscloud/it/ItAssetDisposeDialog'

// API
import {
  queryOcItAssetCompanyAll,
  queryOcItAssetPage,
  ableAsset,
  queryAssetTypeTree,
  exportItAsset
} from '@api/it/it.asset'
import { mapActions, mapState } from 'vuex'
import { userFilters } from '@/filters/user'
import ExportTaskDialog from '@/components/opscloud/export/ExportTaskDialog'

export default {
  data () {
    return {
      title: '资产管理',
      itAssetDialogStatus: {
        visible: false,
        operationType: true,
        addTitle: '新增入库',
        updateTitle: '更新入库'
      },
      itAssetApplyDialogStatus: {
        operationType: true,
        visible: false
      },
      itAssetReturnDialogStatus: {
        isUpdate: false,
        visible: false
      },
      itAssetDisposeDialogStatus: {
        visible: false
      },
      exportTaskDialogStatus: {
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
        queryName: '',
        assetCompany: '',
        assetStatus: '',
        assetNameIdList: []
      },
      companyOptions: [],
      assetStatusOptions: [{
        value: 1,
        label: '空闲'
      }, {
        value: 2,
        label: '在用'
      }, {
        value: 3,
        label: '借用'
      }],
      assetTypeOptions: [],
      assetTypeProps: {
        multiple: true,
        expandTrigger: 'hover'
      },
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
      userTime: [],
      exportType: 1
    }
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.getAssetCompany()
    this.fetchData()
    this.getAssetTypeTree()
  },
  components: {
    ItAssetDialog,
    ItAssetApplyDialog,
    ItAssetReturnDialog,
    ItAssetDisposeDialog,
    ExportTaskDialog
  },
  filters: {
    assetStatusFilters (assetStatus) {
      if (assetStatus === 1) {
        return '空闲'
      }
      if (assetStatus === 2) {
        return '在用'
      }
      if (assetStatus === 3) {
        return '借用'
      }
      return '暂未配置'
    },
    userFilters,
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
    },
    assetCompanyTypeFilters (assetCompanyType) {
      if (assetCompanyType === 1) {
        return '采购'
      }
      if (assetCompanyType === 2) {
        return '租赁'
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
    getAssetCompany () {
      queryOcItAssetCompanyAll()
        .then(res => {
          this.companyOptions = res.body
        })
    },
    getAssetTypeTree () {
      queryAssetTypeTree()
        .then(res => {
          this.assetTypeOptions = res.body
        })
    },
    getAssetStatusColor (assetStatus) {
      if (assetStatus === 1) {
        return 'primary'
      }
      if (assetStatus === 2) {
        return 'success'
      }
      if (assetStatus === 3) {
        return 'success'
      }
      if (assetStatus === 4) {
        return 'danger'
      }
      return 'info'
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    handlerAdd () {
      this.itAssetDialogStatus.operationType = true
      this.itAssetDialogStatus.visible = true
      let data = {
        'id': 0
      }
      this.$refs.itAssetDialog.initData(data)
    },
    handlerRowEdit (row) {
      this.itAssetDialogStatus.operationType = false
      this.itAssetDialogStatus.visible = true
      this.$refs.itAssetDialog.initData(row)
    },
    handlerApply (row) {
      this.itAssetApplyDialogStatus.visible = true
      this.$refs.itAssetApplyDialog.initData(row)
    },
    handleReturn (row) {
      let data = {
        assetId: row.id,
        assetCode: row.assetCode
      }
      this.itAssetReturnDialogStatus.visible = true
      this.$refs.itAssetReturnDialog.initData(data)
    },
    handlerDisPose (row) {
      let data = {
        assetId: row.id,
        assetCode: row.assetCode
      }
      this.itAssetDisposeDialogStatus.visible = true
      this.$refs.itAssetDisposeDialog.initData(data)
    },
    handlerAble (row) {
      ableAsset(row.id)
        .then(res => {
          this.fetchData()
          this.$message.success('资产还原成功')
        })
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'assetCompany': this.queryParam.assetCompany === '' ? -1 : this.queryParam.assetCompany,
        'assetStatus': this.queryParam.assetStatus === '' ? -1 : this.queryParam.assetStatus,
        'assetNameIdList': this.queryParam.assetNameIdList,
        'useStartTime': '',
        'useEndTime': '',
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      if (Array.isArray(this.userTime) && this.userTime.length > 0) {
        requestBody.useStartTime = this.userTime[0]
        requestBody.useEndTime = this.userTime[1]
      }
      queryOcItAssetPage(requestBody)
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
    handleChange (value) {
      this.queryParam.assetNameIdList = []
      value.map(assetNameId => {
        this.queryParam.assetNameIdList.push(assetNameId[(assetNameId.length - 1)])
      })
    },
    handlerExport () {
      this.$confirm('确定全量导出资产信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          exportItAsset()
            .then(res => {
              this.$message.info('正在导出，文件于下载页面下载')
            })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消导出'
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

.picker {
  margin-left: 5px;
}

.select {
  margin-left: 5px;
}

.cascader {
  margin-left: 5px;
  width: 220px;
}

.button {
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
