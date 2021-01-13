<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="50%">
      <div style="margin-bottom: 5px">
        <el-divider content-position="left" v-if="ticket.ticketPhase === 'CREATED_TICKET'">配置选项</el-divider>
        <el-form :model="topicData" ref="topicDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading" v-if="ticket.ticketPhase === 'CREATED_TICKET'">
          <el-form-item label="Topic" prop="topic">
            <el-input v-model.lazy="topicData.topic" :readonly="topicChecked" @change="getOnsInstanceByTopic">
              <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <li>Topic只能以 “TOPIC_”开头，包含大写英文、数字和下划线（_）</li>
              <li>长度限制在3~64个字符之间</li>
              <li>Topic一旦创建，则无法修改</li>
            </el-alert>
          </el-form-item>
          <el-form-item label="消息类型" prop="messageType">
            <el-select v-model="topicData.messageType" placeholder="消息类型"
                       :disabled="JSON.stringify(ticketEntries) !== '[]'">
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
          <el-form-item label="申请说明" prop="remark">
            <el-input v-model.trim="topicData.remark"></el-input>
          </el-form-item>
          <el-form-item label="已申请的实例">
            <el-tag v-for="item in topicData.nowInstanceList" :key="item.id" style="margin-left: 5px">
              {{ item.instanceName }}
            </el-tag>
            <span v-if="JSON.stringify(topicData.nowInstanceList) === '[]'">该Topic目前无已申请的实例</span>
          </el-form-item>
          <el-form-item label="可申请的实例" prop="instance" v-if="ticket.ticketPhase !== 'FINALIZED'">
            <el-select v-model="topicData.instance" placeholder="请选择实例" :disabled="disabled"
                       value-key="instanceId" filterable v-if="instanceOptions.length !==0">
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
            <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" plain
                       @click="addTicketEntry()" style="margin-left: 10px"></el-button>
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
        </el-form>
        <el-divider content-position="left">工单详情</el-divider>
        <el-table :data="ticketEntries" style="width: 100%" v-loading="configuring" element-loading-text="工单配置中"
                  element-loading-spinner="el-icon-loading">
          <el-table-column prop="name" label="Topic"></el-table-column>
          <el-table-column label="实例环境">
            <template slot-scope="scope">
              <span>{{ scope.row.instance.envName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="消息类型">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.messageType  | messageTypeFilters }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.remark }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="entryResult" label="执行结果" v-if="ticket.ticketPhase === 'FINALIZED'"></el-table-column>
          <el-table-column fixed="right" label="操作" width="80" v-if="ticket.ticketPhase === 'CREATED_TICKET'">
            <template slot-scope="scope">
              <el-button type="danger" plain size="mini" @click="removeTicketEntry(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
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
                     @click="submitTicket">提交</el-button>
          <el-button type="success" v-if="ticket.isInApproval" plain size="mini" @click="agreeTicket">同意</el-button>
          <el-button type="danger" v-if="ticket.isInApproval" plain size="mini" @click="disagreeTicket">拒绝</el-button>
        </span>
        <el-button size="mini" @click="closeDialog">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addWorkorderTicketEntry,
  submitWorkorderTicket,
  agreeWorkorderTicket,
  disagreeWorkorderTicket,
  delWorkorderTicketEntryById,
  queryAliyunONSTicketByParam
} from '@api/workorder/workorder.ticket'
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
      ticketEntries: [],
      topicData: topicData,
      topicChecked: false,
      configuring: false,
      disabled: false,
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
    },
    messageTypeFilters (messageType) {
      if (messageType === 0) {
        return '普通消息'
      }
      if (messageType === 1) {
        return '分区顺序消息'
      }
      if (messageType === 2) {
        return '全局顺序消息'
      }
      if (messageType === 4) {
        return '事务消息'
      }
      if (messageType === 5) {
        return '定时/延时消息'
      }
    }
  },
  methods: {
    closeDialog () {
      this.formStatus.visible = false
      this.$emit('closeDialog')
    },
    initData (ticket) {
      if (this.formStatus.operationType === 0) {
        this.disabled = false
        this.topicChecked = false
      } else {
        this.disabled = true
        this.topicChecked = true
      }
      this.ticket = ticket
      if (ticket.workorder != null) {
        this.title = ticket.workorder.name
      }
      if (JSON.stringify(ticket.ticketEntries) !== '[]') {
        this.topicData = {
          topic: ticket.ticketEntries[0].ticketEntry.topic.topic,
          messageType: ticket.ticketEntries[0].ticketEntry.topic.messageType,
          remark: ticket.ticketEntries[0].ticketEntry.topic.remark
        }
        this.topicChecked = true
        this.getOnsInstanceByTopic(this.topicData.topic)
      } else {
        this.topicData = Object.assign({}, topicData)
        this.ticketEntries = []
      }
      this.getTicketAliyunONS()
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
        this.$message.warning('请输入Topic')
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
        this.$message.warning('请先校验Topic')
        return
      }
      if (JSON.stringify(this.topicData.instance) === '{}' || this.topicData.instance.id === null) {
        this.$message.warning('请选择至少一个申请实例')
        return
      }
      if (JSON.stringify(this.ticketEntries) === '[]') {
        this.$message.warning('请选择至少一个申请实例')
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
      if (!this.topicChecked) {
        this.$message.warning('请先校验Topic')
        return
      }
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
              this.getTicketAliyunONS()
            })
        }
      })
    },
    removeTicketEntry (ticketEntry) {
      delWorkorderTicketEntryById(ticketEntry.id)
        .then(res => {
          // 返回数据
          if (res.success) {
            this.$message({
              message: '移除成功',
              type: 'success'
            })
            this.getTicketAliyunONS()
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    getInstanceAll () {
      queryONSInstanceAll()
        .then(res => {
          this.instanceAllOptions = res.body
        })
    },
    getTicketAliyunONS () {
      queryAliyunONSTicketByParam(this.ticket.id)
        .then(res => {
          this.ticketEntries = res.body
        })
    }
  }
}
</script>

<style scoped>
</style>
