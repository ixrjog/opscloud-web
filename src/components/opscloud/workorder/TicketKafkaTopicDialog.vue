<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="50%">
      <div style="margin-bottom: 5px">
        <el-divider content-position="left" v-if="ticket.ticketPhase === 'CREATED_TICKET'">配置选项</el-divider>
        <el-form :model="topicData" ref="topicDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading" v-if="ticket.ticketPhase === 'CREATED_TICKET'">
          <el-form-item label="Topic" prop="topic">
            <el-input v-model.lazy="topicData.topic" :readonly="topicChecked">
              <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <li>Topic只能以 “TOPIC_”开头，包含大写英文和下划线（_）</li>
              <li>长度限制在3~64个字符之间</li>
              <li>Topic一旦创建，则无法修改</li>
            </el-alert>
          </el-form-item>
          <el-form-item label="申请说明" prop="remark">
            <el-input v-model.trim="topicData.remark"></el-input>
          </el-form-item>
          <el-form-item label="申请实例" prop="instance" v-if="ticket.ticketPhase !== 'FINALIZED'">
            <el-select v-model="topicData.instance" placeholder="实例名称" value-key="instanceName"
                       @change="handlerChange()">
              <el-option
                v-for="item in instanceOptions"
                :key="item.instanceName"
                :label="item.label"
                :value="item">
              </el-option>
            </el-select>
            <el-button size="mini" plain @click="addTicketEntry()" style="margin-left: 10px">新增</el-button>
          </el-form-item>
          <el-form-item label="Partition">
            <el-input-number v-model="topicData.partitionNum" :step="partitionStep" step-strictly
                             :disabled="topicData.instance === ''"></el-input-number>
          </el-form-item>
        </el-form>
        <el-divider content-position="left">工单详情</el-divider>
        <el-table :data="ticketEntries" style="width: 100%" v-loading="configuring" element-loading-text="工单配置中"
                  element-loading-spinner="el-icon-loading">
          <el-table-column prop="name" label="Topic"></el-table-column>
          <el-table-column label="实例名称">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.instanceName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="partition">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.partitionNum }}</span>
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
  queryUserTicketByTicketId
} from '@api/workorder/workorder.ticket'
import { kafkaTopicCheck } from '@api/kafka/kafka.topic'

const topicData = {
  topic: 'TOPIC_',
  partitionNum: 0,
  instance: '',
  remark: ''
}

export default {
  data () {
    return {
      title: '',
      ticket: '',
      partitionStep: 3,
      instanceOptions: [{
        id: 1,
        instanceName: 'kafka-dev',
        partitionStep: 3,
        label: 'dev环境-自建'
      }, {
        id: 2,
        instanceName: 'kafka-daily',
        partitionStep: 3,
        label: 'daily环境-自建'
      }, {
        id: 3,
        instanceName: 'kafka-gray',
        partitionStep: 3,
        label: 'gray环境-自建'
      }, {
        id: 4,
        instanceName: 'kafka-bigdata-prod',
        partitionStep: 6,
        label: '大数据专用-阿里云服务'
      }, {
        id: 5,
        instanceName: 'kafka-canal-prod',
        partitionStep: 6,
        label: '打点及canal-阿里云服务'
      }],
      ticketEntries: [],
      topicData: topicData,
      topicChecked: false,
      configuring: false,
      rules: {
        topic: [
          { required: true, message: '请输入Topic', trigger: 'blur' },
          { min: 3, max: 64, message: '长度在 3 到 64 个字符', trigger: 'blur' }
        ],
        instance: [
          { required: true, message: '请选择实例', trigger: 'change' }
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
  name: 'TicketKafkaTopicDialog',
  props: ['formStatus'],
  filters: {
  },
  methods: {
    closeDialog () {
      this.formStatus.visible = false
      this.$emit('closeDialog')
    },
    initData (ticket) {
      if (this.formStatus.operationType === 0) {
        this.topicChecked = false
      } else {
        this.topicChecked = true
      }
      this.ticket = ticket
      if (ticket.workorder != null) {
        this.title = ticket.workorder.name
      }
      if (JSON.stringify(ticket.ticketEntries) !== '[]') {
        this.ticketEntries = ticket.ticketEntries
        this.topicData = {
          topic: ticket.ticketEntries[0].ticketEntry.topic.topic,
          remark: ticket.ticketEntries[0].ticketEntry.topic.remark
        }
        this.topicChecked = true
      } else {
        this.topicData = Object.assign({}, topicData)
        this.ticketEntries = []
      }
      this.getTicketKafka()
    },
    handlerCheck (topic) {
      if (topic === '' || topic === 'TOPIC_') {
        this.$message.warning('请输入Topic')
        return
      }
      kafkaTopicCheck(topic)
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
      if (!(this.topicData.partitionNum > 0)) {
        this.$message.warning('partition必须大于0')
        return
      }
      this.$refs.topicDataForm.validate((valid) => {
        if (valid) {
          let data = {
            'ticketEntry': {
              'instanceName': this.topicData.instance.instanceName,
              'topic': this.topicData.topic.trim(),
              'partitionNum': this.topicData.partitionNum,
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
              this.getTicketKafka()
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
            this.getTicketKafka()
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    handlerChange () {
      this.partitionStep = this.topicData.instance.partitionStep
      this.topicData.partitionNum = 0
    },
    getTicketKafka () {
      queryUserTicketByTicketId(this.ticket.id)
        .then(res => {
          this.ticketEntries = res.body
        })
    }
  }
}
</script>

<style scoped>
</style>
