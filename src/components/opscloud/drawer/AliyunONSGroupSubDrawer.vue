<template>
  <el-drawer :visible.sync="formStatus.visible" v-model="groupSubDetail" :with-header="false">
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
          <span class="span-font-label">GroupId</span>
        </el-col>
        <el-col :span="12">
          <span class="span-font">{{ groupSubDetail.groupId }}</span>
        </el-col>
      </el-row>
      <el-row style="margin-bottom: 5px">
        <el-col :span="12">
          <span class="span-font-label">是否在线</span>
        </el-col>
        <el-col :span="12">
          <el-tag v-text="groupSubDetail.online?'是':'否'"
                  :type="groupSubDetail.online?'success':'danger'"></el-tag>
        </el-col>
      </el-row>
      <el-row style="margin-bottom: 5px">
        <el-col :span="12">
          <span class="span-font-label">消费模式</span>
        </el-col>
        <el-col :span="12">
          <span class="span-font">{{ groupSubDetail.messageModel |messageModelFilters }}</span>
        </el-col>
      </el-row>
    </el-card>
    <div style="margin-bottom: 30px"></div>
    <el-table ref="singleTable" :data="groupSubDetail.subList" stripe>
      <el-table-column type="index" label="No"></el-table-column>
      <el-table-column prop="topic" label="Topic"></el-table-column>
      <el-table-column prop="subString" label="订阅表达式"></el-table-column>
    </el-table>
  </el-drawer>
</template>

<script>
export default {
  data () {
    return {
      groupSubDetail: {}
    }
  },
  name: 'AliyunONSGroupSubDrawer',
  props: ['formStatus'],
  mounted () {
  },
  filters: {
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
    initData (groupSubDetail) {
      this.groupSubDetail = groupSubDetail
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
