<template>
  <div>
    <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="workorder.name" label="工单"></el-table-column>
      <el-table-column prop="user.displayName" label="申请人"></el-table-column>
      <el-table-column prop="serverStatus" label="当前步骤">
        <template slot-scope="scope">
          <el-tag class="filters" :type="scope.row.ticketPhase | getPhaseType" size="small ">
            {{scope.row.ticketPhase | getPhaseText }}
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
          <el-button type="success" v-if="scope.row.isInApproval && scope.row.isAllowApproval" plain size="mini" @click="approvalTicket(scope.row)">审批
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <TicketServerGroupDialog ref="ticketServerGroupDialog" :formStatus="formServerGroupStatus"
                             @closeTicketServerGroupDialog="fetchData"></TicketServerGroupDialog>
    <TicketUserGroupDialog ref="ticketUserGroupDialog" :formStatus="formUserGroupStatus"
                           @closeTicketUserGroupDialog="fetchData"></TicketUserGroupDialog>
    <TicketAuthRoleDialog ref="ticketAuthRoleDialog" :formStatus="formAuthRoleStatus"
                           @closeTicketAuthRoleDialog="fetchData"></TicketAuthRoleDialog>
  </div>
</template>

<script>
  import TicketServerGroupDialog from '@/components/opscloud/workorder/TicketServerGroupDialog'
  import TicketUserGroupDialog from '@/components/opscloud/workorder/TicketUserGroupDialog'
  import TicketAuthRoleDialog from '@/components/opscloud/workorder/TicketAuthRoleDialog'

  // Filters
  import { getPhaseText, getPhaseType } from '@/filters/ticket.js'

  // API
  import { queryMyWorkorderTicketPage } from '@api/workorder/workorder.ticket.js'

  export default {
    name: 'TicketTable',
    data () {
      return {
        tableData: [],
        role: {},
        formServerGroupStatus: {
          visible: false,
          operationType: 1
        },
        formUserGroupStatus: {
          visible: false,
          operationType: 1
        },
        formAuthRoleStatus: {
          visible: false,
          operationType: 1
        },
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
    mounted () {
      this.fetchData()
    },
    components: {
      TicketServerGroupDialog,
      TicketUserGroupDialog,
      TicketAuthRoleDialog
    },
    filters: {
      getPhaseText,
      getPhaseType
    },
    methods: {
      previewTicket (ticket) {
        this.operationTicket(ticket, 2)
      },
      editTicket (ticket) {
        this.operationTicket(ticket, 0)
      },
      approvalTicket (ticket) {
        this.operationTicket(ticket, 1)
      },
      operationTicket (ticket, operationType) {
        switch (ticket.workorder.workorderKey) {
          case 'SERVER_GROUP':
            this.formServerGroupStatus.visible = true
            this.formServerGroupStatus.operationType = operationType
            this.$refs.ticketServerGroupDialog.initData(ticket)
            break
          case 'USER_GROUP':
            this.formUserGroupStatus.visible = true
            this.formUserGroupStatus.operationType = operationType
            this.$refs.ticketUserGroupDialog.initData(ticket)
            break
          case 'AUTH_ROLE':
            this.formAuthRoleStatus.visible = true
            this.formAuthRoleStatus.operationType = operationType
            this.$refs.ticketAuthRoleDialog.initData(ticket)
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
        var requestBody = {
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
