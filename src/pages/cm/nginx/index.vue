<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="子域名转发" name="subdomainForward">
        <el-row :gutter="10">
          <el-col :span="9">
            <el-card shadow="never">
              <nginx-subdomain-forward-table ref="nginxSubdomainForward"
                                             @handlerInstance="handlerInstance">
              </nginx-subdomain-forward-table>
            </el-card>
          </el-col>
          <el-col :span="15">
            <el-card shadow="never">
              <nginx-subdomain-forward-instance-table ref="nginxSubdomainForwardInstanceTable"
                                                      @handlerInstanceUpdate="handlerInstanceUpdate">
              </nginx-subdomain-forward-instance-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="路径转发" name="pathForward" v-if="false">
        <nginx-path-forward-table ref="nginxPathForward"></nginx-path-forward-table>
      </el-tab-pane>
      <el-tab-pane label="tcp转发" name="tcpForward">
        <nginx-tcp-forward-instance-table ref="nginxTCPForwardInstanceTable"></nginx-tcp-forward-instance-table>
      </el-tab-pane>
      <el-tab-pane label="upstream" name="upstream">
        <nginx-upstream-table ref="nginxUpstreamTable"></nginx-upstream-table>
      </el-tab-pane>
      <el-tab-pane label="自定义配置" name="custom">
        <nginx-custom-instance-table ref="NginxCustomInstanceTable"></nginx-custom-instance-table>
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
import NginxCustomInstanceTable from '@/components/opscloud/nginx/NginxCustomInstanceTable'

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
    NginxUpstreamTable,
    NginxCustomInstanceTable
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
      if (tab.name === 'custom') {
        this.$refs.NginxCustomInstanceTable.fetchData()
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
