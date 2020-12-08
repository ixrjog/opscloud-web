<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="40%">
      <el-alert title="工单执行失败" type="error" show-icon style="margin-bottom: 5px"
                :closable="false" :description="ticketEntry.entryResult"
                v-if="ticketEntry !== '' && ticket.ticketPhase === 'FINALIZED' && !ticket.executorResult">
      </el-alert>
      <div style="margin-bottom: 5px">
        <el-form :model="topicData" ref="topicDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 label-position="left" v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading">
          <el-form-item label="Topic" prop="topic">
            <el-input v-model.lazy="topicData.topic" :readonly="topicChecked" @change="getOnsInstanceByTopic">
              <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <el-row>1. Topic只能以 “TOPIC_”开头，包含大写英文、数字和下划线（_）</el-row>
              <el-row>2. 长度限制在3~64个字符之间</el-row>
              <el-row>3. Topic一旦创建，则无法修改</el-row>
            </el-alert>
          </el-form-item>
          <el-form-item label="消息类型" prop="messageType">
            <el-select v-model="topicData.messageType" placeholder="消息类型" :disabled="topicChecked" @change="dataChange">
              <el-option
                v-for="item in messageTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-tooltip class="item" effect="dark" content="消息类型概述，点击查看" placement="right">
              <el-link
                href="https://help.aliyun.com/document_detail/172114.html?spm=5176.11065259.1996646101.searchclickresult.38ad6704oBWYjo"
                :underline="false" target="_blank">
                <i class="el-icon-info" style="margin-left: 5px;height: 200%"></i>
              </el-link>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="已申请的实例">
            <el-tag v-for="item in topicData.nowInstanceList" :key="item.id" style="margin-left: 5px">
              {{ item.instanceName }}
            </el-tag>
            <span v-if="JSON.stringify(topicData.nowInstanceList) === '[]'">该Topic目前无已申请的实例</span>
          </el-form-item>
          <el-form-item label="可申请的实例" prop="instance" v-if="ticket.ticketPhase !== 'FINALIZED'">
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
          <el-form-item label="申请的实例" v-if="ticket.ticketPhase === 'FINALIZED'">
            <el-select v-model="topicData.instance" disabled>
              <el-option
                v-for="item in instanceAllOptions"
                :key="item.id"
                :label="item.instanceName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="topicData.remark" @change="dataChange" :readonly="disabled"></el-input>
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
        <span style="margin-right: 10px" v-if="formStatus.operationType !== 2">
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
import { queryONSInstanceAll, queryOnsInstanceByTopic } from '@api/cloud/aliyun.ons.instance'

const topicData = {
  topic: 'TOPIC_',
  messageType: 0,
  nowInstanceList: [],
  instance: '',
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
      instanceAllOptions: [],
      searchTicketEntryLoading: false,
      ticketEntry: '',
      loading: false,
      ticketEntries: [],
      topicData: topicData,
      topicChecked: false,
      configuring: false,
      disabled: false,
      canSubmit: false,
      rules: {
        topic: [
          { required: true, message: '请输入Topic', trigger: 'blur' },
          { min: 3, max: 64, message: '长度在 3 到 64 个字符', trigger: 'blur' }
        ],
        instance: [
          { required: true, message: '请选择MQ实例', trigger: 'change' }
        ],
        messageType: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ],
        remark: [
          { required: true, message: '请输入备注，例如：用户领券消息', trigger: 'blur' }
        ]
      }
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
      if (ticket.ticketPhase === 'FINALIZED') {
        this.getInstanceAll()
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
        this.ticketEntry = Object.assign({}, ticket.ticketEntries[0])
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
      if (topic === '' || topic === 'TOPIC_') {
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
      if (JSON.stringify(this.topicData.instance) === '{}' || this.topicData.instance.id === null) {
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
      this.$refs.topicDataForm.validate((valid) => {
        if (valid) {
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
        }
      })
    },
    dataChange () {
      this.canSubmit = false
    },
    getInstanceAll () {
      queryONSInstanceAll()
        .then(res => {
          this.instanceAllOptions = res.body
        })
    }
  }
}
</script>

<style scoped>
</style>
