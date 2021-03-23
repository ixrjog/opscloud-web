<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="子域名转发" name="subdomainForward">
        <el-row :gutter="20">
          <el-col :span="8">
            <nginx-subdomain-forward-table ref="nginxSubdomainForward"
                                           @handlerInstance="handlerInstance">
            </nginx-subdomain-forward-table>
          </el-col>
          <el-col :span="16">
            <nginx-subdomain-forward-instance-table ref="nginxSubdomainForwardInstanceTable"
                                                    @handlerInstanceUpdate="handlerInstanceUpdate">
            </nginx-subdomain-forward-instance-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="路径转发" name="pathForward" v-if="false">
        <nginx-path-forward-table ref="nginxPathForward"></nginx-path-forward-table>
      </el-tab-pane>
      <el-tab-pane label="TCP转发" name="tcpForward">
        <nginx-tcp-forward-instance-table ref="nginxTCPForwardInstanceTable"></nginx-tcp-forward-instance-table>
      </el-tab-pane>
      <el-tab-pane label="upstream" name="upstream">
        <nginx-upstream-table ref="nginxUpstreamTable"></nginx-upstream-table>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>
import NginxSubdomainForwardTable from '@/components/opscloud/nginx/NginxSubdomainForwardTable'
import NginxSubdomainForwardInstanceTable from '@/components/opscloud/nginx/NginxSubdomainForwardInstanceTable'
import NginxPathForwardTable from '@/components/opscloud/nginx/NginxPathForwardTable'
import NginxTcpForwardInstanceTable from '@/components/opscloud/nginx/NginxTCPForwardInstanceTable'
import NginxUpstreamTable from '@/components/opscloud/nginx/NginxUpstreamTable'

export default {
  data () {
    return {
      activeName: 'subdomainForward',
      title: 'Nginx配置管理'
    }
  },
  components: {
    NginxSubdomainForwardTable,
    NginxSubdomainForwardInstanceTable,
    NginxPathForwardTable,
    NginxTcpForwardInstanceTable,
    NginxUpstreamTable
  },
  methods: {
    handleClick (tab, event) {
      if (tab.name === 'subdomainForward') {
        this.$refs.nginxSubdomainForward.fetchData()
        this.$refs.nginxSubdomainForwardInstanceTable.fetchData()
      }
      if (tab.name === 'tcpForward') {
        this.$refs.nginxTCPForwardInstanceTable.fetchData()
      }
      if (tab.name === 'upstream') {
        this.$refs.nginxUpstreamTable.fetchData()
      }
    },
    handlerInstance (data) {
      this.$refs.nginxSubdomainForwardInstanceTable.initData(data)
    },
    handlerInstanceUpdate () {
      this.$refs.nginxSubdomainForward.fetchData()
    }
  }
}
</script>
