<template>
  <div>
    <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="closeDialog" width="50%">
      <div style="margin-bottom: 5px">
        <el-divider content-position="left" v-if="ticket.ticketPhase === 'CREATED_TICKET'">配置选项</el-divider>
        <el-form :model="addMemberData" label-width="80px" class="demo-ruleForm"
                 v-loading="configuring" element-loading-text="工单配置中"
                 element-loading-spinner="el-icon-loading" v-if="ticket.ticketPhase === 'CREATED_TICKET'">
          <el-form-item label="实例" prop="instance">
            <el-select v-model="addMemberData.instance" filterable value-key="groupId" @change="queryGitGroup"
                       remote reserve-keyword placeholder="输入关键词搜索git实例" :remote-method="getGitInstance">
              <el-option
                v-for="item in instanceOptions"
                :key="item.id"
                :label="item.name"
                :value="item">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px; margin-left: 20px">{{ item.url }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="群组" prop="instance">
            <el-select v-model="addMemberData.group" filterable :disabled="this.addMemberData.instanceId === ''"
                       remote reserve-keyword placeholder="输入关键词搜索群组" :remote-method="getGitGroup" value-key="groupId">
              <el-option
                v-for="item in groupOptions"
                :key="item.groupId"
                :label="item.name"
                :value="item">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; font-size: 10px;margin-left: 20px">{{ item.description }}</span>
              </el-option>
            </el-select>
            <el-link icon="el-icon-position" :href="addMemberData.group.webUrl" target="_blank"
                     style="margin-left: 10px"
                     v-if="JSON.stringify(this.addMemberData.group) !== '{}'"></el-link>
          </el-form-item>
          <el-form-item label="角色" prop="instance">
            <el-select v-model="addMemberData.access" placeholder="选择访问级别" value-key="value">
              <el-option
                v-for="item in accessOptions"
                :key="item.value"
                :label="item.label"
                :value="item">
              </el-option>
            </el-select>
            <el-link icon="el-icon-info" :href="accessLevelInfoUrl" target="_blank" style="margin-left: 10px"></el-link>
            <el-button size="mini" plain @click="addTicketEntry()" style="margin-left: 10px">新增</el-button>
          </el-form-item>
        </el-form>
        <el-divider content-position="left">工单详情</el-divider>
        <el-table :data="ticketEntries" style="width: 100%" v-loading="configuring" element-loading-text="工单配置中"
                  element-loading-spinner="el-icon-loading">
          <el-table-column label="实例名称">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.instanceName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="群组">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="角色">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketEntry.accessRole }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="entryResult" label="执行结果" v-if="ticket.ticketPhase === 'FINALIZED'"></el-table-column>
          <el-table-column fixed="right" label="操作" width="80" v-if="ticket.ticketPhase === 'CREATED_TICKET'">
            <template slot-scope="scope">
              <el-button type="danger" plain size="mini" @click="removeTicketEntry(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-input type="textarea" :rows="2" placeholder="申请说明" v-model="ticket.comment">
          </el-input>
        </el-row>
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
import { queryGitlabGroupPage, queryGitlabInstance } from '@api/gitlab/gitlab'

const addMemberData = {
  instance: '',
  group: {},
  username: '',
  access: {}
}

export default {
  data () {
    return {
      title: '',
      ticket: '',
      instanceOptions: [],
      groupOptions: [],
      ticketEntries: [],
      accessOptions: [{
        value: 20,
        label: 'Reporter'
      }, {
        value: 30,
        label: 'Developer'
      }, {
        value: 40,
        label: 'Master'
      }, {
        value: 50,
        label: 'Owner'
      }],
      accessLevelInfoUrl: 'https://gitlab.xinc818.com/help/user/permissions',
      addMemberData: addMemberData,
      configuring: false
    }
  },
  mounted () {
    this.getGitInstance('')
  },
  components: {},
  name: 'TicketGitlabGroupMemberDialog',
  props: ['formStatus'],
  filters: {},
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
      this.getTicketEntry()
    },
    submitTicket () {
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
      console.log(this.addMemberData)
      if (JSON.stringify(addMemberData.instance) === '{}') {
        this.$message.warning('请选择实例')
        return
      }
      if (JSON.stringify(addMemberData.group) === '{}') {
        this.$message.warning('请选择群组')
        return
      }
      if (JSON.stringify(addMemberData.access) === '{}') {
        this.$message.warning('请选择角色')
        return
      }
      let data = {
        'ticketEntry': {
          'instanceId': this.addMemberData.instance.id,
          'instanceName': this.addMemberData.instance.name,
          'groupId': this.addMemberData.group.groupId,
          'groupName': this.addMemberData.group.name,
          'username': this.ticket.username,
          'accessLevel': this.addMemberData.access.value,
          'accessRole': this.addMemberData.access.label
        },
        'workorderTicketId': this.ticket.id,
        'businessId': this.addMemberData.group.groupId,
        'entryKey': this.ticket.workorder.workorderKey,
        'entryStatus': 0,
        'name': this.addMemberData.instance.name + ':' + this.addMemberData.group.name + '[' + this.addMemberData.access.label + ']',
        'comment': this.ticket.comment
      }
      addWorkorderTicketEntry(data)
        .then(res => {
          this.$message.success('保存成功')
          this.getTicketEntry()
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
            this.getTicketEntry()
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    getGitInstance (queryName) {
      queryGitlabInstance(queryName)
        .then(res => {
          this.instanceOptions = res.body.data
          if (Array.isArray(this.instanceOptions) && this.instanceOptions.length > 0) {
            this.addMemberData.instance = this.instanceOptions[0]
            this.queryGitGroup()
          }
        })
    },
    getGitGroup (queryName) {
      this.groupOptions = []
      let requestBody = {
        instanceId: this.addMemberData.instanceId,
        queryName: queryName
      }
      queryGitlabGroupPage(requestBody)
        .then(res => {
          this.groupOptions = res.body.data
        })
    },
    queryGitGroup () {
      this.getGitGroup('')
    },
    getTicketEntry () {
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
