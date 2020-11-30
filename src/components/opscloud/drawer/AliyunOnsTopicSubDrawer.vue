<template>
  <div>
    <el-drawer :visible.sync="formStatus.visible" v-model="topicSubDetail" :with-header="false">
      <h4>订阅关系</h4>
      <el-card shadow="never">
        <el-row style="margin-bottom: 5px">
          <el-col :span="12">
            <span style="font-weight: bolder">条目</span>
          </el-col>
          <el-col :span="12">
            <span style="font-weight: bolder">数值</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 5px">
          <el-col :span="12">
            <span class="span-font-label">Topic</span>
          </el-col>
          <el-col :span="12">
            <span class="span-font">{{ topicSubDetail.topic }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 5px">
          <el-col :span="12">
            <span class="span-font-label">最后发送时间</span>
          </el-col>
          <el-col :span="12">
            <span class="span-font">{{ topicSubDetail.lastTimeStamp }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 5px">
          <el-col :span="12">
            <span class="span-font-label">消息数总和</span>
          </el-col>
          <el-col :span="12">
            <span class="span-font">{{ topicSubDetail.totalCount }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 5px">
          <el-col :span="12">
            <span class="span-font-label">所有关系编号</span>
          </el-col>
          <el-col :span="12">
            <span class="span-font">{{ topicSubDetail.perm |permFilters }}</span>
          </el-col>
        </el-row>
      </el-card>
      <div style="margin-bottom: 30px"></div>
      <el-table ref="singleTable" :data="topicSubDetail.subList" stripe>
        <el-table-column type="index" label="No"></el-table-column>
        <el-table-column prop="groupId" label="groupId"></el-table-column>
        <el-table-column prop="subString" label="订阅表达式"></el-table-column>
        <el-table-column label="消费模式">
          <template slot-scope="props">
            <el-tag>{{ props.row.messageModel | messageModelFilters }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="消费状态" placement="top">
              <el-button type="primary" plain size="mini" @click="getGroupStatus(scope.row)"
                         icon="el-icon-shopping-cart-full"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    <aliyun-ons-group-status-dialog ref="aliyunONSGroupStatusDialog"
                                :formStatus="aliyunONSGroupDialogStatusStatus"></aliyun-ons-group-status-dialog>
  </div>
</template>

<script>
import AliyunOnsGroupStatusDialog from '@/components/opscloud/aliyun/ons/AliyunOnsGroupStatusDialog'

import { onsGroupStatus } from '@api/cloud/aliyun.ons.group.js'

export default {
  data () {
    return {
      topicSubDetail: {},
      aliyunONSGroupDialogStatusStatus: {
        visible: false
      },
      groupStatus: {}
    }
  },
  name: 'AliyunONSTopicSubDrawer',
  props: ['formStatus'],
  components: {
    AliyunOnsGroupStatusDialog
  },
  mounted () {
  },
  filters: {
    permFilters (perm) {
      if (perm === 2) {
        return '可以发布'
      }
      if (perm === 4) {
        return '可以订阅'
      }
      if (perm === 6) {
        return '可以发布和订阅'
      }
    },
    messageModelFilters (messageModel) {
      if (messageModel === 'CLUSTERING') {
        return '集群订阅'
      }
      if (messageModel === 'BROADCASTING') {
        return '广播订阅'
      }
      return ''
    }
  },
  methods: {
    initData (topicSubDetail) {
      this.topicSubDetail = topicSubDetail
    },
    getGroupStatus (row) {
      this.aliyunONSGroupDialogStatusStatus.visible = true
      this.groupStatus = {}
      let requestBody = {
        'regionId': this.topicSubDetail.regionId,
        'instanceId': this.topicSubDetail.instanceId,
        'groupId': row.groupId
      }
      onsGroupStatus(requestBody)
        .then(res => {
          this.groupStatus = res.body
          this.groupStatus.groupId = row.groupId
          this.$refs.aliyunONSGroupStatusDialog.initData(this.groupStatus)
        })
    }
  }
}
</script>

<style scoped>
.span-font {
  font-size: 14px;
}

.span-font-label {
  font-size: 14px;
  color: #99a9bf;
}

</style>
