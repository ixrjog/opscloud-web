<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="70%" v-model="topicMsgTraceData" append-to-body>
    <h3>基础信息</h3>
    <el-row>
      <el-col :span="4" :offset="1">
        <span class="span-font-label">Topic</span>
      </el-col>
      <el-col :span="7">
        <span class="span-font">{{ topicMsgTraceData.topic }}</span>
      </el-col>
      <el-col :span="4">
        <span class="span-font-label">Tag</span>
      </el-col>
      <el-col :span="8">
        <span class="span-font">{{ topicMsgTraceData.tag }}</span>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="4" :offset="1">
        <span class="span-font-label">Message ID</span>
      </el-col>
      <el-col :span="7">
        <span class="span-font">{{ topicMsgTraceData.msgId }}</span>
      </el-col>
      <el-col :span="4">
        <span class="span-font-label">Message Key</span>
      </el-col>
      <el-col :span="8">
        <span class="span-font">{{ topicMsgTraceData.msgKey }}</span>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <h3>生产者</h3>
    <el-row>
      <el-col :span="4" :offset="1">
        <span class="span-font-label">生产者</span>
      </el-col>
      <el-col :span="7">
        <span class="span-font">{{ topicMsgTraceData | bornFilters }}</span>
      </el-col>
      <el-col :span="4">
        <span class="span-font-label">发送时间</span>
      </el-col>
      <el-col :span="8">
        <span class="span-font">{{ topicMsgTraceData.pubTime }}</span>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="4" :offset="1">
        <span class="span-font-label">发送耗时</span>
      </el-col>
      <el-col :span="7">
        <span class="span-font">{{ topicMsgTraceData.costTime }} 毫秒</span>
      </el-col>
      <el-col :span="4">
        <span class="span-font-label">发送状态</span>
      </el-col>
      <el-col :span="8">
        <el-tag :type="getStatusColor(topicMsgTraceData.status)">{{ topicMsgTraceData.status | statusFilters }}</el-tag>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <h3>消费者</h3>
    <el-table :data="topicMsgTraceData.subList" stripe style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.clientList" style="width: 100%" v-if="props.row.clientList !== null">
            <el-table-column prop="date" label="状态">
              <template slot-scope="scope">
                <el-tag :type="getConsumeStatusColor(scope.row.status)">
                  {{ scope.row.status |consumeStatusFilters }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="clientHost" label="客户端IP"></el-table-column>
            <el-table-column prop="clientHostname" label="客户端主机名"></el-table-column>
            <el-table-column label="消费耗时">
              <template slot-scope="scope">
                <span>{{ scope.row.costTime }} 毫秒</span>
              </template>
            </el-table-column>
            <el-table-column prop="subTimeToStr" label="投递时间"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column type="index" label="No"></el-table-column>
      <el-table-column prop="subGroupName" label="Group ID"></el-table-column>
      <el-table-column label="成功">
        <template slot-scope="scope">
          <span style="color: #67C23A;font-weight: bolder">{{ scope.row.successCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="失败">
        <template slot-scope="scope">
          <span v-if="scope.row.failCount === 0" style="font-weight: bolder">{{ scope.row.failCount }}</span>
          <span style="color: #F56C6C;font-weight: bolder" v-else>{{ scope.row.failCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="共投递次数"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      title: 'Topic消息轨迹信息',
      aliyunOnsTopicMsgTraceDialogStatus: {
        visible: false
      },
      topicMsgTraceData: {}
    }
  },
  name: 'AliyunOnsTopicMsgTraceDialog',
  props: ['formStatus'],
  mounted () {
  },
  filters: {
    bornFilters (born) {
      return born.bornHost + '<' + born.bornHostname + '>'
    },
    statusFilters (status) {
      if (status === 'SEND_SUCCESS') {
        return '发送成功'
      }
      if (status === 'SEND_FAILED') {
        return '发送失败'
      }
      if (status === 'SEND_ROLLBACK') {
        return '事务消息回滚'
      }
      if (status === 'SEND_UNKNOWN') {
        return '事务消息未提交'
      }
      if (status === 'SEND_DELAY') {
        return '定时（延时）消息定时中'
      }
      return ''
    },
    consumeStatusFilters (consumeStatus) {
      if (consumeStatus === 'CONSUME_SUCCESS') {
        return '消费成功'
      }
      if (consumeStatus === 'CONSUME_FAILED') {
        return '消费失败'
      }
      if (consumeStatus === 'CONSUME_NOT_RETURN') {
        return '消费未返回结果'
      }
      if (consumeStatus === 'SEND_UNKNOWN') {
        return '事务消息未提交'
      }
      if (consumeStatus === 'SEND_DELAY') {
        return '定时（延时）消息定时中'
      }
      return ''
    }
  },
  methods: {
    initData (topicMsgTraceData) {
      this.topicMsgTraceData = {}
      this.topicMsgTraceData = Object.assign({}, topicMsgTraceData)
    },
    getConsumeStatusColor (consumeStatus) {
      if (consumeStatus === 'CONSUME_SUCCESS') {
        return 'success'
      }
      if (consumeStatus === 'CONSUME_FAILED') {
        return 'danger'
      }
      if (consumeStatus === 'CONSUME_NOT_RETURN') {
        return 'warning'
      }
      if (consumeStatus === 'SEND_UNKNOWN') {
        return 'warning'
      }
      if (consumeStatus === 'SEND_DELAY') {
        return 'warning'
      }
      return 'info'
    },
    getStatusColor (status) {
      if (status === 'SEND_SUCCESS') {
        return 'success'
      }
      if (status === 'SEND_FAILED') {
        return 'danger'
      }
      if (status === 'SEND_ROLLBACK') {
        return 'warning'
      }
      if (status === 'SEND_UNKNOWN') {
        return 'warning'
      }
      if (status === 'SEND_DELAY') {
        return 'warning'
      }
      return 'info'
    }
  }
}
</script>

<style scoped>
.span-font {
  font-size: 14px;
}

.span-font-label {
  font-size: 14px;
  color: #99a9bf;
}
</style>
