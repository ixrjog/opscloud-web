<template>
  <d2-container>
    <template>
      <h1>{{ title }}</h1>
      <el-tabs v-model="activeName">
        <el-tab-pane label="HelpDesk报表" name="report">
          <help-desk-report-table></help-desk-report-table>
        </el-tab-pane>
        <el-tab-pane label="HelpDesk详情" name="detail">
          <help-desk-table></help-desk-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </d2-container>
</template>

<script>

// Component
import HelpDeskReportTable from '@/components/opscloud/helpdesk/HelpDeskReportTable'
import HelpDeskTable from '@/components/opscloud/helpdesk/HelpDeskTable'

export default {
  name: 'HelpDeskReport',
  data () {
    return {
      title: 'HelpDesk',
      activeName: 'report'
    }
  },
  computed: {},
  mounted () {
  },
  components: {
    HelpDeskReportTable,
    HelpDeskTable
  },
  methods: {}
}
</script>

<style scoped>
</style>
