<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="域名列表" name="domain">
        <aliyun-domain-table ref="domainTable"></aliyun-domain-table>
      </el-tab-pane>
      <el-tab-pane label="域名管理" name="domainMgmt">
        <aliyun-domain-mgmt-table ref="domainMgmtTable" @handlerSetActive="handlerSetActive"></aliyun-domain-mgmt-table>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>


import AliyunDomainMgmtTable from '@/components/opscloud/aliyun/dns/AliyunDomainMgmtTable'
import AliyunDomainTable from '@/components/opscloud/aliyun/dns/AliyunDomainTable'

export default {
  data () {
    return {
      activeName: 'domain',
      title: '域名管理'
    }
  },
  components: {
    AliyunDomainMgmtTable,
    AliyunDomainTable
  },
  methods: {
    handlerSetActive () {
      this.$refs.domainTable.fetchData()
    }
  }
}
</script>
