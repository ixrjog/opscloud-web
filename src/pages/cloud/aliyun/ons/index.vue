<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-tabs v-model="activeName">
      <el-tab-pane label="实例管理" name="onsInstance">
        <aliyun-ons-instance-table ref="aliyunONSInstanceTable"></aliyun-ons-instance-table>
      </el-tab-pane>
      <el-tab-pane label="Topic管理" name="onsTopic">
        <aliyun-ons-topic-table ref="aliyunONSTopicTable"></aliyun-ons-topic-table>
      </el-tab-pane>
      <el-tab-pane label="Group管理" name="onsGroupId">
        <AliyunOnsGroupTable ref="aliyunONSGroupTable"></AliyunOnsGroupTable>
      </el-tab-pane>
      <el-tab-pane label="使用说明" name="help">
        <d2-markdown :source="doc.previewDoc" v-if="success"/>
      </el-tab-pane>
    </el-tabs>
  </d2-container>
</template>

<script>

import AliyunOnsInstanceTable from '@/components/opscloud/table/AliyunOnsInstanceTable.vue'
import AliyunOnsTopicTable from '@/components/opscloud/table/AliyunOnsTopicTable.vue'
import AliyunOnsGroupTable from '@/components/opscloud/table/AliyunOnsGroupTable.vue'

import { queryDocByKey } from '@api/doc/doc.js'

export default {
  data () {
    return {
      activeName: 'help',
      title: '消息队列',
      docKey: 'ALIYUN_ONS_README',
      doc: {},
      success: false
    }
  },
  components: {
    AliyunOnsInstanceTable,
    AliyunOnsTopicTable,
    AliyunOnsGroupTable
  },
  mounted () {
    this.handlerFetchDoc()
  },
  methods: {
    handlerFetchDoc () {
      queryDocByKey(this.docKey)
        .then(res => {
          this.doc = res.body
          this.success = true
        })
    }
  }
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
