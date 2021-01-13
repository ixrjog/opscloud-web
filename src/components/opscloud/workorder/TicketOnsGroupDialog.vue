<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="50%">
      <div style="margin-bottom: 5px">
        <el-divider content-position="left" v-if="ticket.ticketPhase === 'CREATED_TICKET'">配置选项</el-divider>
        <el-form :model="groupData" ref="groupDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                 v-if="ticket.ticketPhase === 'CREATED_TICKET'">
          <el-form-item label="Group ID" prop="groupId">
            <el-input v-model.lazy="groupData.groupId" :readonly="groupChecked" @change="getOnsInstanceByGroupId">
              <el-button slot="append" :icon="groupChecked?'el-icon-success':'el-icon-warning'"
                         @click="handlerCheck(groupData.groupId)" :disabled="groupChecked"></el-button>
            </el-input>
            <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
              <li>以 “GID_”开头，只能包含大写字母、数字和下划线（_）</li>
              <li>长度限制在 7~64 字符之间</li>
              <li>Group ID 一旦创建，则无法修改</li>
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
          <el-form-item label="申请说明" prop="remark">
            <el-input v-model.trim="groupData.remark"></el-input>
          </el-form-item>
          <el-form-item label="已申请的实例">
            <el-tag v-for="item in groupData.nowInstanceList" :key="item.id" style="margin-left: 5px">
              {{ item.instanceName }}
            </el-tag>
            <span v-if="JSON.stringify(groupData.nowInstanceList) === '[]'">该Group ID目前无已申请的实例</span>
          </el-form-item>
          <el-form-item label="可申请的实例" prop="instance" v-if="ticket.ticketPhase !== 'FINALIZED'">
            <span v-if="instanceOptions.length !==0">
              <el-select v-model="groupData.instance" placeholder="请选择实例" :disabled="disabled"
                         value-key="instanceId" filterable>
                <el-option
                  v-for="item in instanceOptions"
                  :key="item.id"
                  :label="item.instanceName"
                  :value="item">
                <span style="float: left">{{ item|instanceFilters }}</span>
                <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.remark }}</span>
                </el-option>
            </el-select>
            <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" plain
                                   @click="addTicketEntry()" style="margin-left: 10px"></el-button>
            </span>
            <span v-else>该Group ID目前无可申请的实例</span>
          </el-form-item>
          <el-form-item label="申请的实例" v-if="ticket.ticketPhase === 'FINALIZED'">
            <el-select v-model="groupData.instance" disabled>
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
          <el-table-column label="协议类型">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.groupType }}</span>
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
  queryAliyunONSTicketByParam
} from '@api/workorder/workorder.ticket'
import { onsGroupCheckV2 } from '@api/cloud/aliyun.ons.group'
import { queryOcInstanceByGroupId, queryONSInstanceAll } from '@api/cloud/aliyun.ons.instance'

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
      instanceAllOptions: [],
      ticketEntries: [],
      groupData: groupData,
      groupChecked: false,
      configuring: false,
      disabled: false,
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
      if (ticket.ticketPhase === 'FINALIZED') {
        this.getInstanceAll()
      }
      if (JSON.stringify(ticket.ticketEntries) !== '[]') {
        this.ticketEntries = ticket.ticketEntries
        this.groupData = {
          groupId: ticket.ticketEntries[0].ticketEntry.group.groupId,
          groupType: ticket.ticketEntries[0].ticketEntry.group.groupType,
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
      } else {
        this.disabled = true
        this.groupChecked = true
      }
      this.getTicketAliyunONS()
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
        this.$message.warning('请输入Group ID')
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
        this.$message.warning('请先校验Group ID')
        return
      }
      if (JSON.stringify(this.groupData.instance) === '{}' || this.groupData.instance.id === null) {
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
      if (!this.groupChecked) {
        this.$message.warning('请先校验Group ID')
        return
      }
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
