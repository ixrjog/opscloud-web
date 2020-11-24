<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入关键字模糊查询" class="input"/>
        <el-select v-model="queryParam.assetCompany" filterable clearable class="select"
                   remote placeholder="选择归属公司" :remote-method="getAssetCompany">
          <el-option
            v-for="item in companyOptions"
            :key="item.id"
            :label="item.assetCompanyName"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.assetStatus" placeholder="选择状态" class="select" clearable>
          <el-option
            v-for="item in assetStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button @click="fetchData">查询</el-button>
        <el-button @click="handlerAdd" style="margin-left: 5px">新增</el-button>
      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="assetCode" label="资产编码"></el-table-column>
        <el-table-column prop="assetName" label="资产名称"></el-table-column>
        <el-table-column label="资产状态">
          <template slot-scope="props">
            <el-tag :type="getAssetStatusColor(props.row.assetStatus)">
              {{ props.row.assetStatus | assetStatusFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assetType" label="资产分类"></el-table-column>
        <el-table-column prop="useTime" label="领用/借用日期"></el-table-column>
        <el-table-column prop="assetAddTime" label="购置/起租日期"></el-table-column>
        <el-table-column label="申领用户" width="220">
          <template slot-scope="props">
            <span>{{ props.row.user | userFilters }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-dropdown split-button type="primary" size="mini" @click="handlerRowEdit(scope.row)">
              编辑
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-circle-plus" v-if="scope.row.assetStatus === 1">
                  <el-button type="text" @click="handlerApply(scope.row)" style="margin-left: 5px">申请资产</el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-plus"
                                  v-if="scope.row.assetStatus === 2 ||scope.row.assetStatus === 3">
                  <el-button type="text" @click="handleReturn(scope.row)" style="margin-left: 5px">归还资产</el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-plus" v-if="scope.row.assetStatus === 1">
                  <el-popconfirm @onConfirm="handlerDisable(scope.row)" title="确定要报废此资产吗">
                    <el-button slot="reference" type="text" style="margin-left: 5px;color: #F56C6C">报废资产</el-button>
                  </el-popconfirm>
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
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- namespace编辑对话框 -->
      <it-asset-dialog ref="itAssetDialog" :formStatus="itAssetDialogStatus" @closeDialog="fetchData"></it-asset-dialog>
      <it-asset-apply-dialog ref="itAssetApplyDialog" :formStatus="itAssetApplyDialogStatus"
                             @closeDialog="fetchData"></it-asset-apply-dialog>
      <it-asset-return-dialog ref="itAssetReturnDialog" :formStatus="itAssetReturnDialogStatus"
                              @closeDialog="fetchData"></it-asset-return-dialog>
    </template>
  </d2-container>
</template>

<script>
import ItAssetDialog from '@/components/opscloud/dialog/ItAssetDialog'
import ItAssetApplyDialog from '@/components/opscloud/dialog/ItAssetApplyDialog'
import ItAssetReturnDialog from '@/components/opscloud/dialog/ItAssetReturnDialog'

// API
import {
  queryOcItAssetCompanyAll,
  queryOcItAssetPage,
  queryAssetTypeTree, disableAsset, ableAsset
} from '@api/it/it.asset'
import { mapActions, mapState } from 'vuex'

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
        assetNameId: ''
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
      }, {
        value: 4,
        label: '报废'
      }],
      assetTypeOptions: []
    }
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.getAssetCompany()
    this.getAssetTypeTree()
    this.fetchData()
  },
  components: {
    ItAssetDialog,
    ItAssetApplyDialog,
    ItAssetReturnDialog
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
      if (assetStatus === 4) {
        return '报废'
      }
      return '暂未配置'
    },
    userFilters (user) {
      if (user === null) {
        return ''
      }
      return user.username + '<' + user.displayName + '>'
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
    handlerDisable (row) {
      disableAsset(row.id)
        .then(res => {
          this.fetchData()
          this.$message.success('资产报废成功')
        })
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
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryOcItAssetPage(requestBody)
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
.input {
  display: inline-block;
  max-width: 200px;
  margin-right: 5px;
}

.select {
  margin-right: 5px;
}

</style>
