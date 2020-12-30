<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="40%">
    <el-form :model="topicData" ref="topicDataForm" :rules="rules" label-width="80px" class="demo-ruleForm"
             v-loading="creating" element-loading-text="Topic创建中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="MQ实例" prop="instance" required>
        <el-select v-model="topicData.instance" placeholder="请选择实例" @change="getRegionId" value-key="instanceId">
          <el-option
            v-for="item in instanceOptions"
            :key="item.id"
            :label="item.instanceName"
            :value="item">
            <span style="float: left">{{ item|instanceFilters }}</span>
            <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.remark }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Topic" prop="topic" required>
        <el-input v-model.trim="topicData.topic" :readonly="topicChecked">
          <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                     @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
        </el-input>
        <el-alert type="warning" show-icon :closable="false" style="margin-top: 10px">
          <el-row>1. Topic只能以 “TOPIC_”开头，包含大写英文、数字和下划线（_）</el-row>
          <el-row>2. 长度限制在3~64个字符之间</el-row>
          <el-row>3. Topic一旦创建，则无法修改</el-row>
        </el-alert>
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <el-select v-model="topicData.messageType" placeholder="消息类型">
          <el-option
            v-for="item in messageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" content="消息类型概述，点击查看" placement="right">
          <el-link
            href="https://help.aliyun.com/document_detail/172114.html?spm=5176.11065259.1996646101.searchclickresult.38ad6704oBWYjo"
            :underline="false" target="_blank">
            <i class="el-icon-info" style="margin-left: 5px"></i>
          </el-link>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="备注" prop="remark" required>
        <el-input v-model.trim="topicData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="onsTopicCreate" :disabled="creating">创建</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { onsTopicCreate, onsTopicCheck } from '@api/cloud/aliyun.ons.topic.js'

const topicData = {
  regionId: '',
  instance: '',
  messageType: 0,
  topic: 'TOPIC_',
  remark: ''
}

export default {
  data () {
    return {
      title: '创建Topic',
      topicData: topicData,
      instanceOptions: [],
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
      topicChecked: false,
      creating: false,
      rules: {
        topic: [
          { required: true, message: '请输入Topic', trigger: 'blur' },
          { min: 3, max: 64, message: '长度在 3 到 64 个字符', trigger: 'blur' }
        ],
        instance: [
          { required: true, message: '请选择MQ实例', trigger: 'change' }
        ],
        messageType: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ],
        remark: [
          { required: true, message: '请输入备注，例如：用户领券消息', trigger: 'blur' }
        ]
      }
    }
  },
  name: 'AliyunONSTopicDialog',
  props: ['formStatus'],
  mounted () {
  },
  filters: {
    instanceFilters (instance) {
      return instance.instanceName + '<' + instance.envName + '>'
    }
  },
  methods: {
    initData (instanceOptions) {
      this.topicData = Object.assign({}, topicData)
      this.topicChecked = false
      this.instanceOptions = instanceOptions
    },
    getRegionId (item) {
      this.topicData.regionId = item.regionId
    },
    handlerCheck (topic) {
      if (topic === '' || topic === 'TOPIC_') {
        this.$message.warning('请输入Topic')
        return
      }
      let data = {
        instanceId: this.topicData.instance.instanceId,
        topic: this.topicData.topic
      }
      onsTopicCheck(data)
        .then(res => {
          this.nameCheck = res.success
          if (this.nameCheck) {
            this.$message.success('校验通过')
            this.topicChecked = true
          } else {
            this.$message.error('该实例下Topic已存在')
          }
        })
    },
    onsTopicCreate () {
      this.$refs.topicDataForm.validate((valid) => {
        if (valid) {
          if (!this.topicChecked) {
            this.$message.warning('请先校验Topic')
            return
          }
          this.creating = true
          let data = {
            regionId: this.topicData.regionId,
            instanceId: this.topicData.instance.instanceId,
            messageType: this.topicData.messageType,
            topic: this.topicData.topic,
            remark: this.topicData.remark
          }
          onsTopicCreate(data)
            .then(res => {
              this.creating = false
              this.$message.success('创建成功')
              this.formStatus.visible = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
