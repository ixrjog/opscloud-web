<template>
  <div>
    <el-card shadow="hover">
      <el-row>
        <el-date-picker v-model="dateValue" type="year" placeholder="选择年" @change="handlerChange"
                        value-format="timestamp"></el-date-picker>
      </el-row>
      <div id="cloudServerMonthReport" style="width: 100%; height: 300px; margin-top: 20px"></div>
    </el-card>
  </div>
</template>

<script>
import { queryServerMonthStatsReportByType } from '@api/cloud/cloud.server'

const nowTime = new Date()

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'CloudServerMonthReport',
  data () {
    return {
      dateValue: nowTime,
      queryYear: nowTime.getFullYear(),
      cloudServerType: '',
      serverMonthStats: [],
      xData: [],
      yData: []
    }
  },
  mixins: [],
  components: {},
  mounted () {
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('cloudServerMonthReport'))
      this.xData = []
      this.yData = []
      for (let data of this.serverMonthStats) {
        this.xData.push(data.dateCat)
        this.yData.push(data.value)
      }
      let xData = this.xData
      let yData = this.yData

      let option = {
        title: {
          text: '月新增统计'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
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
            data: xData,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: '60%',
            data: yData
          }
        ]
      }
      myChart.setOption(option, true)
    },
    fetchData () {
      let requestBody = {
        queryYear: this.queryYear,
        cloudServerType: this.cloudServerType
      }
      queryServerMonthStatsReportByType(requestBody)
        .then(res => {
          this.serverMonthStats = res.body
          this.initChart()
        })
    },
    handlerChange (value) {
      if (value === null) {
        this.$message.warning('请选择年份')
        return
      }
      this.queryYear = new Date(value).getFullYear()
      this.fetchData()
    },
    initData (cloudServerType) {
      this.cloudServerType = cloudServerType
      this.fetchData()
    }
  }
}
</script>

<style scoped>
</style>
