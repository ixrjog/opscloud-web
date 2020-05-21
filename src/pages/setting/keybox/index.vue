<template>
  <d2-container>
    <h1>{{title}}</h1>
    <KeyboxTable ref="keyboxTable"></KeyboxTable>
  </d2-container>
</template>

<script>

  import KeyboxTable from '@/components/opscloud/keybox/KeyboxTable.vue'

  export default {
    data () {
      return {
        title: '全局密钥管理'
      }
    },
    components: {
      KeyboxTable
    },
    mounted () {
      this.$refs.keyboxTable.fetchData()
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
