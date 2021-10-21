<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="60%">
    <h2>{{ queryParam.groupId }}</h2>
    <el-divider></el-divider>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="20">
      <el-input v-model.trim="queryParam.msgId" class="input" placeholder="请输入完整Message ID，不支持模糊查询"/>
      <el-button @click="fetchData" :disabled="queryParam.msgId === ''">查询</el-button>
    </el-row>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item v-for="item in props.row.propertyList" :label="item.name" :key="item.name">
              <span>{{ item.value }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="topic" label="Topic">
        <template slot-scope="scope">
          <el-row>
            <span v-clipboard:copy="scope.row.topic" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.topic }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="Message ID" width="300">
        <template slot-scope="scope">
          <el-row>
            <span v-clipboard:copy="scope.row.msgId" v-clipboard:success="onCopy"
                  v-clipboard:error="onError">{{ scope.row.msgId }}
              <i style="margin-left: 5px" class="el-icon-copy-document"></i>
            </span>
          </el-row>
          <el-row>
            <span>{{ scope.row.bornHost }}</span>
            <span style="margin-left: 10px">{{ scope.row.storeSize }} Bytes</span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column prop="reconsumeTimes" label="重试次数" width="80"></el-table-column>
      <el-table-column prop="bornTime" label="生成时间" width="150"></el-table-column>
      <el-table-column prop="storeTime" label="存储时间" width="150"></el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="重新发送" placement="left">
            <el-popconfirm
              title="确定要重新发送吗？" @onConfirm="handlerResend(scope.row)">
              <el-button slot="reference" type="primary" plain size="mini"
                         icon="el-icon-s-promotion"></el-button>
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { queryOnsDLQMessage, resendOnsDLQMessage } from '@api/cloud/aliyun.ons.group'

export default {
  data () {
    return {
      title: '死信队列查询',
      queryParam: {
        regionId: '',
        instanceId: '',
        groupId: '',
        msgId: ''
      },
      aliyunOnsTopicMsgTraceDialogStatus: {
        visible: false
      },
      tableData: [],
      loading: false
    }
  },
  name: 'AliyunOnsDLQMessageDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {},
  filters: {},
  methods: {
    initData (groupIdData) {
      this.tableData = []
      this.queryParam = {
        'regionId': groupIdData.regionId,
        'instanceId': groupIdData.instanceId,
        'groupId': groupIdData.groupId,
        'msgId': ''
      }
    },
    fetchData () {
      if (this.queryParam.msgId === '') {
        this.$message.info('请输入Message ID')
        return
      }
      this.tableData = []
      queryOnsDLQMessage(this.queryParam)
        .then(res => {
          if (res.body !== null) {
            this.tableData.push(res.body)
          }
        })
    },
    handlerResend (row) {
      let requestBody = {
        'regionId': this.queryParam.regionId,
        'instanceId': this.queryParam.instanceId,
        'groupId': this.queryParam.groupId,
        'msgId': row.msgId
      }
      resendOnsDLQMessage(requestBody)
        .then(res => {
          this.$message.success('重新发送成功')
        })
    },
    onCopy (e) {
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
  max-width: 300px;
  margin-right: 5px;
}
</style>

<style>
.table-expand {
font-size: 8px;
}

.table-expand label {
width: 300px;
color: #99a9bf;
}

.table-expand .el-form-item {
margin-right: 0;
margin-bottom: 0;
width: 100%;
}
</style>
