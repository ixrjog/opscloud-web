<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="40%">
      <div style="margin-bottom: 5px">
        <el-form :model="topicData" label-width="120px" class="demo-ruleForm"
                 label-position="left" v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading">
          <el-form-item label="Topic">
            <el-input v-model.lazy="topicData.topic" :readonly="topicChecked" @change="getOnsInstanceByTopic">
              <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
            </el-input>
            <span class="span-font">
              <p>1. Topic只能以 “TOPIC_”开头，包含大写英文、数字和下划线（_）</p>
              <p>2. 长度限制在3~64个字符之间</p>
              <p>3. Topic一旦创建，则无法修改</p>
            </span>
          </el-form-item>
          <el-form-item label="消息类型">
            <el-select v-model="topicData.messageType" placeholder="消息类型" :disabled="topicChecked" @change="dataChange">
              <el-option
                v-for="item in messageTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="已申请的实例">
            <el-tag v-for="item in topicData.nowInstanceList" :key="item.id" style="margin-left: 5px">
              {{ item.instanceName }}
            </el-tag>
            <span v-if="JSON.stringify(topicData.nowInstanceList) === '[]'">该Topic目前无已申请的实例</span>
          </el-form-item>
          <el-form-item label="可申请的实例">
            <el-select v-model="topicData.instance" placeholder="请选择实例" :disabled="disabled"
                       value-key="instanceId" filterable v-if="instanceOptions.length !==0" @change="dataChange">
              <el-option
                v-for="item in instanceOptions"
                :key="item.id"
                :label="item.instanceName"
                :value="item">
                <span style="float: left">{{ item|instanceFilters }}</span>
                <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.remark }}</span>
              </el-option>
            </el-select>
            <span v-else>该Topic目前无可申请的实例</span>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="topicData.remark" @change="dataChange" :readonly="disabled"></el-input>
          </el-form-item>
        </el-form>
        <el-divider></el-divider>
        <el-row :gutter="24" style="margin-top: 10px" v-if="ticket != '' && ticket.approvalDetail != null">
          <el-steps :active="ticket.approvalDetail.active" align-center>
            <el-step :title="step.title" :description="step.description"
                     v-for="step in ticket.approvalDetail.approvalSteps" :key="step.title"></el-step>
          </el-steps>
        </el-row>
      </div>
      <el-divider></el-divider>
      <div slot="footer" class="dialog-footer">
        <span style="margin-right: 10px" v-if="formStatus.operationType != 2">
          <el-button type="primary" v-if="ticket.ticketPhase === 'CREATED_TICKET'" plain size="mini"
                     @click="addTicketEntry">保存</el-button>
          <el-button type="primary" v-if="ticket.ticketPhase === 'CREATED_TICKET'" plain size="mini"
                     @click="submitTicket" :disabled="!canSubmit">提交</el-button>
          <el-button type="success" v-if="ticket.isInApproval" plain size="mini" @click="agreeTicket">同意</el-button>
          <el-button type="danger" v-if="ticket.isInApproval" plain size="mini" @click="disagreeTicket">拒绝</el-button>
        </span>
        <el-button size="mini" @click="formStatus.visible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {
  addWorkorderTicketEntry,
  submitWorkorderTicket,
  agreeWorkorderTicket,
  disagreeWorkorderTicket
} from '@api/workorder/workorder.ticket.js'
import { onsTopicCheckV2 } from '@api/cloud/aliyun.ons.topic'
import { queryOnsInstanceByTopic } from '@api/cloud/aliyun.ons.instance'

const topicData = {
  topic: 'TOPIC_',
  messageType: 0,
  nowInstanceList: [],
  instance: {},
  remark: ''
}

export default {
  data () {
    return {
      title: '',
      ticket: '',
      messageTypeOptions: [{
        value: 0,
        label: '普通消息'
      }, {
        value: 1,
        label: '分区顺序消息'
      }, {
        value: 2,
        label: '全局顺序消息'
      }, {
        value: 4,
        label: '事务消息'
      }, {
        value: 5,
        label: '定时/延时消息'
      }],
      ticketEntryOptions: [],
      instanceOptions: [],
      searchTicketEntryLoading: false,
      ticketEntry: '',
      loading: false,
      ticketEntries: [],
      topicData: topicData,
      topicChecked: false,
      configuring: false,
      disabled: false,
      canSubmit: false
    }
  },
  mounted () {
  },
  components: {},
  name: 'TicketAliyunOnsTopicDialog',
  props: ['formStatus'],
  filters: {
    instanceFilters (instance) {
      return instance.instanceName + '<' + instance.envName + '>'
    }
  },
  methods: {
    closeDialog () {
      this.formStatus.visible = false
      this.$emit('closeDialog')
    },
    initData (ticket) {
      this.ticket = ticket
      if (ticket.workorder != null) {
        this.title = ticket.workorder.name
      }
      if (JSON.stringify(ticket.ticketEntries) !== '[]') {
        this.ticketEntries = ticket.ticketEntries
        this.topicData = {
          topic: ticket.ticketEntries[0].ticketEntry.topic.topic,
          messageType: ticket.ticketEntries[0].ticketEntry.topic.messageType,
          instance: {
            id: ticket.ticketEntries[0].businessId,
            instanceId: ticket.ticketEntries[0].ticketEntry.topic.instanceId,
            regionId: ticket.ticketEntries[0].ticketEntry.topic.regionId
          },
          remark: ticket.ticketEntries[0].ticketEntry.topic.remark
        }
        this.getOnsInstanceByTopic(this.topicData.topic)
      } else {
        this.topicData = Object.assign({}, topicData)
        this.ticketEntries = []
      }
      if (this.formStatus.operationType === 0) {
        this.disabled = false
        this.topicChecked = false
        this.canSubmit = false
      } else {
        this.disabled = true
        this.topicChecked = true
        this.canSubmit = true
      }
    },
    getOnsInstanceByTopic (topic) {
      if (topic === 'TOPIC_') {
        return
      }
      queryOnsInstanceByTopic(topic)
        .then(res => {
          this.topicData.nowInstanceList = res.body.nowInstanceList
          this.instanceOptions = res.body.selectInstanceList
          if (JSON.stringify(this.topicData.nowInstanceList) !== '[]') {
            this.topicChecked = true
            this.topicData.messageType = res.body.topic.messageType
            this.topicData.remark = res.body.topic.remark
          }
        })
    },
    handlerCheck (topic) {
      if (topic === '') {
        this.$message.error('请输入Topic')
        return
      }
      onsTopicCheckV2(topic)
        .then(res => {
          this.nameCheck = res.success
          if (this.nameCheck) {
            this.$message.success('校验通过')
            this.topicChecked = true
          } else {
            this.$message.error('校验不通过')
          }
        })
    },
    submitTicket () {
      if (!this.topicChecked) {
        this.$message.error('请先校验Topic')
        return
      }
      if (JSON.stringify(this.topicData.instance) === '{}') {
        this.$message.error('请选择一个实例')
        return
      }
      submitWorkorderTicket(this.ticket)
        .then(res => {
          this.$message.success('提交成功')
          this.closeDialog()
        })
    },
    agreeTicket () {
      this.configuring = true
      agreeWorkorderTicket(this.ticket.id)
        .then(res => {
          this.configuring = false
          this.$message.success('审批同意已提交')
          this.closeDialog()
        })
    },
    disagreeTicket () {
      disagreeWorkorderTicket(this.ticket.id)
        .then(res => {
          this.$message.success('审批拒绝已提交')
          this.closeDialog()
        })
    },
    addTicketEntry () {
      let data = {
        'ticketEntry': {
          'regionId': this.topicData.instance.regionId,
          'instanceId': this.topicData.instance.instanceId,
          'messageType': this.topicData.messageType,
          'topic': this.topicData.topic.trim(),
          'remark': this.topicData.remark
        },
        'workorderTicketId': this.ticket.id,
        'businessId': this.topicData.instance.id,
        'entryKey': this.ticket.workorder.workorderKey,
        'entryStatus': 0,
        'name': this.topicData.topic
      }
      addWorkorderTicketEntry(data)
        .then(res => {
          this.$message.success('保存成功')
          this.canSubmit = true
        })
    },
    dataChange () {
      this.canSubmit = false
    }
  }
}
</script>

<style scoped>
</style>
