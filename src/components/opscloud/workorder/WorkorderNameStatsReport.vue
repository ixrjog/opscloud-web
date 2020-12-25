<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row>
        <span style="float: right">
          <el-tooltip class="item" effect="dark" content="刷新" placement="top">
            <el-button type="text" icon="el-icon-refresh" :disabled="loading" style="margin-left: 5px"
                       @click="fetchData" size="mini" plain></el-button>
          </el-tooltip>
        </span>
      </el-row>
      <div id="workorderNameStatsReport" style="width: 100%; height: 500px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryWorkorderStatsByName } from '@api/workorder/workorder'

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'WorkorderNameStatsReport',
  data () {
    return {
      nameStats: []
    }
  },
  mixins: [],
  components: {},
  mounted () {
  },
  methods: {
    initChart () {
      let myChart = echarts.init(document.getElementById('workorderNameStatsReport'))
      let data = this.nameStats

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
            name: '工单名称',
            type: 'pie',
            radius: ['30%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
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
      queryWorkorderStatsByName()
        .then(res => {
          this.nameStats = res.body
          this.initChart()
        })
    }
  }
}
</script>

<style scoped>
</style>
