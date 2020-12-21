<template>
  <d2-container>
    <h1>{{title}}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="SLB列表" name="slbMgmt">
        <aliyun-slb-mgmt-table ref="aliyunSLBMgmtTable"></aliyun-slb-mgmt-table>
      </el-tab-pane>
      <el-tab-pane label="证书管理" name="certificateMgmt">
        <certificate-mgmt-table ref="certificateMgmtTable"></certificate-mgmt-table>
      </el-tab-pane>
      <el-tab-pane label="访问控制管理" name="slbACLMgmt">
        <aliyun-slb-acl-mgmt-table ref="certificateMgmtTable"></aliyun-slb-acl-mgmt-table>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>
import AliyunSlbMgmtTable from '@/components/opscloud/aliyun/slb/AliyunSLBMgmtTable'
import CertificateMgmtTable from '@/components/opscloud/aliyun/slb/CertificateMgmtTable'
import AliyunSlbAclMgmtTable from '@/components/opscloud/aliyun/slb/AliyunSLBACLMgmtTable'

export default {
  data () {
    return {
      activeName: 'slbMgmt',
      title: '负载均衡管理'
    }
  },
  components: {
    AliyunSlbMgmtTable,
    CertificateMgmtTable,
    AliyunSlbAclMgmtTable
  }
}
</script>
