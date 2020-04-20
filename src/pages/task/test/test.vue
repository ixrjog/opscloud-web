<template>
  <d2-container>
    <template>
      <div>
        <h1>标签配置</h1>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="account_name" label="账户名"></el-table-column>
        <el-table-column prop="product" label="产品"></el-table-column>
        <el-table-column prop="billing_cycle" label="账单周期"></el-table-column>
        <el-table-column prop="pretax_amount" label="账单金额"></el-table-column>
      </el-table>
    </template>
  </d2-container>
</template>

<script>
  export default {
    data () {
      return {
        tableData: []
      }
    },
    name: 'test',
    mounted () {
      this.initData()
    },
    methods: {
      initData () {
        this.tableData = [
          {
            account_name: 'qul@gegejia.com',
            product: 'ecs',
            billing_cycle: '2020-01',
            pretax_amount: 1337073.3800000001
          },
          {
            account_name: 'qul@gegejia.com',
            product: 'ecs',
            billing_cycle: '2020-02',
            pretax_amount: 977093.94
          }]
      }
    }
  }
</script>

<style scoped>

</style>
