<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>待处理工单</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="fetchData">手动刷新</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="workorder.name" label="工单"></el-table-column>
        <el-table-column prop="user.displayName" label="申请人"></el-table-column>
        <el-table-column prop="serverStatus" label="当前步骤">
          <template slot-scope="scope">
            <el-tag class="filters" :type="scope.row.ticketPhase | getPhaseType" size="small ">
              {{ scope.row.ticketPhase | getPhaseText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ago" label="申请时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="success" plain size="mini" @click="previewTicket(scope.row)">查看
            </el-button>
            <el-button type="primary" v-if="!scope.row.isInApproval" plain size="mini" @click="editTicket(scope.row)">编辑
            </el-button>
            <el-button type="success" v-if="scope.row.isInApproval && scope.row.isAllowApproval" plain size="mini"
                       @click="approvalTicket(scope.row)">审批
            </el-button>
            <el-button type="danger" v-if="scope.row.isAllowDelete" plain size="mini" @click="delTicket(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
    </el-card>
    <ticket-server-group-dialog ref="ticketServerGroupDialog" :formStatus="formServerGroupStatus"
                                @closeDialog="fetchData"></ticket-server-group-dialog>
    <ticket-user-group-dialog ref="ticketUserGroupDialog" :formStatus="formUserGroupStatus"
                              @closeDialog="fetchData"></ticket-user-group-dialog>
    <ticket-auth-role-dialog ref="ticketAuthRoleDialog" :formStatus="formAuthRoleStatus"
                             @closeDialog="fetchData"></ticket-auth-role-dialog>
    <ticket-ram-policy-dialog ref="ticketRAMPolicyDialog" :formStatus="formRAMPolicyStatus"
                              @closeDialog="fetchData"></ticket-ram-policy-dialog>
    <ticket-ons-topic-dialog ref="ticketOnsTopicDialog" :formStatus="formOnsTopicStatus"
                             @closeDialog="fetchData"></ticket-ons-topic-dialog>
    <ticket-ons-group-dialog ref="ticketOnsGroupDialog" :formStatus="formOnsGroupStatus"
                             @closeDialog="fetchData"></ticket-ons-group-dialog>
  </div>
</template>

<script>

  import { mapState, mapActions } from 'vuex'
  import TicketServerGroupDialog from '@/components/opscloud/workorder/TicketServerGroupDialog'
  import TicketUserGroupDialog from '@/components/opscloud/workorder/TicketUserGroupDialog'
  import TicketAuthRoleDialog from '@/components/opscloud/workorder/TicketAuthRoleDialog'
  import TicketRamPolicyDialog from '@/components/opscloud/workorder/TicketRAMPolicyDialog'
  import TicketOnsTopicDialog from '@/components/opscloud/workorder/TicketOnsTopicDialog'
  import TicketOnsGroupDialog from '@/components/opscloud/workorder/TicketOnsGroupDialog'

  // Filters
  import { getPhaseText, getPhaseType } from '@/filters/ticket.js'

  // API
  import { queryMyWorkorderTicketPage, delWorkorderTicketById } from '@api/workorder/workorder.ticket.js'

  const defaultFormStatus = {
    visible: false,
    operationType: 1
  }

  export default {
    name: 'MyTicketCard',
    data () {
      return {
        tableData: [],
        role: {},
        formServerGroupStatus: defaultFormStatus,
        formUserGroupStatus: defaultFormStatus,
        formAuthRoleStatus: defaultFormStatus,
        formRAMPolicyStatus: defaultFormStatus,
        formOnsTopicStatus: defaultFormStatus,
        formOnsGroupStatus: defaultFormStatus,
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          roleName: '',
          resourceName: ''
        }
      }
    },
    computed: {
      ...mapState('d2admin/user', [
        'info'
      ])
    },
    mounted () {
      this.initPageSize()
      this.fetchData()
    },
    components: {
      TicketServerGroupDialog,
      TicketUserGroupDialog,
      TicketAuthRoleDialog,
      TicketRamPolicyDialog,
      TicketOnsTopicDialog,
      TicketOnsGroupDialog
    },
    filters: {
      getPhaseText,
      getPhaseType
    },
    methods: {
      ...mapActions({
        setPageSize: 'd2admin/user/set'
      }),
      handleSizeChange (size) {
        this.pagination.pageSize = size
        this.info.pageSize = size
        this.setPageSize(this.info)
        this.fetchData()
      },
      initPageSize () {
        if (typeof (this.info.pageSize) !== 'undefined') {
          this.pagination.pageSize = this.info.pageSize
        }
      },
      delTicket (id) {
        delWorkorderTicketById(id)
          .then(res => {
            if (res.success) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.fetchData()
            } else {
              this.$message.error(res.msg)
            }
          })
      },
      previewTicket (ticket) {
        this.operationTicket(ticket, 2)
      },
      editTicket (ticket) {
        this.operationTicket(ticket, 0)
      },
      approvalTicket (ticket) {
        this.operationTicket(ticket, 1)
      },
      invokeTicketFormStatus (formStatus, operationType) {
        formStatus.visible = true
        formStatus.operationType = operationType
      },
      operationTicket (ticket, operationType) {
        switch (ticket.workorder.workorderKey) {
          case 'SERVER_GROUP':
            this.invokeTicketFormStatus(this.formServerGroupStatus, operationType)
            this.$refs.ticketServerGroupDialog.initData(ticket)
            break
          case 'USER_GROUP':
            this.invokeTicketFormStatus(this.formUserGroupStatus, operationType)
            this.$refs.ticketUserGroupDialog.initData(ticket)
            break
          case 'AUTH_ROLE':
            this.invokeTicketFormStatus(this.formAuthRoleStatus, operationType)
            this.$refs.ticketAuthRoleDialog.initData(ticket)
            break
          case 'RAM_POLICY':
            this.invokeTicketFormStatus(this.formRAMPolicyStatus, operationType)
            this.$refs.ticketRAMPolicyDialog.initData(ticket)
            break
          case 'ALIYUN_ONS_TOPIC':
            this.invokeTicketFormStatus(this.formOnsTopicStatus, operationType)
            this.$refs.ticketOnsTopicDialog.initData(ticket)
            break
          case 'ALIYUN_ONS_GROUP':
            this.invokeTicketFormStatus(this.formOnsGroupStatus, operationType)
            this.$refs.ticketOnsGroupDialog.initData(ticket)
            break
          default:
            this.$message.error('工单类型错误或未配置!')
        }
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        let requestBody = {
          userId: 0,
          page: this.pagination.currentPage,
          length: this.pagination.pageSize
        }
        queryMyWorkorderTicketPage(requestBody)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>

<style scoped>

</style>
