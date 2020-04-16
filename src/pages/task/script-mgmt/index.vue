<template>
  <d2-container>
    <h1>{{title}}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Playbook" name="playbook">
        <AnsiblePlaybookTable  ref="ansiblePlaybookTable"></AnsiblePlaybookTable>
      </el-tab-pane>
      <el-tab-pane label="Script" name="script">
        <AnsibleScriptTable  ref="ansibleScriptTable"></AnsibleScriptTable>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>

  import AnsiblePlaybookTable from '@/components/opscloud/table/AnsiblePlaybookTable.vue'
  // queryScriptPage
  import AnsibleScriptTable from '@/components/opscloud/table/AnsibleScriptTable.vue'

  export default {
    data () {
      return {
        activeName: 'playbook',
        title: '任务脚本管理'
      }
    },
    components: {
      AnsiblePlaybookTable,
      AnsibleScriptTable
    },
    mounted () {
      this.$refs.ansiblePlaybookTable.fetchData()
      this.$refs.ansibleScriptTable.fetchData()
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
