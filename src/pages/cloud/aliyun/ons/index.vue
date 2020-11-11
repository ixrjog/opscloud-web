<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="实例管理" name="onsInstance">
        <AliyunONSInstanceTable ref="aliyunONSInstanceTable"></AliyunONSInstanceTable>
      </el-tab-pane>
      <el-tab-pane label="Topic管理" name="onsTopic">
        <AliyunONSTopicTable ref="aliyunONSTopicTable"></AliyunONSTopicTable>
      </el-tab-pane>
      <el-tab-pane label="Group管理" name="onsGroupId">
        <AliyunONSGroupTable ref="aliyunONSGroupTable"></AliyunONSGroupTable>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>

import AliyunONSInstanceTable from '@/components/opscloud/table/AliyunONSInstanceTable.vue'
import AliyunONSTopicTable from '@/components/opscloud/table/AliyunONSTopicTable.vue'
import AliyunONSGroupTable from '@/components/opscloud/table/AliyunONSGroupTable.vue'

export default {
  data () {
    return {
      activeName: 'onsInstance',
      title: '消息队列'
    }
  },
  components: {
    AliyunONSInstanceTable,
    AliyunONSTopicTable,
    AliyunONSGroupTable
  },
  mounted () {
  },
  methods: {}
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
