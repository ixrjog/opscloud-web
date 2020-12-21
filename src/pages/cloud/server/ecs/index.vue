<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="实例报表" name="report">
        <cloud-server-report-table ref="cloudServerReportTable"></cloud-server-report-table>
      </el-tab-pane>
      <el-tab-pane label="实例管理" name="server">
        <cloud-server-table :formStatus="formCloudServerStatus" ref="cloudServerTable"></cloud-server-table>
      </el-tab-pane>
      <el-tab-pane label="付费管理" name="serverCharge">
        <cloud-server-charge-table :formStatus="formCloudServerChargeStatus"
                                   ref="cloudServerChargeTable"></cloud-server-charge-table>
      </el-tab-pane>
      <el-tab-pane label="镜像管理" name="image">
        <cloud-image-table :formStatus="formCloudImageStatus" ref="cloudImageTable"></cloud-image-table>
      </el-tab-pane>
      <el-tab-pane label="VPC管理" name="vpc">
        <cloud-vpc-table :formStatus="formCloudVPCStatus" ref="cloudVPCTable"></cloud-vpc-table>
      </el-tab-pane>
      <el-tab-pane label="实例模版" name="instanceTemplate">
        <cloud-instance-template-table :formStatus="formCloudInstanceTemplateStatus"
                                       ref="cloudInstanceTemplateTable"></cloud-instance-template-table>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>

import CloudServerTable from '@/components/opscloud/cloud/server/CloudServerTable.vue'
import CloudImageTable from '@/components/opscloud/cloud/server/CloudImageTable.vue'
import CloudVpcTable from '@/components/opscloud/cloud/server/CloudVPCTable.vue'
import CloudInstanceTemplateTable from '@/components/opscloud/cloud/server/CloudInstanceTemplateTable.vue'
import CloudServerChargeTable from '@/components/opscloud/cloud/server/CloudServerChargeTable.vue'
import CloudServerReportTable from '@/components/opscloud/cloud/server/CloudServerReportTable'

export default {
  data () {
    return {
      activeName: 'report',
      cloudInstanceKey: 'AliyunECSCloudServer',
      serverType: 2,
      formCloudServerStatus: {
        cloudServerKey: 'AliyunECSCloudServer',
        serverType: 2,
        showCpuColumn: true,
        showMemoryColumn: true
      },
      formCloudServerChargeStatus: {
        cloudServerKey: 'AliyunECSCloudServer',
        serverType: 2
      },
      formCloudImageStatus: {
        cloudImageKey: 'AliyunECSCloudServer',
        cloudType: 2
      },
      formCloudVPCStatus: {
        cloudVPCKey: 'AliyunECSCloudServer',
        cloudType: 2
      },
      formCloudInstanceTemplateStatus: {
        cloudInstanceKey: 'AliyunECSCloudServer',
        cloudType: 2
      },
      title: 'Aliyun:ECS实例管理'
    }
  },
  components: {
    CloudServerTable,
    CloudServerChargeTable,
    CloudImageTable,
    CloudVpcTable,
    CloudInstanceTemplateTable,
    CloudServerReportTable
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.$refs.cloudServerReportTable.initData(this.serverType)
    }
  }
}
</script>

<style scoped>
.table-expand {
  font-size: 0;
}

.table-expand label {
  width: 150px;
  color: #99a9bf;
}

.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
