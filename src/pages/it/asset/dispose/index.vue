<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px" :gutter="24">
        <el-input v-model.trim="queryParam.queryName" placeholder="输入资产编码模糊查询" class="input"/>
        <el-select v-model="queryParam.disposeType" placeholder="选择处置方式" class="select" clearable>
          <el-option
            v-for="item in disposeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
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
        <el-table-column label="处置方式">
          <template slot-scope="props">
            <el-tag :type="getDisposeTypeColor(props.row.disposeType)">
              {{ props.row.disposeType | disposeTypeFilters }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expand" label="说明"></el-table-column>
        <el-table-column prop="disposeTime" label="处置日期"></el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-popconfirm @onConfirm="handlerAble(scope.row)" title="确定要还原此资产吗">
              <el-button slot="reference" plain type="success">还原</el-button>
            </el-popconfirm>
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
    </template>
  </d2-container>
</template>

<script>
import ItAssetReturnDialog from '@/components/opscloud/it/ItAssetReturnDialog'
import ItAssetApplyDialog from '@/components/opscloud/it/ItAssetApplyDialog'

// API
import { mapActions, mapState } from 'vuex'
import { ableAsset, queryAssetById, queryOcItAssetDisposePage } from '@api/it/it.asset'

export default {
  data () {
    return {
      title: '资产处置',
      itAssetReturnDialogStatus: {
        isUpdate: false,
        visible: false
      },
      itAssetApplyDialogStatus: {
        isUpdate: true,
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
        disposeType: ''
      },
      disposeTypeOptions: [{
        value: 1,
        label: '退租'
      }, {
        value: 2,
        label: '报废清理'
      }, {
        value: 3,
        label: '盘亏处理'
      }, {
        value: 4,
        label: '转让出售'
      }, {
        value: 5,
        label: '维修处理'
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
    ItAssetReturnDialog,
    ItAssetApplyDialog
  },
  filters: {
    disposeTypeFilters (disposeType) {
      if (disposeType === 1) {
        return '退租'
      }
      if (disposeType === 2) {
        return '报废清理'
      }
      if (disposeType === 3) {
        return '盘亏处理'
      }
      if (disposeType === 4) {
        return '转让出售'
      }
      if (disposeType === 5) {
        return '维修处理(一般)'
      }
      if (disposeType === 6) {
        return '维修处理(紧急)'
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
    getDisposeTypeColor (disposeType) {
      if (disposeType === 6) {
        return 'danger'
      }
      return 'primary'
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    handlerAble (row) {
      ableAsset(row.assetId)
        .then(res => {
          this.fetchData()
          this.$message.success('资产还原成功')
        })
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
        'disposeType': this.queryParam.disposeType === '' ? -1 : this.queryParam.disposeType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryOcItAssetDisposePage(requestBody)
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
