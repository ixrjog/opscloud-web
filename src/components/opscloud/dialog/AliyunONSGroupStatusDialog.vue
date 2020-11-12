<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="50%" v-model="groupDetail">
    <el-card shadow="hover">
      <el-row>
        <el-col :span="4">
          <img :src="groupDetail.online?onlineImageUrl:offlineImageUrl" style="height: 25%;width: 25%">
          <span v-text="groupDetail.online?'在线':'离线'" style="margin-left: 10px"></span>
        </el-col>
        <el-col :span="4">
          <el-row>
            <span class="span-font-label">实时消费速度</span>
          </el-row>
          <el-row style="margin-bottom: 5px">
            <span class="span-font">{{ groupDetail.consumeTps }} 条/秒</span>
          </el-row>
        </el-col>
        <el-col :span="4">
          <el-row>
            <span class="span-font-label">实时消息堆积量</span>
          </el-row>
          <el-row>
            <span class="span-font">{{ groupDetail.totalDiff }}</span>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <span class="span-font-label">最近消费时间</span>
          </el-row>
          <el-row>
            <span class="span-font">{{ groupDetail.lastTimestamp }}</span>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row>
            <span class="span-font-label">消息延迟时间</span>
          </el-row>
          <el-row>
            <span class="span-font">{{ groupDetail.delayTime }}</span>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
    <div style="margin-bottom: 30px"></div>
    <el-card shadow="hover">
      <el-row>
        <el-col :span="6">
          <span style="color: #99a9bf">GroupID</span>
        </el-col>
        <el-col :span="6">
          <span>{{ groupDetail.groupId }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <span style="color: #99a9bf">消费模式</span>
        </el-col>
        <el-col :span="6">
          <span>{{ groupDetail.consumeModel|consumeModelFilters }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <span style="color: #99a9bf">订阅关系是否一致</span>
        </el-col>
        <el-col :span="6">
          <el-tag v-text="groupDetail.subscriptionSame?'是':'否'"
                  :type="groupDetail.subscriptionSame?'success':'danger'"></el-tag>
        </el-col>
      </el-row>
    </el-card>
    <div style="margin-bottom: 30px"></div>
    <el-table :data="groupDetail.connectionSet" style="width: 100%">
      <el-table-column type="index" label="No"></el-table-column>
      <el-table-column prop="clientAddr" label="客户端IP"></el-table-column>
      <el-table-column prop="language" label="语言"></el-table-column>
      <el-table-column prop="version" label="版本号"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      title: '消费者状态',
      groupDetail: {},
      onlineImageUrl: require('@/static/icons/online.svg'),
      offlineImageUrl: require('@/static/icons/offline.svg')
    }
  },
  name: 'AliyunONSGroupStatusDialog',
  props: ['formStatus'],
  mounted () {
  },
  filters: {
    consumeModelFilters (consumeModel) {
      if (consumeModel === 'CLUSTERING') {
        return '集群订阅'
      }
      if (consumeModel === 'BROADCASTING') {
        return '广播订阅'
      }
      return '未知'
    }
  },
  methods: {
    initData (groupDetail) {
      this.groupDetail = groupDetail
    }
  }
}
</script>

<style scoped>
.span-font {
  font-size: 18px;
  color: #99a9bf;
}

.span-font-label {
  font-size: 10px;
}

</style>
