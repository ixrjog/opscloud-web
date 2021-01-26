<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="30%">
    <el-switch
      style="display: block"
      v-model="isActive"
      active-color="#67C23A"
      inactive-color="#F56C6C"
      active-text="启用告警"
      inactive-text="停用告警">
    </el-switch>
    <el-divider></el-divider>
    <el-form :model="groupAlarmData" ref="groupAlarmDataForm" label-width="160px" class="demo-ruleForm"
             v-loading="saving" element-loading-text="GroupId告警保存中"
             element-loading-spinner="el-icon-loading" :disabled="!isActive">
      <el-form-item label="是否在线" prop="online">
        <el-switch v-model="groupAlarmData.online"></el-switch>
        <el-tooltip class="item" effect="dark" :content="onlineComment" placement="right">
          <i class="el-icon-info" style="margin-left: 10px"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="订阅关系是否一致" prop="subscriptionSame">
        <el-switch v-model="groupAlarmData.subscriptionSame"></el-switch>
        <el-tooltip class="item" effect="dark" :content="subscriptionComment" placement="right">
          <i class="el-icon-info" style="margin-left: 10px"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="rebalance是否正常" prop="rebalanceOk">
        <el-switch v-model="groupAlarmData.rebalanceOk"></el-switch>
        <el-tooltip class="item" effect="dark" :content="rebalanceComment" placement="right">
          <i class="el-icon-info" style="margin-left: 10px"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="总消费堆积" prop="totalDiff" :rules="rules">
        <el-input type="totalDiff" v-model.number="groupAlarmData.totalDiff" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="延迟时间" prop="delayTime" :rules="rules">
        <el-input v-model.number="groupAlarmData.delayTime">
          <template slot="append">(秒)</template>
        </el-input>
      </el-form-item>
      <el-form-item label="告警沉默时间(分钟)" prop="alarmSilentTime">
        <el-slider :min="1" :max="60" v-model="groupAlarmData.alarmSilentTime" show-input input-size="mini">
        </el-slider>
      </el-form-item>
      <el-form-item label="告警接收人" prop="userIdList" :rules="selectRules">
        <el-select v-model="groupAlarmData.userIdList" filterable clearable multiple
                   remote reserve-keyword placeholder="搜索用户" :remote-method="getUser">
          <el-option v-for="user in userOptions" :key="user.id" :label="user.displayName" :value="user.id">
            <span style="float: left">{{ user | userFilters }}</span>
            <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ user.email }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="groupAlarmSave" :disabled="saving">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { saveONSGroupAlarm } from '@api/cloud/aliyun.ons.group.js'
import { fuzzyQueryUserPage } from '@api/user/user.js'
import { userFilters } from '@/filters/user'

const groupAlarmData = {
  id: '',
  online: true,
  subscriptionSame: true,
  rebalanceOk: true,
  totalDiff: 0,
  delayTime: 0,
  alarmSilentTime: 30,
  userIdList: []
}

export default {
  data () {
    return {
      title: 'GroupId告配置',
      groupAlarmData: groupAlarmData,
      isActive: true,
      onlineComment: '只要该Group ID下有一个消费者实例在线，就显示在线;若该Group ID下所有消费者实例都不在线，则显示离线',
      subscriptionComment: '表示同一个 Group ID 下所有 Consumer 实例的订阅逻辑是否保持完全一致',
      rebalanceComment: '当消息队列 RocketMQ 版的 Broker 或客户端重启、扩容或缩容时，会触发 Rebalance，此时消费者可能会收到重复消息',
      saving: false,
      rules: [{ type: 'number', message: '阈值必须为数字值' }],
      selectRules: [{ type: 'array', required: true, message: '请至少选择一个告警接收人', trigger: 'change' }],
      userOptions: [],
      regionId: '',
      onsGroupId: ''
    }
  },
  name: 'AliyunOnsGroupAlarmDialog',
  props: ['formStatus'],
  mounted () {
  },
  filters: {
    userFilters
  },
  methods: {
    initData (data, regionId, onsGroupId) {
      this.saving = false
      this.regionId = regionId
      this.onsGroupId = onsGroupId
      if (data.id === null) {
        this.groupAlarmData = Object.assign({}, groupAlarmData)
      } else {
        this.groupAlarmData = Object.assign({}, data)
        this.userOptions = data.alarmUserList
      }
    },
    getRegionId (item) {
      this.groupData.regionId = item.regionId
    },
    getUser (queryName) {
      this.getUserLoading = true
      let requestBody = {
        'queryName': queryName,
        'extend': 0,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
          this.getUserLoading = false
        })
    },
    groupAlarmSave () {
      this.saving = true
      let requestBody = {
        'id': this.groupAlarmData.id,
        'regionId': this.regionId,
        'onsGroupId': this.onsGroupId,
        'alarmStatus': this.isActive ? 1 : 0,
        'online': this.groupAlarmData.online,
        'subscriptionSame': this.groupAlarmData.subscriptionSame,
        'rebalanceOk': this.groupAlarmData.rebalanceOk,
        'totalDiff': this.groupAlarmData.totalDiff,
        'delayTime': this.groupAlarmData.delayTime,
        'userIdList': this.groupAlarmData.userIdList,
        'alarmSilentTime': this.groupAlarmData.alarmSilentTime
      }
      saveONSGroupAlarm(requestBody)
        .then(res => {
          this.saving = false
          this.$message.success('保存成功')
          this.formStatus.visible = false
          this.$emit('closeDialog')
        })
    }
  }
}
</script>

<style scoped>
</style>
