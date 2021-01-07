<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="15">
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>空闲</span>
              <el-tag style="float: right" type="text">free</el-tag>
            </div>
            <el-row>
              <span class="font-size">{{ totalStats.freeTotal }}</span>
            </el-row>
            <el-row class="font-subtext">All free</el-row>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>在用</span>
              <el-tag style="float: right" type="text">used</el-tag>
            </div>
            <el-row>
              <span class="font-size">{{ totalStats.usedTotal }}</span>
            </el-row>
            <el-row class="font-subtext">All used</el-row>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>借用</span>
              <el-tag style="float: right" type="text">borrow</el-tag>
            </div>
            <el-row>
              <span class="font-size">{{ totalStats.borrowTotal }}</span>
            </el-row>
            <el-row class="font-subtext">All borrow</el-row>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>处置</span>
              <el-tag style="float: right" type="text">dispose</el-tag>
            </div>
            <el-row>
              <span class="font-size">{{ totalStats.disposeTotal }}</span>
            </el-row>
            <el-row class="font-subtext">All dispose</el-row>
          </el-card>
        </el-col>
      </el-row>
      <div style="margin-bottom: 15px"></div>
      <el-row :gutter="15">
        <el-col :span="5">
          <it-asset-company-type-stats-report ref="itAssetCompanyTypeStatsReport"></it-asset-company-type-stats-report>
        </el-col>
        <el-col :span="13">
          <it-asset-stats-report></it-asset-stats-report>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-row>
              <span style="color: #99a9bf">最新入库资产</span>
              <span style="float: right">
              <el-tooltip class="item" effect="dark" content="点击查看详情" placement="top">
                <el-link href="https://oc.xinc818.com/index.html#/it/asset" :underline="false" target="_blank">
                  <i style="margin-left: 5px" class="el-icon-position"></i>
                </el-link>
              </el-tooltip>
            </span>
            </el-row>
            <div style="margin-bottom: 6px"></div>
            <el-table :data="tableData" style="width: 100%" v-loading="loading">
              <el-table-column prop="assetCode" label="资产编码" show-overflow-tooltip>
                <template slot-scope="props">
                  <span style="color: #20a9d9">{{ props.row.assetCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="assetName" label="资产名称" show-overflow-tooltip></el-table-column>
              <el-table-column prop="assetAddTime" label="入库日期" show-overflow-tooltip></el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <div style="margin-bottom: 15px"></div>
      <el-row :gutter="15">
        <el-col :span="24">
          <it-asset-month-stats-report></it-asset-month-stats-report>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

// Component
import ItAssetStatsReport from '@/components/opscloud/it/ItAssetStatsReport'
import ItAssetMonthStatsReport from '@/components/opscloud/it/ItAssetMonthStatsReport'
import { queryItAssetTotalStats, queryOcItAssetPage } from '@api/it/it.asset'
import ItAssetCompanyTypeStatsReport from '@/components/opscloud/it/ItAssetCompanyTypeStatsReport'

export default {
  name: 'ItAssetReport',
  data () {
    return {
      title: '资产报表',
      totalStats: {
        total: 0,
        freeTotal: 0,
        usedTotal: 0,
        borrowTotal: 0,
        disposeTotal: 0
      },
      queryParam: {
        queryName: '',
        assetCompany: -1,
        assetStatus: -1,
        assetNameIdList: [],
        page: 1,
        length: 12
      },
      tableData: [],
      loading: false,
      freeImageUrl: require('@/static/icons/asset-free.svg'),
      usedImageUrl: require('@/static/icons/asset-used.svg'),
      borrowImageUrl: require('@/static/icons/asset-borrow.svg'),
      disposeImageUrl: require('@/static/icons/asset-dispose.svg')
    }
  },
  computed: {},
  mounted () {
    this.getTotalStatistics()
    this.fetchData()
  },
  components: {
    ItAssetStatsReport,
    ItAssetMonthStatsReport,
    ItAssetCompanyTypeStatsReport
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
        return '处置'
      }
      return '暂未配置'
    },
    disposeTypeFilters (disposeType) {
      if (disposeType === 1) {
        return '退租处理'
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
      return '暂未配置'
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
    getTotalStatistics () {
      queryItAssetTotalStats()
        .then(res => {
          this.totalStats = {
            total: res.body.total,
            freeTotal: res.body.freeTotal,
            usedTotal: res.body.usedTotal,
            borrowTotal: res.body.borrowTotal,
            disposeTotal: res.body.disposeTotal
          }
          this.$refs.itAssetCompanyTypeStatsReport.initData(this.totalStats.total)
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
    fetchData () {
      this.loading = true
      queryOcItAssetPage(this.queryParam)
        .then(res => {
          this.tableData = res.body.data
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.font-size {
  font-size: 45px;
  color: #20A9D9;
  font-weight: 300;
}

.font-subtext {
  font-size: 12px;
  color: #B7B6B6;
  margin-top: 5px
}
</style>
