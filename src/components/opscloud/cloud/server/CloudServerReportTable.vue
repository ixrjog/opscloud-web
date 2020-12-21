<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>服务器总数</span>
            <el-tag style="float: right" type="text">server</el-tag>
          </div>
          <div style="font-size: 45px;color:#20A9D9 ;font-weight: 300">{{ resStats.serverTotal }}</div>
          <div style="font-size: 10px; color: #B7B6B6">All server</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>CPU总数</span>
            <el-tag style="float: right" type="text">cpu</el-tag>
          </div>
          <div style="font-size: 45px; color:#20A9D9; font-weight: 300">{{ resStats.cpuTotal }}</div>
          <div style="font-size: 10px; color: #B7B6B6">All cpu</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>内存总数</span>
            <el-tag style="float: right" type="text">memory</el-tag>
          </div>
          <div style="font-size: 45px; color:#20A9D9; font-weight: 300">{{ resStats.memoryTotal }}</div>
          <div style="font-size: 10px; color: #B7B6B6">All memory</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>磁盘总容量</span>
            <el-tag style="float: right" type="text">disk</el-tag>
          </div>
          <div style="font-size: 45px; color:#20A9D9; font-weight: 300">{{ resStats.diskTotal }}</div>
          <div style="font-size: 10px; color: #B7B6B6">All disk</div>
        </el-card>
      </el-col>
    </el-row>
    <div style="margin-bottom: 20px"></div>
    <el-row :gutter="20">
      <el-col>
        <cloud-server-month-report ref="cloudServerMonthReport"></cloud-server-month-report>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { queryServerResStatsReport } from '@api/cloud/cloud.server'
import CloudServerMonthReport from '@/components/opscloud/cloud/server/CloudServerMonthReport'

export default {
  data () {
    return {
      resStats: {
        serverTotal: 0,
        cupTotal: 0,
        memoryTotal: 0,
        diskTotal: 0
      }
    }
  },
  name: 'CloudServerReportTable',
  props: ['formStatus'],
  mounted () {
  },
  computed: {},
  components: {
    CloudServerMonthReport
  },
  filters: {},
  methods: {
    initData (cloudServerType) {
      queryServerResStatsReport(cloudServerType)
        .then(res => {
          this.resStats = res.body
        })
      this.$refs.cloudServerMonthReport.initData(cloudServerType)
    }
  }
}
</script>

<style scoped>
</style>
