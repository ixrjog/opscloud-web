<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="15">
        <el-col :span="24">
          <fault-info-month-stats-report></fault-info-month-stats-report>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

import FaultInfoMonthStatsReport from '@/components/opscloud/fault/FaultInfoMonthStatsReport'

export default {
  name: 'FaultInfoReport',
  data () {
    return {
      title: '故障统计'
    }
  },
  computed: {},
  mounted () {
    this.getTotalStatistics()
    this.fetchData()
  },
  components: {
    FaultInfoMonthStatsReport
  },
  filters: {
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
