<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <div id="itAssetStatsReport" style="width: 100%; height: 460px;"></div>
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
      // 指定图表的配置项和数据
      let nameStats = this.nameStatistics
      let typeStats = this.typeStatistics
      let legendDate = this.legendDate

      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: legendDate
        },
        series: [
          {
            name: '访问来源',
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
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '65%'],
            label: {
              formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 1,
              borderRadius: 4,
              shadowBlur: 3,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
              shadowColor: '#999',
              padding: [0, 7],
              rich: {
                a: {
                  color: '#999',
                  lineHeight: 22,
                  align: 'center'
                },
                hr: {
                  borderColor: '#aaa',
                  width: '100%',
                  borderWidth: 0.5,
                  height: 0
                },
                b: {
                  fontSize: 16,
                  lineHeight: 33
                },
                per: {
                  color: '#eee',
                  backgroundColor: '#334455',
                  padding: [2, 4],
                  borderRadius: 2
                }
              }
            },
            data: nameStats
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
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
