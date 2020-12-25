<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row>
        <span style="float: right">
          <el-tooltip class="item" effect="dark" content="刷新" placement="top">
            <el-button type="text" icon="el-icon-refresh" style="margin-left: 5px"
                       @click="fetchData" size="mini" plain></el-button>
          </el-tooltip>
        </span>
      </el-row>
      <div id="workorderMonthStatsReport" style="width: 100%; height: 500px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryWorkorderStatsByMonth } from '@api/workorder/workorder'

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

const data = {
  name: '',
  type: 'bar',
  stack: '',
  emphasis: {
    focus: 'series'
  },
  data: []
}

export default {
  name: 'WorkorderMonthStatsReport',
  data () {
    return {
      monthStatistics: {},
      legendData: [],
      xData: [],
      yData: [],
      detail: false
    }
  },
  mixins: [],
  components: {},
  mounted () {
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('workorderMonthStatsReport'))
      let xData = this.xData
      let yData = this.yData
      let legendDate = this.legendDate

      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: legendDate
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: xData
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: yData
      }
      myChart.setOption(option, true)
    },
    fetchData () {
      queryWorkorderStatsByMonth()
        .then(res => {
          this.monthStatistics = res.body
          this.initData()
          this.initChart()
        })
    },
    initData () {
      this.xData = []
      this.yData = []
      this.legendData = []
      this.xData = this.monthStatistics.dateCatList
      let nameMap = this.objToMap(this.monthStatistics.nameStatistics)
      nameMap.forEach((value, key) => {
        this.legendData.push(key)
        let type = Object.assign({}, data)
        type.name = key
        type.stack = 'type'
        type.data = value
        this.yData.push(type)
      })
    },
    objToMap (obj) {
      let map = new Map()
      for (let k in obj) {
        map.set(k, obj[k])
      }
      return map
    }
  }
}
</script>

<style scoped>
</style>
