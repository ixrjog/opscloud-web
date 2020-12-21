<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible" width="30%">
    <el-form :model="domainRecordData" label-width="130px">
      <el-form-item label="域名名称" required v-show="!formStatus.isUpdate">
        <el-select v-model="domainRecordData.domainName" filterable clearable remote reserve-keyword placeholder="搜索域名"
                   class="searchBarHeadStyle" :remote-method="getDomain" :disabled="formStatus.isUpdate">
          <el-option
            v-for="item in domainOptions"
            :key="item.id"
            :label="item.domainName"
            :value="item.domainName">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="记录类型" required>
        <el-select v-model="domainRecordData.recordType" clearable placeholder="记录类型" class="searchBarHeadStyle">
          <el-option
            v-for="item in recordTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主机记录" required>
        <div class="searchBarHeadStyle">
          <el-input v-model.trim="domainRecordData.recordRr" placeholder="请输入主机记录"
                    v-show="domainRecordData.domainName !== ''">
            <span slot="append">
              {{ '.' + domainRecordData.domainName }}
            </span>
          </el-input>
          <el-input v-model.trim="domainRecordData.recordRr" placeholder="请输入主机记录"
                    v-show="domainRecordData.domainName === ''">
          </el-input>
        </div>
      </el-form-item>
      <el-form-item label="记录值" required>
        <el-input v-model.trim="domainRecordData.recordValue" placeholder="请输入记录值"
                  class="searchBarHeadStyle"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="saveDomainRecord">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { queryAliyunDomainPage } from '@api/cloud/aliyun.domain'
import { addAliyunDomainRecord, updateDomainRecord } from '@api/cloud/aliyun.dns'

export default {
  data () {
    return {
      loading: false,
      title: {
        addTitle: '新增DNS解析',
        updateTitle: '变更DNS解析'
      },
      domainRecordData: {
        recordId: '',
        domainName: '',
        recordType: '',
        recordRr: '',
        recordValue: ''
      },
      domainOptions: [],
      recordTypeOptions: [
        {
          value: 'A',
          label: 'A - 将域名指向IPv4地址格式'
        },
        {
          value: 'CNAME',
          label: 'CNAME - 将域名指向另外一个域名'
        },
        {
          value: 'TXT',
          label: 'TXT - 文本长度限制512'
        },
        {
          value: 'REDIRECT_URL',
          label: '显性URL转发'
        },
        {
          value: 'FORWARD_URL',
          label: '隐性URL转发'
        }
      ],
      loginTypeOptions: [{
        value: 0,
        label: 'key'
      }, {
        value: 1,
        label: 'passwd'
      }]
    }
  },
  name: 'AliyunDomainRecordDialog',
  props: {
    formStatus: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  mounted () {
    this.getDomain()
  },
  methods: {
    getDomain (queryName) {
      let requestBody = {
        'domainName': queryName,
        'isActive': 1,
        'page': 1,
        'length': 20
      }
      queryAliyunDomainPage(requestBody)
        .then(res => {
          this.domainOptions = res.body.data
        })
    },
    initData (domainRecordData) {
      this.domainRecordData = domainRecordData
    },
    handleClick () {
      this.$emit('input', !this.value)
    },
    saveDomainRecord () {
      setTimeout(() => {
        let requestBody = {
          'recordType': this.domainRecordData.recordType,
          'recordRr': this.domainRecordData.recordRr,
          'recordValue': this.domainRecordData.recordValue
        }
        if (this.formStatus.isUpdate) {
          requestBody.recordId = this.domainRecordData.recordId
          updateDomainRecord(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.formStatus.visible = false
              this.$emit('closeDomainRecordDialog')
            })
        } else {
          requestBody.domainName = this.domainRecordData.domainName
          addAliyunDomainRecord(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.formStatus.visible = false
              this.$emit('closeDomainRecordDialog')
            })
        }
      }, 600)
    }
  }
}
</script>

<style scoped>
.searchBarHeadStyle {
  display: inline-block;
  max-width: 400px;
  width: 400px;
}
</style>
