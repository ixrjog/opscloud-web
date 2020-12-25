<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <workorder-name-stats-report ref="workorderMonthStatsReport"></workorder-name-stats-report>
      </el-col>
      <el-col :span="16">
        <workorder-month-stats-report ref="workorderNameStatsReport"></workorder-month-stats-report>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// Component
import WorkorderMonthStatsReport from '@/components/opscloud/workorder/WorkorderMonthStatsReport'
import WorkorderNameStatsReport from '@/components/opscloud/workorder/WorkorderNameStatsReport'

export default {
  name: 'WorkorderReportTable',
  data () {
    return {}
  },
  computed: {},
  mounted () {
  },
  components: {
    WorkorderMonthStatsReport,
    WorkorderNameStatsReport
  },
  methods: {
    initReport () {
      this.$refs.workorderMonthStatsReport.fetchData()
      this.$refs.workorderNameStatsReport.fetchData()
    }
  }
}
</script>

<style scoped>
</style>
