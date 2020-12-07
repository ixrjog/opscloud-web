<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="40%">
      <div style="margin-bottom: 5px">
        <el-form :model="groupData" ref="groupDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 label-position="left" v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading">
          <el-form-item label="Group ID" prop="groupId">
            <el-input v-model.lazy="groupData.groupId" :readonly="groupChecked" @change="getOnsInstanceByGroupId">
              <el-button slot="append" :icon="groupChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(groupData.groupId)" :disabled="groupChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <el-row>1. 以 “GID_”开头，只能包含大写字母、数字和下划线（_）</el-row>
              <el-row>2. 长度限制在 7~64 字符之间</el-row>
              <el-row>3. Group ID 一旦创建，则无法修改</el-row>
            </el-alert>
          </el-form-item>
          <el-form-item label="协议类型" prop="groupType">
            <el-select v-model="groupData.groupType" placeholder="消息类型" disabled>
              <el-option
                v-for="item in groupTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="已申请的实例">
            <el-tag v-for="item in groupData.nowInstanceList" :key="item.id" style="margin-left: 5px">
              {{ item.instanceName }}
            </el-tag>
            <span v-if="JSON.stringify(groupData.nowInstanceList) === '[]'">该Group ID目前无已申请的实例</span>
          </el-form-item>
          <el-form-item label="可申请的实例" prop="instance">
            <el-select v-model="groupData.instance" placeholder="请选择实例" :disabled="disabled"
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
            <span v-else>该Group ID目前无可申请的实例</span>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="groupData.remark" @change="dataChange" :readonly="disabled"></el-input>
          </el-form-item>
        </el-form>
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
import { onsGroupCheckV2 } from '@api/cloud/aliyun.ons.group'
import { queryOcInstanceByGroupId } from '@api/cloud/aliyun.ons.instance'

const groupData = {
  groupType: 'tcp',
  groupId: 'GID_',
  nowInstanceList: [],
  instance: '',
  remark: ''
}

export default {
  data () {
    return {
      title: '',
      ticket: '',
      groupTypeOptions: [{
        value: 'tcp',
        label: 'tcp'
      }, {
        value: 'http',
        label: 'http'
      }],
      ticketEntryOptions: [],
      instanceOptions: [],
      searchTicketEntryLoading: false,
      ticketEntry: '',
      loading: false,
      ticketEntries: [],
      groupData: groupData,
      groupChecked: false,
      configuring: false,
      disabled: false,
      canSubmit: false,
      rules: {
        groupId: [
          { required: true, message: '请输入GroupId', trigger: 'blur' },
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
  name: 'TicketOnsGroupDialog',
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
        this.groupData = {
          groupId: ticket.ticketEntries[0].ticketEntry.group.groupId,
          groupType: ticket.ticketEntries[0].ticketEntry.group.groupType,
          instance: {
            id: ticket.ticketEntries[0].businessId,
            instanceId: ticket.ticketEntries[0].ticketEntry.group.instanceId,
            regionId: ticket.ticketEntries[0].ticketEntry.group.regionId
          },
          remark: ticket.ticketEntries[0].ticketEntry.group.remark
        }
        this.getOnsInstanceByGroupId(this.groupData.groupId)
      } else {
        this.groupData = Object.assign({}, groupData)
        this.ticketEntries = []
      }
      if (this.formStatus.operationType === 0) {
        this.disabled = false
        this.groupChecked = false
        this.canSubmit = false
      } else {
        this.disabled = true
        this.groupChecked = true
        this.canSubmit = true
      }
    },
    getOnsInstanceByGroupId (groupId) {
      if (groupId === 'GID_') {
        return
      }
      queryOcInstanceByGroupId(groupId)
        .then(res => {
          this.groupData.nowInstanceList = res.body.nowInstanceList
          this.instanceOptions = res.body.selectInstanceList
          if (JSON.stringify(this.groupData.nowInstanceList) !== '[]') {
            this.groupChecked = true
            this.groupData.groupType = res.body.group.groupType
            this.groupData.remark = res.body.group.remark
          }
        })
    },
    handlerCheck (groupId) {
      if (groupId === '' || groupId === 'GID_') {
        this.$message.error('请输入Group ID')
        return
      }
      onsGroupCheckV2(groupId)
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
        this.$message.error('请先校验Group ID')
        return
      }
      if (JSON.stringify(this.groupData.instance) === '{}' || this.groupData.instance.id === null) {
        this.$message.error('请选择MQ实例')
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
      this.$refs.groupDataForm.validate((valid) => {
        if (valid) {
          let data = {
            'ticketEntry': {
              'regionId': this.groupData.instance.regionId,
              'instanceId': this.groupData.instance.instanceId,
              'groupType': this.groupData.groupType,
              'groupId': this.groupData.groupId.trim(),
              'remark': this.groupData.remark
            },
            'workorderTicketId': this.ticket.id,
            'businessId': this.groupData.instance.id,
            'entryKey': this.ticket.workorder.workorderKey,
            'entryStatus': 0,
            'name': this.groupData.groupId
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
    }
  }
}
</script>

<style scoped>
</style>
