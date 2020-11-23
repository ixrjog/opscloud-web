<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <div id="helpDeskTypeReportChart" style="width: 100%; height: 300px;"></div>
    </el-card>
  </div>
</template>

<script>

  import { queryHelpDeskGroupByTypes } from '@api/dashboard/dashboard.js'

  let echarts = require('echarts/lib/echarts')
  require('echarts/lib/chart/pie')
  require('echarts/map/js/china')
  require('echarts/lib/chart/line')
  require('echarts/lib/chart/bar')
  require('echarts/lib/component/tooltip')
  require('echarts/lib/component/legend')

  export default {
    name: 'HelpDeskPieReport',
    data () {
      return {}
    },
    mixins: [],
    components: {},
    mounted () {
      this.fetchData()
    },
    methods: {
      initChart (data) {
        let myChart = echarts.init(document.getElementById('helpDeskTypeReportChart'))

        let option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: ['桌面维护', '资产管理', '网络管理 ', '用户管理', '邮箱管理', 'IT知识库', '监控管理', '行为管理']
          },
          series: [
            {
              name: '事件分类',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: data.heplDeskGroupByTypes
            }
          ]
        }

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
      },
      fetchData () {
        queryHelpDeskGroupByTypes()
          .then(res => {
            this.initChart(res.body)
          })
      }
    }
  }
</script>

<style>

</style>
