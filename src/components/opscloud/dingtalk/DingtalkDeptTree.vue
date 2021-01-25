<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row>
        <el-popconfirm title="确定全量同步部门吗？" @onConfirm="handlerSync">
          <el-button slot="reference" :loading="syncLoading" :disabled="syncLoading" size="mini">同步
          </el-button>
        </el-popconfirm>
        <span style="float: right">
          <el-tooltip class="item" effect="dark" content="刷新" placement="top">
            <el-button type="text" icon="el-icon-refresh" :disabled="loading" style="margin-left: 5px"
                       @click="handlerRefresh" size="mini" plain></el-button>
          </el-tooltip>
        </span>
      </el-row>
      <div id="dingtalkDeptTree" style="width: 100%; height: 600px;"></div>
    </el-card>
  </div>
</template>

<script>
import { queryDingtalkDeptTree, refreshDingtalkDeptTree, syncDept } from '@api/dingtalk/dingtalk.dept'

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/map/js/china')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')

export default {
  name: 'DingtalkDeptTree',
  data () {
    return {
      uid: 'xincheng',
      syncLoading: false,
      loading: false
    }
  },
  mixins: [],
  components: {},
  mounted () {
    this.fetchData()
  },
  methods: {
    initChart (data) {
      let myChart = echarts.init(document.getElementById('dingtalkDeptTree'))
      let option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: [
          {
            type: 'tree',
            data: [data],
            left: '2%',
            right: '2%',
            top: '8%',
            bottom: '20%',
            symbol: 'emptyCircle',
            orient: 'vertical',
            expandAndCollapse: true,

            label: {
              position: 'top',
              rotate: 0,
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 12
            },
            leaves: {
              label: {
                position: 'bottom',
                rotate: -90,
                verticalAlign: 'middle',
                align: 'left'
              }
            },
            animationDurationUpdate: 750
          }
        ]
      }
      myChart.setOption(option, true)
    },
    fetchData () {
      queryDingtalkDeptTree(this.uid)
        .then(res => {
          this.initChart(res.body)
        })
    },
    handlerRefresh () {
      this.loading = true
      refreshDingtalkDeptTree(this.uid)
        .then(res => {
          this.initChart(res.body)
          this.loading = true
        })
    },
    handlerSync () {
      this.syncLoading = true
      setTimeout(() => {
        syncDept(this.uid)
          .then(res => {
            this.$message({
              message: '后台同步数据中',
              type: 'success'
            })
            this.fetchData()
            this.syncLoading = false
          })
      }, 600)
    }
  }
}
</script>

<style>
</style>
