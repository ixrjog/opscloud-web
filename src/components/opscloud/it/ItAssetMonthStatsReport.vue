<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row>
        <span style="color: #99a9bf">月新增统计</span>
      </el-row>
      <el-row>
        <span style="float: right">
          <el-checkbox v-model="detail" @change="handlerChange">详情</el-checkbox>
          <el-tooltip class="item" effect="dark" content="刷新" placement="top">
            <el-button type="text" icon="el-icon-refresh" :disabled="loading" style="margin-left: 5px"
                       @click="handlerRefresh" size="mini" plain></el-button>
          </el-tooltip>
        </span>
      </el-row>
      <div id="itAssetMonthStatsReport" style="width: 100%; height: 600px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryItAssetMonthStatistics, refreshAssetMonthStatistics } from '@api/it/it.asset'

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
  name: 'ItAssetMonthStatsReport',
  data () {
    return {
      loading: false,
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
    this.fetchData()
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('itAssetMonthStatsReport'))
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
      queryItAssetMonthStatistics()
        .then(res => {
          this.monthStatistics = res.body
          this.handlerChange()
        })
    },
    handlerRefresh () {
      this.loading = true
      refreshAssetMonthStatistics()
        .then(res => {
          this.monthStatistics = res.body
          this.handlerChange()
          this.loading = false
        })
    },
    initData () {
      this.xData = []
      this.yData = []
      this.legendData = []
      this.xData = this.monthStatistics.dateCatList
      let typeMap = this.objToMap(this.monthStatistics.typeStatistics)
      typeMap.forEach((value, key) => {
        this.legendData.push(key)
        let type = Object.assign({}, data)
        type.name = key
        type.stack = 'type'
        type.data = value
        this.yData.push(type)
      })
      if (this.detail) {
        let map = this.objToMap(this.monthStatistics.nameStatistics)
        for (let value of map.values()) {
          let nameMap = this.objToMap(value)
          nameMap.forEach((value, key) => {
            this.legendData.push(key)
            let name = Object.assign({}, data)
            name.name = key
            name.stack = 'name'
            name.data = value
            name.barWidth = 35
            this.yData.push(name)
          })
        }
      }
    },
    objToMap (obj) {
      let map = new Map()
      for (let k in obj) {
        map.set(k, obj[k])
      }
      return map
    },
    handlerChange () {
      this.initData()
      this.initChart()
    }
  }
}
</script>

<style scoped>
</style>
