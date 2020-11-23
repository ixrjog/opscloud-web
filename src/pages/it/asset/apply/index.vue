<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
        <el-select v-model="queryParam.userId" filterable remote reserve-keyword placeholder="搜索用户"
                   :remote-method="getUser" class="select" clearable>
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.displayName"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="queryParam.userOrgDeptId" filterable remote reserve-keyword placeholder="搜索部门"
                   :remote-method="getOrgDept" class="select" clearable>
          <el-option
            v-for="item in orgDeptOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
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
        <el-select v-model="queryParam.isReturn" placeholder="是否归还" class="select" clearable>
          <el-option
            v-for="item in isReturnOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button @click="fetchData">查询</el-button>
      </el-row>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="assetCode" label="资产编码"></el-table-column>
        <el-table-column label="申领用户" width="280">
          <template slot-scope="props">
            <span>{{ props.row | userFilters }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userOrgDeptName" label="所在部门"></el-table-column>
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
        <el-table-column label="是否归还">
          <template slot-scope="props">
            <span v-text="props.row.isReturn?'是':'否'"></span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" @click="handlerRowEdit(scope.row)" plain>编辑</el-button>
            <el-button v-if="!scope.row.isReturn" type="primary" @click="handleReturn(scope.row)" plain>归还</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- namespace编辑对话框 -->
      <it-asset-return-dialog ref="itAssetReturnDialog" :formStatus="itAssetReturnDialogStatus"
                              @closeDialog="fetchData"></it-asset-return-dialog>
    </template>
  </d2-container>
</template>

<script>
import ItAssetReturnDialog from '@/components/opscloud/dialog/ItAssetReturnDialog'

// API
import { queryOcItAssetApplyPage } from '@api/it/it.asset.apply'
import { mapActions, mapState } from 'vuex'
import { fuzzyQueryUserPage } from '@api/user/user'
import { queryFirstLevelDepartmentPage } from '@api/org/org'

export default {
  data () {
    return {
      title: '资产使用盘点',
      itAssetReturnDialogStatus: {
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
        label: '是'
      }, {
        value: 0,
        label: '否'
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
    ItAssetReturnDialog
  },
  filters: {
    userFilters (user) {
      return user.username + '<' + user.displayName + '>'
    },
    applyTypeFilters (applyType) {
      if (applyType === 1) {
        return '使用'
      }
      if (applyType === 2) {
        return '借用'
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
      this.itAssetDialogStatus.operationType = false
      this.$refs.itAssetDialog.initData(row)
    },
    handleReturn (row) {
      let data = {
        id: row.assetId,
        assetCode: row.assetCode
      }
      this.itAssetReturnDialogStatus.visible = true
      this.$refs.itAssetReturnDialog.initData(data)
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'userId': this.queryParam.userId === '' ? -1 : this.queryParam.userId,
        'userOrgDeptId': this.queryParam.userOrgDeptId === '' ? -1 : this.queryParam.userOrgDeptId,
        'applyType': this.queryParam.applyType === '' ? -1 : this.queryParam.applyType,
        'isReturn': this.queryParam.isReturn === '' ? -1 : this.queryParam.isReturn,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryOcItAssetApplyPage(requestBody)
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
