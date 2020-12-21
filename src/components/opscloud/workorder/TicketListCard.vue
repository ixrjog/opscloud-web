<template>
  <div>
    <el-card shadow="hover">
      <el-collapse accordion v-model="activeNames">
        <div v-for="(workorderGroup,index) in workorderGroups" :key="workorderGroup.id">
          <el-collapse-item :title="workorderGroup.name" :name="index">
            <el-table :data="workorderGroup.workorders" stripe :show-header=false style="width: 100%">
              <el-table-column prop="name" label="工单名称"></el-table-column>
              <el-table-column fixed="right" label="操作" width="160">
                <template slot-scope="scope">
                  <el-button type="success" plain size="mini" @click="handlerPreviewDoc(scope.row)">帮助
                  </el-button>
                  <el-button type="primary" plain size="mini" @click="createTicket(scope.row)"
                             v-if="scope.row.workorderStatus === 0"
                             :loading="ticketCreateing">新建
                  </el-button>
                  <el-button type="warning" plain size="mini" v-if="scope.row.workorderStatus === 1"
                             :loading="ticketCreateing">开发
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </div>
      </el-collapse>
    </el-card>
    <doc-dialog ref="docDialog" :formStatus="formDocStatus"></doc-dialog>
    <ticket-server-group-dialog ref="ticketServerGroupDialog" :formStatus="formServerGroupStatus" @closeDialog="fetchData"></ticket-server-group-dialog>
    <ticket-user-group-dialog ref="ticketUserGroupDialog" :formStatus="formUserGroupStatus" @closeDialog="fetchData"></ticket-user-group-dialog>
    <ticket-auth-role-dialog ref="ticketAuthRoleDialog" :formStatus="formAuthRoleStatus" @closeDialog="fetchData"></ticket-auth-role-dialog>
    <ticket-ram-policy-dialog ref="ticketRAMPolicyDialog" :formStatus="formRAMPolicyStatus" @closeDialog="fetchData"></ticket-ram-policy-dialog>
    <ticket-ons-topic-dialog ref="ticketOnsTopicDialog" :formStatus="formOnsTopicStatus" @closeDialog="fetchData"></ticket-ons-topic-dialog>
    <ticket-ons-group-dialog ref="ticketOnsGroupDialog" :formStatus="formOnsGroupStatus" @closeDialog="fetchData"></ticket-ons-group-dialog>
  </div>
</template>

<script>

  // doc
  import DocDialog from '@/components/opscloud/doc/DocDialog.vue'

  // Component
  import TicketServerGroupDialog from '@/components/opscloud/workorder/TicketServerGroupDialog'
  import TicketUserGroupDialog from '@/components/opscloud/workorder/TicketUserGroupDialog'
  import TicketAuthRoleDialog from '@/components/opscloud/workorder/TicketAuthRoleDialog'
  import TicketRamPolicyDialog from '@/components/opscloud/workorder/TicketRAMPolicyDialog'
  import TicketOnsTopicDialog from '@/components/opscloud/workorder/TicketOnsTopicDialog'
  import TicketOnsGroupDialog from '@/components/opscloud/workorder/TicketOnsGroupDialog'

  import { queryWorkbenchWorkorderGroup } from '@api/workorder/workorder.group.js'
  import { createWorkorderTicket } from '@api/workorder/workorder.ticket.js'

  import { queryDocById } from '@api/doc/doc.js'

  export default {
    name: 'TicketListCard',
    data () {
      return {
        formDocStatus: {
          readMode: true, // 阅读模式
          visible: false
        },
        activeNames: [0],
        workorderGroups: [],
        // operationType  0 编辑模式  1 审批模式  2 完成模式
        formServerGroupStatus: {
          visible: false,
          operationType: 0
        },
        formUserGroupStatus: {
          visible: false,
          operationType: 0
        },
        formAuthRoleStatus: {
          visible: false,
          operationType: 0
        },
        formRAMPolicyStatus: {
          visible: false,
          operationType: 0
        },
        formOnsTopicStatus: {
          visible: false,
          operationType: 0
        },
        formOnsGroupStatus: {
          visible: false,
          operationType: 0
        },
        ticketCreateing: false,
        ticketTableData: []
      }
    },
    mounted () {
      this.getWorkorderGroup()
    },
    components: {
      DocDialog,
      TicketServerGroupDialog,
      TicketUserGroupDialog,
      TicketAuthRoleDialog,
      TicketRamPolicyDialog,
      TicketOnsTopicDialog,
      TicketOnsGroupDialog
    },
    methods: {
      getWorkorderGroup () {
        queryWorkbenchWorkorderGroup()
          .then(res => {
            this.workorderGroups = res.body
          })
      },
      handlerPreviewDoc (workorder) {
        queryDocById(workorder.readmeId)
          .then(res => {
            // 返回数据
            let doc = {
              docContent: res.body.previewDoc
            }
            this.$refs.docDialog.initData(doc)
            this.formDocStatus.visible = true
          })
      },
      invokeWorkorderTicketStatus (formStatus) {
        formStatus.visible = true
        formStatus.operationType = 0
      },
      /**
       * 创建工单票据
       * @param workorder
       */
      createTicket (workorder) {
        this.ticketCreateing = true
        let requestParam = {
          workorderKey: workorder.workorderKey
        }
        createWorkorderTicket(requestParam)
          .then(res => {
            let ticket = res.body
            ticket.workorder = workorder
            switch (workorder.workorderKey) {
              case 'SERVER_GROUP':
                this.invokeWorkorderTicketStatus(this.formServerGroupStatus)
                this.$refs.ticketServerGroupDialog.initData(ticket)
                break
              case 'USER_GROUP':
                this.invokeWorkorderTicketStatus(this.formUserGroupStatus)
                this.$refs.ticketUserGroupDialog.initData(ticket)
                break
              case 'AUTH_ROLE':
                this.invokeWorkorderTicketStatus(this.formAuthRoleStatus)
                this.$refs.ticketAuthRoleDialog.initData(ticket)
                break
              case 'RAM_POLICY':
                this.invokeWorkorderTicketStatus(this.formRAMPolicyStatus)
                this.$refs.ticketRAMPolicyDialog.initData(ticket)
                break
              case 'ALIYUN_ONS_TOPIC':
                this.invokeWorkorderTicketStatus(this.formOnsTopicStatus)
                this.$refs.ticketOnsTopicDialog.initData(ticket)
                break
              case 'ALIYUN_ONS_GROUP':
                this.invokeWorkorderTicketStatus(this.formOnsGroupStatus)
                this.$refs.ticketOnsGroupDialog.initData(ticket)
                break
              default:
                this.$message.error('工单类型错误或未配置!')
            }
            this.ticketCreateing = false
          })
      },
      fetchData () {
        this.$emit('handlerFetchData')
      }
    }
  }
</script>

<style scoped>

</style>
