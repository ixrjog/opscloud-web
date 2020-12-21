<template>
  <d2-container>
    <template>
      <h1>{{ title }}</h1>
      <el-tabs v-model="tabActiveName">
        <el-tab-pane label="工单" name="workorder">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card v-if="userDeptWarning" shadow="never">
                <el-alert title="您尚未加入部门" type="warning" show-icon style="margin-bottom: 5px"
                          :closable="false">
                  <span>前往 用户管理-部门管理，选中部门后点加入</span>
                  <el-button type="text" style="margin-left: 10px; padding: 3px 0" @click="handlerOpenDeptMgmt">打开部门管理</el-button>
                </el-alert>
              </el-card>
              <ticket-list-card v-if="!userDeptWarning" @handlerFetchData="fetchData"></ticket-list-card>
            </el-col>
            <el-col :span="16">
              <my-ticket-card ref="myTicketCard"></my-ticket-card>
              <my-ticket-history-card style="margin-top: 15px"></my-ticket-history-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="工单管理" name="workorderMgmt">
          <ticket-mgmt-table ref="ticketMgmtTable"></ticket-mgmt-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </d2-container>
</template>

<script>

  import util from '@/libs/util'

  // Component
  import TicketListCard from '@/components/opscloud/workorder/TicketListCard'
  import MyTicketCard from '@/components/opscloud/workorder/MyTicketCard'
  import MyTicketHistoryCard from '@/components/opscloud/workorder/MyTicketHistoryCard'
  import TicketMgmtTable from '@/components/opscloud/workorder/TicketMgmtTable.vue'

  import { checkUserInTheDepartment } from '@api/org/org.js'

  export default {
    data () {
      return {
        userDeptWarning: false,
        formDocStatus: {
          readMode: true, // 阅读模式
          visible: false
        },
        activeNames: [0],
        tabActiveName: 'workorder',
        title: '我的工单',
        workorderGroups: [],
        // operationType  0 编辑模式  1 审批模式  2 完成模式
        ticketTableData: []
      }
    },
    components: {
      TicketListCard,
      MyTicketCard,
      MyTicketHistoryCard,
      TicketMgmtTable
    },
    mounted () {
      this.setUserInTheDepartment()
    },
    methods: {
      setUserInTheDepartment () {
        checkUserInTheDepartment()
          .then(res => {
            this.userDeptWarning = !res.success
          })
      },
      handlerOpenDeptMgmt () {
        let url = 'https://oc.xinc818.com/index.html#/org/department'
        util.open(url)
      },
      fetchData () {
        this.$refs.myTicketCard.fetchData()
      }
    }
  }
</script>

<style scoped>
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
