<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="20">
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
      <el-input v-model.trim="queryParam.topic" placeholder="输入关键字查询Topic" class="input"/>
      <el-select v-model="queryParam.messageType" placeholder="消息类型" class="select" clearable>
        <el-option
          v-for="item in messageTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" :disabled="regionId === ''">查询</el-button>
      <el-button @click="handlerSync" style="margin-left: 5px" :disabled="regionId === ''" :loading="syncLoading">同步
      </el-button>
      <el-button @click="handlerAdd" style="margin-left: 5px">创建Topic</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="topic" label="Topic" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-clipboard:copy="scope.row.topic" v-clipboard:success="onCopy"
                v-clipboard:error="onError">{{ scope.row.topic }}
            <i style="margin-left: 5px" class="el-icon-copy-document"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="messageType" label="消息类型">
        <template slot-scope="props">
          <el-tag>{{ props.row.messageType | messageTypeFilters }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="relationName" label="所有关系"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button-group>
            <el-tooltip class="item" effect="dark" content="订阅关系" placement="left">
              <el-button type="primary" plain size="mini" @click="getTopicSubDetail(scope.row)"
                         icon="el-icon-share"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="消息查询" placement="right">
              <el-button type="primary" plain size="mini" @click="getTopicMsg(scope.row)"
                         icon="el-icon-message"></el-button>
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
    <aliyun-ons-topic-sub-drawer ref="aliyunONSTopicSubDrawer"
                                 :formStatus="aliyunONSTopicSubDrawerStatus"></aliyun-ons-topic-sub-drawer>
    <aliyun-ons-topic-dialog ref="aliyunONSTopicDialog"
                             :formStatus="aliyunONSTopicDialogStatus"></aliyun-ons-topic-dialog>
    <aliyun-ons-topic-msg-dialog ref="aliyunOnsTopicMsgDialog"
                                 :formStatus="aliyunOnsTopicMsgDialogStatus"></aliyun-ons-topic-msg-dialog>
  </div>
</template>

<script>
import AliyunOnsTopicSubDrawer from '@/components/opscloud/drawer/AliyunOnsTopicSubDrawer'
import AliyunOnsTopicDialog from '@/components/opscloud/aliyun/ons/AliyunOnsTopicDialog'
import AliyunOnsTopicMsgDialog from '@/components/opscloud/aliyun/ons/AliyunOnsTopicMsgDialog'

// API
import { queryONSInstanceAll } from '@api/cloud/aliyun.ons.instance.js'
import { syncONSTopic, queryOnsTopicSubDetail, queryONSTopicPage } from '@api/cloud/aliyun.ons.topic.js'
import { mapActions, mapState } from 'vuex'
import { onsMessagePageQuery } from '@api/cloud/aliyun.ons.topic'

const topicMsgData = {
  msgList: '',
  regionId: '',
  instanceId: '',
  topic: ''
}

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
      aliyunOnsTopicMsgDialogStatus: {
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
      topicSubDetail: {},
      topicMsgData: topicMsgData
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
    AliyunOnsTopicSubDrawer,
    AliyunOnsTopicDialog,
    AliyunOnsTopicMsgDialog
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
    getTopicMsg (row) {
      this.topicMsgData = Object.assign({}, topicMsgData)
      let requestBody = {
        'regionId': this.regionId,
        'instanceId': row.instanceId,
        'topic': row.topic
      }
      onsMessagePageQuery(requestBody)
        .then(res => {
          this.topicMsgData = {
            'msgList': res.body,
            'regionId': this.regionId,
            'instanceId': row.instanceId,
            'topic': row.topic
          }
          this.$refs.aliyunOnsTopicMsgDialog.initData(this.topicMsgData)
          this.aliyunOnsTopicMsgDialogStatus.visible = true
        })
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
          this.topicSubDetail.instanceId = row.instanceId
          this.topicSubDetail.regionId = this.regionId
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
    },
    onCopy (e) {
      // this.queryParam.queryName = e.text
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
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
