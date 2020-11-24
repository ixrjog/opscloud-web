<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="实例" name="instance">
          <opscloud-instance-table></opscloud-instance-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </d2-container>
</template>

<script>
// Component
import OpscloudInstanceTable from '@/components/opscloud/table/OpscloudInstanceTable'

export default {
  data () {
    return {
      title: 'Opscloud实例管理',
      activeName: 'instance'
    }
  },
  computed: {},
  mounted () {
  },
  components: {
    OpscloudInstanceTable
  },
  methods: {}
}
</script>
