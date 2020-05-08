<template>
  <d2-container>
    <template>
      <h1>{{title}}</h1>
      <el-tabs v-model="tabActiveName">
        <el-tab-pane label="工单" name="workorder">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="never">
                <el-collapse v-for="workorderGroup in workorderGroups" :key="workorderGroup.id">
                  <el-collapse-item :title="workorderGroup.name" :name="workorderGroup.name">
                    <el-table :data="workorderGroup.workorders" stripe :show-header=false style="width: 100%">
                      <el-table-column prop="name" label="工单名称"></el-table-column>
                      <el-table-column fixed="right" label="操作" width="160">
                        <template slot-scope="scope">
                          <el-button type="success" plain size="mini" @click="previewReadme(scope.row)">帮助
                          </el-button>
                          <el-button type="primary" plain size="mini" @click="createTicket(scope.row)" :loading="ticketCreateing">新建</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
            </el-col>
            <el-col :span="16">
              <el-card shadow="never">
                <TicketTable ref="ticketTable"></TicketTable>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <TicketServerGroupDialog ref="ticketServerGroupDialog" :formStatus="formServerGroupStatus"
                                  @closeTicketServerGroupDialog="fetchData"></TicketServerGroupDialog>
    </template>
  </d2-container>
</template>

<script>
  // Component
  import TicketTable from '@/components/opscloud/workorder/TicketTable.vue'
  import TicketServerGroupDialog from '@/components/opscloud/workorder/TicketServerGroupDialog'

  import { queryWorkbenchWorkorderGroup } from '@api/workorder/workorder.group.js'
  import { createWorkorderTicket } from '@api/workorder/workorder.ticket.js'

  export default {
    data () {
      return {
        tabActiveName: 'workorder',
        title: '我的工单',
        workorderGroups: [],
        // operationType  0 编辑模式  1 审批模式  2 完成模式
        formServerGroupStatus: {
          visible: false,
          operationType: 0
        },
        ticketCreateing: false,
        ticketTableData: []
      }
    },
    components: {
      TicketTable,
      TicketServerGroupDialog
    },
    mounted () {
      this.getWorkbenchWorkorderGroup()
      // this.$refs.workorderGroupTable.fetchData()
    },
    methods: {
      getWorkbenchWorkorderGroup () {
        queryWorkbenchWorkorderGroup()
          .then(res => {
            this.workorderGroups = res.body
          })
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
                this.formServerGroupStatus.visible = true
                this.formServerGroupStatus.operationType = 0
                this.$refs.ticketServerGroupDialog.initData(ticket)
                break
              case 'SERVER_GROUP2':
                // TODO
                break
              default:
                this.$message.error('工单类型错误或未配置!')
            }
            this.ticketCreateing = false
          })
      },
      fetchData () {
        console.log('// TODO')
        this.$refs.ticketTable.fetchData()
      }
    }
  }
</script>

<style>
  .table-expand {
    font-size: 0;
  }

  .table-expand label {
    width: 150px;
    color: #99a9bf;
  }

  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
