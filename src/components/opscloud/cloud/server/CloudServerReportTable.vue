<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>服务器总数</span>
            <el-tag style="float: right" type="text">server</el-tag>
          </div>
          <el-row>
            <span class="font-size">{{ resStats.serverTotal }}</span>
          </el-row>
          <el-row class="font-subtext">All server</el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>CPU总数</span>
            <el-tag style="float: right" type="text">cpu</el-tag>
          </div>
          <el-row>
            <span class="font-size">{{ resStats.cpuTotal }}</span>
            <span class="font-unit">C</span>
          </el-row>
          <el-row class="font-subtext">All cpu</el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>内存总数</span>
            <el-tag style="float: right" type="text">memory</el-tag>
          </div>
          <el-row>
            <span class="font-size">{{ resStats.memory }}</span>
            <span class="font-unit">{{ resStats.memoryUnit }}</span>
          </el-row>
          <el-row class="font-subtext">All memory</el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>磁盘总容量</span>
            <el-tag style="float: right" type="text">disk</el-tag>
          </div>
          <el-row>
            <span class="font-size">{{ resStats.disk }}</span>
            <span class="font-unit">{{ resStats.diskUnit }}</span>
          </el-row>
          <el-row class="font-subtext">All disk</el-row>
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
        diskTotal: 0,
        memory: '',
        memoryUnit: '',
        disk: '',
        diskUnit: ''
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
.font-size {
  font-size: 45px;
  color: #20A9D9;
  font-weight: 300;
}

.font-unit {
  margin-left: 10px;
  font-size: 25px;
  color: #aba4a4;
}

.font-subtext {
  font-size: 12px;
  color: #B7B6B6;
  margin-top: 5px
}
</style>
