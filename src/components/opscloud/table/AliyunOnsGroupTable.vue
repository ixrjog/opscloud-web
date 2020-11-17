<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
      <el-select v-model="queryParam.instance" placeholder="请选择实例" class="select" @change="getRegionId"
                 value-key="instanceId">
        <el-option
          v-for="item in instanceOptions"
          :key="item.id"
          :label="item.instanceName"
          :value="item">
          <span style="float: left">{{ item|instanceFilters }}</span>
          <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.remark }}</span>
        </el-option>
      </el-select>
      <el-input v-model.trim="queryParam.groupId" placeholder="输入关键字查询GroupId" class="input"/>
      <el-select v-model="queryParam.groupType" placeholder="消息类型" class="select" clearable disabled>
        <el-option
          v-for="item in groupTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" :disabled="regionId === ''">查询</el-button>
      <el-button @click="handlerSync" style="margin-left: 5px" :disabled="regionId === ''" :loading="syncLoading">同步
      </el-button>
      <el-button @click="handlerAdd" style="margin-left: 5px">创建GroupId</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="groupId" label="GroupId"></el-table-column>
      <el-table-column label="协议类型" width="180">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.groupType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="alarmUserList" label="告警接收人" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-for="item in scope.row.alarmUserList" :key="item.id" style="margin-right: 5px">{{ item | userFilters }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button-group>
            <el-tooltip class="item" effect="dark" content="订阅关系" placement="left">
              <el-button type="primary" plain size="mini" @click="getGroupSubDetail(scope.row)"
                         icon="el-icon-share"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="消费状态" placement="top">
              <el-button type="primary" plain size="mini" @click="getGroupStatus(scope.row)"
                         icon="el-icon-shopping-cart-full"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="监控配置" placement="top">
              <el-button type="primary" plain size="mini" @click="getGroupAlarm(scope.row)"
                         icon="el-icon-bell"></el-button>
            </el-tooltip>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <aliyun-ons-group-sub-drawer ref="aliyunONSGroupSubDrawer"
                                 :formStatus="aliyunONSGroupSubDrawerStatus"></aliyun-ons-group-sub-drawer>
    <aliyun-ons-group-dialog ref="aliyunONSGroupDialog"
                             :formStatus="aliyunONSGroupDialogStatus"></aliyun-ons-group-dialog>
    <aliyun-ons-group-status-dialog ref="aliyunONSGroupStatusDialog"
                                    :formStatus="aliyunONSGroupDialogStatusStatus"></aliyun-ons-group-status-dialog>
    <aliyun-ons-group-alarm-dialog ref="aliyunOnsGroupAlarmDialog" @closeDialog="fetchData"
                                   :formStatus="aliyunOnsGroupAlarmDialogStatus"></aliyun-ons-group-alarm-dialog>
  </div>
</template>

<script>
import AliyunOnsGroupSubDrawer from '@/components/opscloud/drawer/AliyunOnsGroupSubDrawer'
import AliyunOnsGroupDialog from '@/components/opscloud/dialog/AliyunOnsGroupDialog'
import AliyunOnsGroupStatusDialog from '@/components/opscloud/dialog/AliyunOnsGroupStatusDialog'
import AliyunOnsGroupAlarmDialog from '@/components/opscloud/dialog/AliyunOnsGroupAlarmDialog'

// API
import { queryONSInstanceAll } from '@api/cloud/aliyun.ons.instance.js'
import {
  syncONSGroup,
  queryOnsGroupSubDetail,
  queryONSGroupPage,
  onsGroupStatus,
  queryONSGroupAlarm
} from '@api/cloud/aliyun.ons.group.js'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      syncLoading: false,
      aliyunONSGroupSubDrawerStatus: {
        visible: false
      },
      aliyunONSGroupDialogStatus: {
        visible: false
      },
      aliyunONSGroupDialogStatusStatus: {
        visible: false
      },
      aliyunOnsGroupAlarmDialogStatus: {
        visible: false
      },
      tableData: [],
      options: {
        stripe: true
      },
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      querying: false,
      queryParam: {
        instanceId: '',
        groupId: '',
        groupType: 'tcp'
      },
      instanceOptions: [],
      regionId: '',
      groupTypeOptions: [{
        value: 'tcp',
        label: 'tcp'
      }, {
        value: 'http',
        label: 'http'
      }],
      groupSubDetail: {},
      groupStatus: {}
    }
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  mounted () {
    this.initPageSize()
    this.getInstance()
  },
  components: {
    AliyunOnsGroupSubDrawer,
    AliyunOnsGroupDialog,
    AliyunOnsGroupStatusDialog,
    AliyunOnsGroupAlarmDialog
  },
  filters: {
    instanceFilters (instance) {
      return instance.instanceName + '<' + instance.envName + '>'
    },
    userFilters (user) {
      return user.username + '<' + user.displayName + '>'
    }
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
    getInstance () {
      queryONSInstanceAll()
        .then(res => {
          this.instanceOptions = res.body
        })
    },
    getRegionId (item) {
      this.regionId = item.regionId
    },
    getGroupSubDetail (row) {
      this.aliyunONSGroupSubDrawerStatus.visible = true
      this.groupSubDetail = {}
      let requestBody = {
        'regionId': this.regionId,
        'instanceId': row.instanceId,
        'groupId': row.groupId
      }
      queryOnsGroupSubDetail(requestBody)
        .then(res => {
          this.groupSubDetail = res.body
          this.groupSubDetail.groupId = row.groupId
          this.$refs.aliyunONSGroupSubDrawer.initData(this.groupSubDetail)
        })
    },
    getGroupStatus (row) {
      this.aliyunONSGroupDialogStatusStatus.visible = true
      this.groupStatus = {}
      let requestBody = {
        'regionId': this.regionId,
        'instanceId': row.instanceId,
        'groupId': row.groupId
      }
      onsGroupStatus(requestBody)
        .then(res => {
          this.groupStatus = res.body
          this.groupStatus.groupId = row.groupId
          this.$refs.aliyunONSGroupStatusDialog.initData(this.groupStatus)
        })
    },
    getGroupAlarm (row) {
      this.aliyunOnsGroupAlarmDialogStatus.visible = true
      queryONSGroupAlarm(row.id)
        .then(res => {
          this.$refs.aliyunOnsGroupAlarmDialog.initData(res.body, this.regionId, row.id)
        })
    },
    handlerAdd () {
      this.aliyunONSGroupDialogStatus.visible = true
      this.$refs.aliyunONSGroupDialog.initData(this.instanceOptions)
    },
    handlerSync () {
      this.$confirm('确定全量GroupId吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncLoading = true
        this.$message.info('后台同步数据中')
        setTimeout(() => {
          let requestBody = {
            'regionId': this.regionId,
            'instanceId': this.queryParam.instance.instanceId
          }
          syncONSGroup(requestBody)
            .then(res => {
              this.$message({
                message: '后台同步数据完成',
                type: 'success'
              })
              this.fetchData()
              this.syncLoading = false
            })
        }, 300)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        })
      })
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'instanceId': this.queryParam.instance.instanceId,
        'groupId': this.queryParam.groupId,
        'groupType': this.queryParam.groupType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryONSGroupPage(requestBody)
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
.input {
  display: inline-block;
  max-width: 200px;
  margin-right: 5px;
}

.select {
  margin-right: 5px;
}
</style>
