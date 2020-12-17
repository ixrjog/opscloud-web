<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row :gutter="20">
        <span style="color: #99a9bf">资产总数: {{ assetTotal }}</span>
      </el-row>
      <div style="margin-top: 23px"></div>
      <el-row :gutter="20">
        <el-tag>租赁总数: {{ assetCompanyTypeStats.leaseTotal }}</el-tag>
        <el-tag type="success" style="margin-left: 10px">采购总数: {{ assetCompanyTypeStats.purchaseTotal }}</el-tag>
      </el-row>
      <div style="margin-top: 30px"></div>
      <div id="itAssetCompanyTypeStatsReport" style="width: 100%; height: 366px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryItAssetCompanyTypeStats } from '@api/it/it.asset'

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'ItAssetCompanyTypeStatsReport',
  data () {
    return {
      loading: false,
      assetCompanyTypeStats: {},
      assetTotal: 0
    }
  },
  mixins: [],
  components: {},
  mounted () {
    this.fetchData()
  },
  methods: {
    initData (assetTotal) {
      this.assetTotal = assetTotal
    },
    initChart () {
      let myChart = echarts.init(document.getElementById('itAssetCompanyTypeStatsReport'))
      let data = this.assetCompanyTypeStats.assetCompanyStats

      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: '公司名称',
            type: 'pie',
            radius: ['50%', '80%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      }
      myChart.setOption(option, true)
    },
    fetchData () {
      queryItAssetCompanyTypeStats()
        .then(res => {
          this.assetCompanyTypeStats = res.body
          this.initChart()
        })
    }
  }
}
</script>

<style scoped>
</style>
