<template>
  <div>
    <el-card shadow="hover">
      <el-row>
        <el-date-picker v-model="dateValue" type="year" placeholder="选择年" @change="handlerChange"
                        value-format="timestamp"></el-date-picker>
      </el-row>
      <div id="faultInfoMonthStatsReport" style="width: 100%; height: 300px; margin-top: 20px"></div>
    </el-card>
  </div>
</template>

<script>
import { queryFaultInfoMonthStats } from '@api/fault/fault.info'

const nowTime = new Date()

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'FaultInfoMonthStatsReport',
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
    this.fetchData()
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('faultInfoMonthStatsReport'))
      // 指定图表的配置项和数据
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['P0', 'P1', 'P2', 'P3', 'P4', '无故障', '未定级']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value'
        },
        xAxis: {
          type: 'category',
          data: this.reportData.dateCat
        },
        series: [
          {
            name: 'P0',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.p0
          },
          {
            name: 'P1',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.p1
          },
          {
            name: 'P2',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.p2
          },
          {
            name: 'P3',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.p3
          },
          {
            name: 'P4',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.p4
          },
          {
            name: '无故障',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.noFault
          },
          {
            name: '未定级',
            type: 'bar',
            stack: '总量',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: this.reportData.unrated
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    },
    fetchData () {
      if (this.queryYear === '') {
        return
      }
      this.loading = true
      queryFaultInfoMonthStats(this.queryYear)
        .then(res => {
          this.reportData = res.body
          this.loading = false
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
