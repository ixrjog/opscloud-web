<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="8">
        <help-desk-type-report ref="helpDeskReport"></help-desk-type-report>
      </el-col>
      <el-col :span="16">
        <help-desk-report ref="helpDeskTypeReport"></help-desk-report>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// Component
import HelpDeskReport from '@/components/opscloud/dashboard/HelpDeskReport'
import HelpDeskTypeReport from '@/components/opscloud/dashboard/HelpDeskTypeReport'

export default {
  name: 'HelpDeskReportTable',
  data () {
    return {
      title: 'HelpDesk'
    }
  },
  computed: {},
  mounted () {
  },
  components: {
    HelpDeskReport,
    HelpDeskTypeReport
  },
  methods: {
    refreshData () {
      this.$refs.helpDeskReport.handlerRefresh()
      this.$refs.helpDeskTypeReport.handlerRefresh()
    }
  }
}
</script>

<style scoped>
.el-row {
  margin-left: 0px;
  margin-bottom: 5px;

&
:last-child {
}

}
</style>
