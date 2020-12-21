<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-input v-model="queryParam.queryName" placeholder="关键字查询" class="input"/>
      <el-select v-model="queryParam.isActive" clearable placeholder="有效性" style="margin-left: 5px">
        <el-option
          v-for="item in activeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" class="button">查询</el-button>
      <el-button @click="handlerSync" class="button" :loading="syncLoading">同步</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="实例编号">
              <span>{{ props.row.instanceId }}</span>
            </el-form-item>
            <el-form-item label="域名实名认证状态">
              <span>{{ props.row.domainAuditStatus | domainAuditStatusFilters }}</span>
            </el-form-item>
            <el-form-item label="域名类型">
              <span>{{ props.row.domainType }}</span>
            </el-form-item>
            <el-form-item label="域名注册类型">
              <span>{{ props.row.registrantType | registrantTypeFilters }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="domainName" label="域名"></el-table-column>
      <el-table-column prop="registrationDate" label="注册时间"></el-table-column>
      <el-table-column prop="expirationDate" label="域名到期日期"></el-table-column>
      <el-table-column prop="expirationCurrDateDiff" label="距离到期天数"></el-table-column>
      <el-table-column prop="domainStatus" label="域名状态">
        <template slot-scope="scope">
          <el-tag :type="getDomainStatusColor(scope.row.domainStatus)" size="small" disable-transitions>
            {{ scope.row.domainStatus | domainStatusFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
      <el-table-column prop="isActive" label="有效性">
        <template slot-scope="scope">
          <el-tag :type="getActiveColor(scope.row.isActive)" size="small">
            {{ scope.row.isActive | activeFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button :type="scope.row.isActive === 0 ? 'success' : 'info'" plain size="mini"
                     @click="setItemActive(scope.row)">{{ scope.row.isActive === 0 ? '有效' : '无效' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
  </div>
</template>
<script>
import { queryAliyunDomainPage, setAliyunDomainActive, syncAliyunDomain } from '@api/cloud/aliyun.domain'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      tableData: [],
      options: {
        stripe: true
      },
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: '',
        isActive: ''
      },
      activeOptions: [{
        value: 0,
        label: '无效'
      }, {
        value: 1,
        label: '有效'
      }],
      syncLoading: false
    }
  },
  name: 'AliyunDomainMgmtTable',
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.fetchData()
    this.initPageSize()
  },
  components: {},
  filters: {
    domainAuditStatusFilters (domainAuditStatus) {
      if (domainAuditStatus === 'FAILED') {
        return '实名认证失败'
      }
      if (domainAuditStatus === 'SUCCEED') {
        return '实名认证成功'
      }
      if (domainAuditStatus === 'NONAUDIT') {
        return '未实名认证'
      }
      if (domainAuditStatus === 'AUDITING') {
        return '审核中'
      }
      return ''
    },
    domainStatusFilters (domainStatus) {
      if (domainStatus === '1') {
        return '急需续费'
      }
      if (domainStatus === '2') {
        return '急需赎回'
      }
      if (domainStatus === '3') {
        return '正常'
      }
      return ''
    },
    expirationDateStatusFilters (expirationDateStatus) {
      return expirationDateStatus === '1' ? '域名未过期' : '域名已过期'
    },
    registrantTypeFilters (registrantType) {
      return registrantType === '1' ? '个人' : '企业'
    },
    activeFilters (isActive) {
      return isActive === 0 ? '无效' : '有效'
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
    getActiveColor (isActive) {
      return isActive === 0 ? 'info' : 'sucess'
    },
    getDomainStatusColor (domainStatus) {
      if (domainStatus === '1') {
        return 'danger'
      }
      if (domainStatus === '2') {
        return 'danger'
      }
      if (domainStatus === '3') {
        return 'success'
      }
      return ''
    },
    handleClick () {
      this.$emit('input', !this.value)
    },
    setItemActive (row) {
      let requestBody = {
        'id': row.id
      }
      setAliyunDomainActive(requestBody).then(res => {
        this.fetchData()
        this.$message({
          type: 'success',
          message: '设置成功!'
        })
        this.$emit('handlerSetActive')
      })
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'domainName': this.queryParam.queryName,
        'isActive': this.queryParam.isActive === '' ? -1 : this.queryParam.isActive,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryAliyunDomainPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    handlerSync () {
      this.syncLoading = true
      setTimeout(() => {
        syncAliyunDomain()
          .then(res => {
            this.$message({
              message: '后台同步数据中',
              type: 'success'
            })
            this.fetchData()
            this.syncLoading = false
          })
      }, 300)
    }
  }
}
</script>

<style scoped>
.input {
  display: inline-block;
  max-width: 200px;
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
