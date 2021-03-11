<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="50%">
      <div style="margin-bottom: 5px">
        <el-divider content-position="left" v-if="ticket.ticketPhase === 'CREATED_TICKET'">配置选项</el-divider>
        <el-form :model="groupData" ref="groupDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 v-if="ticket.ticketPhase === 'CREATED_TICKET'">
          <el-form-item label="Consumer Group" prop="consumerId">
            <el-input v-model.lazy="groupData.consumerId" :readonly="groupChecked">
              <el-button slot="append" :icon="groupChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(groupData.consumerId)" :disabled="groupChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <li>以 “GID_”开头，只能包含大写字母和下划线（_）</li>
              <li>长度限制在 7~64 字符之间</li>
              <li>Group ID 一旦创建，则无法修改</li>
            </el-alert>
          </el-form-item>
          <el-form-item label="申请说明" prop="remark">
            <el-input v-model.trim="groupData.remark"></el-input>
          </el-form-item>
          <el-form-item label="申请实例" prop="instance" v-if="ticket.ticketPhase !== 'FINALIZED'">
            <el-select v-model="groupData.instance" placeholder="实例名称" value-key="instanceName">
              <el-option
                v-for="item in instanceOptions"
                :key="item.instanceName"
                :label="item.label"
                :value="item">
              </el-option>
            </el-select>
            <el-button size="mini" plain @click="addTicketEntry()" style="margin-left: 10px">新增</el-button>
          </el-form-item>
        </el-form>
        <el-divider content-position="left">工单详情</el-divider>
        <el-table :data="ticketEntries" style="width: 100%" v-loading="configuring" element-loading-text="工单配置中"
                  element-loading-spinner="el-icon-loading">
          <el-table-column prop="name" label="Consumer Group"></el-table-column>
          <el-table-column label="实例名称">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.instanceName }}</span>
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
        <el-row :gutter="24" style="margin-top: 10px" v-if="ticket !== '' && ticket.approvalDetail != null">
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
import { onsGroupCheckV2 } from '@api/cloud/aliyun.ons.group'

const groupData = {
  consumerId: 'GID_',
  instance: '',
  remark: ''
}

export default {
  data () {
    return {
      title: '',
      ticket: '',
      instanceOptions: [{
        id: 4,
        instanceName: 'kafka-bigdata-prod',
        label: '大数据专用-阿里云服务'
      }, {
        id: 5,
        instanceName: 'kafka-canal-prod',
        label: '打点及canal-阿里云服务'
      }],
      ticketEntries: [],
      groupData: groupData,
      groupChecked: false,
      configuring: false,
      rules: {
        consumerGroup: [
          { required: true, message: '请输入ConsumerGroup', trigger: 'blur' },
          { min: 3, max: 64, message: '长度在 7 到 64 个字符', trigger: 'blur' }
        ],
        instance: [
          { required: true, message: '请选择MQ实例', trigger: 'change' }
        ],
        groupType: [
          { required: true, message: '请选择协议类型', trigger: 'change' }
        ],
        remark: [
          { required: true, message: '请输入备注，例如:营销促销优惠', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  components: {},
  name: 'TicketKafkaGroupDialog',
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
      if (this.formStatus.operationType === 0) {
        this.groupChecked = false
      } else {
        this.groupChecked = true
      }
      this.ticket = ticket
      if (ticket.workorder != null) {
        this.title = ticket.workorder.name
      }
      if (JSON.stringify(ticket.ticketEntries) !== '[]') {
        this.ticketEntries = ticket.ticketEntries
        this.groupData = {
          consumerId: ticket.ticketEntries[0].ticketEntry.group.consumerId,
          remark: ticket.ticketEntries[0].ticketEntry.group.remark
        }
        this.groupChecked = true
      } else {
        this.groupData = Object.assign({}, groupData)
        this.ticketEntries = []
      }
      this.getTicketKafka()
    },
    handlerCheck (consumerId) {
      if (consumerId === '' || consumerId === 'GID_') {
        this.$message.warning('请输入Consumer Group')
        return
      }
      onsGroupCheckV2(consumerId)
        .then(res => {
          this.nameCheck = res.success
          if (this.nameCheck) {
            this.$message.success('校验通过')
            this.groupChecked = true
          } else {
            this.$message.error('校验不通过')
          }
        })
    },
    submitTicket () {
      if (!this.groupChecked) {
        this.$message.warning('请先校验Consumer Group')
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
      if (!this.groupChecked) {
        this.$message.warning('请先校验Consumer Group')
        return
      }
      this.$refs.groupDataForm.validate((valid) => {
        if (valid) {
          let data = {
            'ticketEntry': {
              'instanceName': this.groupData.instance.instanceName,
              'consumerId': this.groupData.consumerId.trim(),
              'remark': this.groupData.remark
            },
            'workorderTicketId': this.ticket.id,
            'businessId': this.groupData.instance.id,
            'entryKey': this.ticket.workorder.workorderKey,
            'entryStatus': 0,
            'name': this.groupData.consumerId
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
