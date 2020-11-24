<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="30%">
    <el-form :model="topicData" ref="topicDataForm" :rules="rules" label-width="80px" class="demo-ruleForm"
             label-position="left" v-loading="creating" element-loading-text="Topic创建中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="MQ实例" prop="instance" required>
        <el-select v-model="topicData.instance" placeholder="请选择实例" @change="getRegionId"
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
      </el-form-item>
      <el-form-item label="Topic" prop="topic" required>
        <el-input v-model.trim="topicData.topic" :readonly="topicChecked">
          <el-button slot="append" :icon="topicChecked?'el-icon-success':'el-icon-warning'"
                     @click="handlerCheck(topicData.topic)" :disabled="topicChecked"></el-button>
        </el-input>
        <span class="span-font">
          <p>1. “CID”和“GID”是Group ID的保留字段，Topic命名不能以“CID”和“GID”开头</p>
          <p>2. Topic只能以 “TOPIC_”开头，包含英文、数字和下划线（_）</p>
          <p>3. 长度限制在3~64个字符之间</p>
        </span>
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType" required>
        <el-select v-model="topicData.messageType" placeholder="消息类型" clearable>
          <el-option
            v-for="item in messageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="topicData.remark"></el-input>
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
  instance: {},
  messageType: 0,
  topic: '',
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
      if (topic === '') {
        this.$message.error('请输入Topic')
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
            this.$message.error('请先校验Topic')
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
.span-font {
  font-size: 6px;
  color: #99a9bf;
}
</style>
