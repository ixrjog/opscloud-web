<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">
              <span class="span-font-label">空闲</span>
              <img :src="freeImageUrl" class="img-style">
            </div>
            <span class="font-class">{{ totalStats.freeTotal }}</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">
              <span class="span-font-label">在用</span>
              <img :src="usedImageUrl" class="img-style">
            </div>
            <span class="font-class">{{ totalStats.usedTotal }}</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">
              <span class="span-font-label">借用</span>
              <img :src="borrowImageUrl" class="img-style">
            </div>
            <span class="font-class">{{ totalStats.borrowTotal }}</span>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div slot="header">
              <span class="span-font-label">处置</span>
              <img :src="disposeImageUrl" class="img-style">
            </div>
            <span class="font-class">{{ totalStats.disposeTotal }}</span>
          </el-card>
        </el-col>
      </el-row>
      <div style="margin-bottom: 20px"></div>
      <el-row :gutter="20">
        <el-col :span="16">
          <it-asset-stats-report></it-asset-stats-report>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-row>
              <span style="color: #99a9bf">最新入库资产</span>
              <span style="float: right">
              <el-tag>资产总计：{{ totalStats.total }}</el-tag>
              <el-tooltip class="item" effect="dark" content="点击查看资产列表详情" placement="top">
                <el-link href="https://oc.xinc818.com/index.html#/it/asset" :underline="false" target="_blank">
                  <i style="margin-left: 5px" class="el-icon-position"></i>
                </el-link>
              </el-tooltip>
            </span>
            </el-row>
            <div style="margin-bottom: 6px"></div>
            <el-table :data="tableData" style="width: 100%" v-loading="loading">
              <el-table-column prop="assetCode" label="资产编码"></el-table-column>
              <el-table-column label="资产状态">
                <template slot-scope="props">
                  <el-tag :type="getAssetStatusColor(props.row.assetStatus)">
                    {{ props.row.assetStatus | assetStatusFilters }}
                  </el-tag>
                  <el-tag v-if="props.row.assetStatus===4" style="margin-left: 5px">
                    {{ props.row.disposeType | disposeTypeFilters }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="assetName" label="资产名称"></el-table-column>
              <el-table-column prop="assetAddTime" label="购置/起租日期"></el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <div style="margin-bottom: 20px"></div>
      <el-row :gutter="20">
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
        length: 20
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
    ItAssetMonthStatsReport
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
.span-font-label {
  font-size: 16px;
  color: #99a9bf;
}

.font-class {
  float: right;
  font-size: 50px;
  color: #06b8ee;
  font-weight: lighter;
  margin-right: 10px;
}
.img-style {
  width: 30px;
  float: right;
}
</style>
