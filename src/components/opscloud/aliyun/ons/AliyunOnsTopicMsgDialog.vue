<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="60%" v-loading="loading"
             element-loading-text="Topic消费轨迹查询中" element-loading-spinner="el-icon-loading">
    <h2>{{ queryParam.topic }}</h2>
    <span class="span-font">只显示最近一小时最新50条消息，如需具体查询，请根据Message ID查询</span>
    <el-divider></el-divider>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
      <el-input v-model.trim="queryParam.msgId" class="input" placeholder="请输入完整Message ID，不支持模糊查询"/>
      <el-button @click="fetchData" :disabled="queryParam.msgId === ''">查询</el-button>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item v-for="item in props.row.propertyList" :label="item.name" :key="item.name">
              <span>{{ item.value }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="Message ID" width="300">
        <template slot-scope="scope">
          <el-row>
            <span>{{ scope.row.msgId }}</span>
            <span v-clipboard:copy="scope.row.msgId" v-clipboard:success="onCopy"
                  v-clipboard:error="onError" style="float: right">
              <i class="el-icon-copy-document"></i>
            </span>
          </el-row>
          <el-row>
            <span>{{ scope.row.bornHost }}</span>
            <span style="margin-left: 10px">{{ scope.row.storeSize }} Bytes</span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column prop="reconsumeTimes" label="重试次数" width="100"></el-table-column>
      <el-table-column prop="bornTime" label="生成时间"></el-table-column>
      <el-table-column prop="storeTime" label="存储时间"></el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="消费轨迹" placement="left">
            <el-button type="primary" plain size="mini" @click="getTopicMsgTrace(scope.row)"
                       icon="el-icon-s-promotion"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <aliyun-ons-topic-msg-trace-dialog
      ref="aliyunOnsTopicMsgTraceDialog"
      :formStatus="aliyunOnsTopicMsgTraceDialogStatus"></aliyun-ons-topic-msg-trace-dialog>
  </el-dialog>
</template>

<script>
import AliyunOnsTopicMsgTraceDialog from '@/components/opscloud/aliyun/ons/AliyunOnsTopicMsgTraceDialog'
// API
import { queryOnsMessage, queryOnsTrace } from '@api/cloud/aliyun.ons.topic'

export default {
  data () {
    return {
      title: 'Topic消息查询',
      queryParam: {
        regionId: '',
        instanceId: '',
        topic: '',
        msgId: ''
      },
      aliyunOnsTopicMsgTraceDialogStatus: {
        visible: false
      },
      tableData: [],
      loading: false
    }
  },
  name: 'AliyunOnsTopicMsgDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {
    AliyunOnsTopicMsgTraceDialog
  },
  filters: {},
  methods: {
    initData (topicMsgData) {
      this.tableData = []
      this.tableData = topicMsgData.msgList
      this.queryParam = {
        'regionId': topicMsgData.regionId,
        'instanceId': topicMsgData.instanceId,
        'topic': topicMsgData.topic,
        'msgId': ''
      }
    },
    fetchData () {
      if (this.queryParam.msgId === '') {
        this.$message.info('请输入Message ID')
        return
      }
      this.tableData = []
      queryOnsMessage(this.queryParam)
        .then(res => {
          if (res.body !== null) {
            this.tableData.push(res.body)
          }
        })
    },
    getTopicMsgTrace (row) {
      this.loading = true
      let requestBody = {
        'regionId': this.queryParam.regionId,
        'instanceId': row.instanceId,
        'topic': row.topic,
        'msgId': row.msgId,
        'beginTime': row.bornTimestamp,
        'endTime': row.storeTimestamp
      }
      queryOnsTrace(requestBody)
        .then(res => {
          this.$refs.aliyunOnsTopicMsgTraceDialog.initData(res.body)
          this.loading = false
          this.aliyunOnsTopicMsgTraceDialogStatus.visible = true
        })
    },
    onCopy (e) {
      // this.queryParam.queryName = e.text
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    }
  }
}
</script>

<style scoped>
.input {
  display: inline-block;
  max-width: 300px;
  margin-right: 5px;
}

.span-font {
  font-size: 6px;
  color: #99a9bf;
}

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
