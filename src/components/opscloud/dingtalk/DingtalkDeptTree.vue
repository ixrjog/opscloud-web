<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <el-row>
        <el-select v-model="uid" placeholder="选择公司" class="select">
          <el-option
            v-for="item in rootDeptOptions"
            :key="item.id"
            :label="item.deptName"
            :value="item.dingtalkUid">
          </el-option>
        </el-select>
        <el-button @click="fetchData" class="button" :disabled="uid === ''">查询</el-button>
        <el-popconfirm title="确定全量同步部门吗？" @onConfirm="handlerSync">
          <el-button slot="reference" :loading="syncLoading" :disabled="uid === ''" size="mini"
                     class="button">同步
          </el-button>
        </el-popconfirm>
        <span style="float: right">
          <el-tooltip class="item" effect="dark" content="刷新" placement="top">
            <el-button type="text" icon="el-icon-refresh" :loading="loading" style="margin-left: 5px"
                       @click="handlerRefresh" size="mini" plain :disabled="uid === ''"></el-button>
          </el-tooltip>
        </span>
      </el-row>
      <div id="dingtalkDeptTree" style="width: 100%; height: 600px;"></div>
    </el-card>
  </div>
</template>

<script>
import {
  queryDingtalkDeptTree,
  queryDingtalkRootDept,
  refreshDingtalkDeptTree,
  syncDept
} from '@api/dingtalk/dingtalk.dept'

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
      rootDeptOptions: [],
      uid: '',
      syncLoading: false,
      loading: false
    }
  },
  mixins: [],
  components: {},
  mounted () {
    this.getRootDept()
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
    getRootDept () {
      queryDingtalkRootDept()
        .then(res => {
          this.rootDeptOptions = res.body
        })
    },
    handlerRefresh () {
      this.loading = true
      refreshDingtalkDeptTree(this.uid)
        .then(res => {
          this.initChart(res.body)
          this.loading = false
        })
    },
    handlerSync () {
      this.syncLoading = true
      this.$message.info('后台数据同步中')
      setTimeout(() => {
        syncDept(this.uid)
          .then(res => {
            this.$message.success('同步完成')
            this.fetchData()
            this.syncLoading = false
          })
      }, 600)
    }
  }
}
</script>

<style scoped>
.button {
  margin-left: 5px;
}

.select {
  width: 200px;
  max-width: 250px;
}
</style>
