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
      <el-input v-model="queryParam.topic" placeholder="输入关键字查询Topic" class="input"/>
      <el-select v-model="queryParam.messageType" placeholder="消息类型" class="select" clearable>
        <el-option
          v-for="item in messageTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" style="margin-left: 5px" :disabled="regionId === ''">查询</el-button>
      <el-button @click="handlerSync" style="margin-left: 5px" :disabled="regionId === ''" :loading="syncLoading">同步
      </el-button>
      <el-button @click="handlerAdd" style="margin-left: 5px">创建Topic</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="topic" label="topic"></el-table-column>
      <el-table-column prop="messageType" label="消息类型">
        <template slot-scope="props">
          <el-tag>{{ props.row.messageType | messageTypeFilters }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="relationName" label="所有关系"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="getTopicSubDetail(scope.row)">订阅关系</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   :page-sizes="[10, 15, 20, 25, 30]" @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <aliyunONSTopicSubDrawer ref="aliyunONSTopicSubDrawer"
                             :formStatus="aliyunONSTopicSubDrawerStatus"></aliyunONSTopicSubDrawer>
    <aliyunONSTopicDialog ref="aliyunONSTopicDialog"
                          :formStatus="aliyunONSTopicDialogStatus"></aliyunONSTopicDialog>
  </div>
</template>

<script>
import AliyunONSTopicSubDrawer from '@/components/opscloud/drawer/AliyunONSTopicSubDrawer'
import AliyunONSTopicDialog from '@/components/opscloud/dialog/AliyunONSTopicDialog'

// API
import { queryONSInstanceAll } from '@api/cloud/aliyun.ons.instance.js'
import { syncONSTopic, queryOnsTopicSubDetail, queryONSTopicPage } from '@api/cloud/aliyun.ons.topic.js'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      syncLoading: false,
      aliyunONSTopicSubDrawerStatus: {
        visible: false
      },
      aliyunONSTopicDialogStatus: {
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
        topic: '',
        messageType: ''
      },
      instanceOptions: [],
      regionId: '',
      messageTypeOptions: [{
        value: 0,
        label: '普通消息'
      }, {
        value: 1,
        label: '分区顺序消息'
      }, {
        value: 2,
        label: '全局顺序消息'
      }, {
        value: 4,
        label: '事务消息'
      }, {
        value: 5,
        label: '定时/延时消息'
      }],
      topicSubDetail: {}
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
    AliyunONSTopicSubDrawer,
    AliyunONSTopicDialog
  },
  filters: {
    instanceFilters (instance) {
      return instance.instanceName + '<' + instance.envName + '>'
    },
    messageTypeFilters (messageType) {
      if (messageType === 0) {
        return '普通消息'
      }
      if (messageType === 1) {
        return '分区顺序消息'
      }
      if (messageType === 2) {
        return '全局顺序消息'
      }
      if (messageType === 4) {
        return '事务消息'
      }
      if (messageType === 5) {
        return '定时/延时消息'
      }
      return ''
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
    getTopicSubDetail (row) {
      this.aliyunONSTopicSubDrawerStatus.visible = true
      this.topicSubDetail = {}
      let requestBody = {
        'regionId': this.regionId,
        'instanceId': row.instanceId,
        'topic': row.topic
      }
      queryOnsTopicSubDetail(requestBody)
        .then(res => {
          this.topicSubDetail = res.body
          this.topicSubDetail.topic = row.topic
          this.$refs.aliyunONSTopicSubDrawer.initData(this.topicSubDetail)
        })
    },
    handlerAdd () {
      this.aliyunONSTopicDialogStatus.visible = true
      this.$refs.aliyunONSTopicDialog.initData(this.instanceOptions)
    },
    handlerSync () {
      this.$confirm('确定全量Topic吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncLoading = true
        this.$message({
          message: '后台同步数据中',
          type: 'info'
        })
        setTimeout(() => {
          let requestBody = {
            'regionId': this.regionId,
            'instanceId': this.queryParam.instance.instanceId
          }
          syncONSTopic(requestBody)
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
        'topic': this.queryParam.topic,
        'messageType': this.queryParam.messageType === '' ? -1 : this.queryParam.messageType,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryONSTopicPage(requestBody)
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
