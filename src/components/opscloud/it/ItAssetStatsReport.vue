<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <div id="itAssetStatsReport" style="width: 100%; height: 496px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryItAssetStatistics } from '@api/it/it.asset'

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'ItAssetStatsReport',
  data () {
    return {
      nameStatistics: [],
      typeStatistics: [],
      legendDate: []
    }
  },
  mixins: [],
  components: {},
  mounted () {
    this.fetchData()
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('itAssetStatsReport'))
      let nameStats = this.nameStatistics
      let typeStats = this.typeStatistics
      let legendDate = this.legendDate

      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: 10,
          top: 20,
          bottom: 20,
          data: legendDate,
          selected: typeStats
        },
        series: [
          {
            name: '资产分类',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner',
              formatter: '{b}: {c}'
            },
            labelLine: {
              show: false
            },
            data: typeStats
          },
          {
            name: '资产名称',
            type: 'pie',
            radius: ['40%', '55%'],
            label: {
              formatter: '{b}'
            },
            data: nameStats
          }
        ]
      }
      myChart.setOption(option)
    },
    fetchData () {
      queryItAssetStatistics()
        .then(res => {
          this.nameStatistics = res.body.nameStatistics
          this.typeStatistics = res.body.typeStatistics
          this.legendDate = []
          this.nameStatistics.map(name => (
            this.legendDate.push(name.name)
          ))
          this.typeStatistics.map(name => (
            this.legendDate.push(name.name)
          ))
          this.initChart()
        })
    }
  }
}
</script>

<style scoped>
</style>
