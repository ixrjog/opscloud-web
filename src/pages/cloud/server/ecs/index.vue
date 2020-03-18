<template>
  <d2-container>
    <h1>{{title}}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="主机管理" name="server">
        <CloudServerTable :formStatus="formCloudServerStatus" ref="cloudServerTable"></CloudServerTable>
      </el-tab-pane>
      <el-tab-pane label="镜像管理" name="image">镜像管理</el-tab-pane>
    </el-tabs>

  </d2-container>
</template>

<script>

  import CloudServerTable from '@/components/opscloud/table/CloudServerTable.vue'

  export default {
    data () {
      return {
        activeName: 'server',
        formCloudServerStatus: {
          cloudServerKey: 'AliyunECSCloudServer',
          serverType: 2,
          showCpuColumn: true,
          showMemoryColumn: true
        },
        title: 'Aliyun:ECS实例管理'
      }
    },
    components: {
      CloudServerTable
    },
    mounted () {
      //   this.$refs.cloudServerTable.fetchData()
    },
    methods: {}
  }
</script>

<style>
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
