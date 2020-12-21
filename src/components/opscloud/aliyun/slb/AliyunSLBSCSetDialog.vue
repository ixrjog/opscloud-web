<template>
  <el-dialog title="更换证书"
             :visible.sync="formStatus.visible" width="45%">
    <el-select v-model="serverCertificate" value-key="id" filterable clearable remote reserve-keyword
               placeholder="搜索证书" :remote-method="getServerCertificate" @change="getNewSC">
      <el-option
        v-for="item in serverCertificateOptions"
        :key="item.id"
        :label="item.aliCloudCertificateName"
        :value="item">
      </el-option>
    </el-select>
    <el-divider></el-divider>
    <el-row>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header"><span>原证书</span></div>
          <div class="text item">{{ '证书名称： ' + oldServerCertificate.name }}</div>
          <div class="text item">{{ '域名： ' + oldServerCertificate.commonName }}</div>
          <div class="text item">{{ '过期时间： ' + oldServerCertificate.expireTime }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header"><span>新证书</span></div>
          <div class="text item">{{ '证书名称： ' + newServerCertificate.name }}</div>
          <div class="text item">{{ '域名： ' + newServerCertificate.commonName }}</div>
          <div class="text item">{{ '过期时间： ' + newServerCertificate.expireTime }}</div>
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button size="mini" type="primary" @click="saveSetSC" :loading="loading" :disabled="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { queryAliyunSlbSCPage, setUpdateSC } from '@api/cloud/aliyun.slb.sc'

const newServerCertificate = {
  name: '',
  commonName: '',
  expireTime: '',
  serverCertificateId: ''
}
export default {
  data () {
    return {
      loading: false,
      serverCertificate: '',
      oldServerCertificate: {
        name: '',
        commonName: '',
        expireTime: ''
      },
      newServerCertificate: newServerCertificate,
      setUpdateSC: {
        id: ''
      },
      domain: '',
      serverCertificateOptions: []
    }
  },
  name: 'AliyunSLBSCSetDialog',
  mounted () {
    this.getServerCertificate()
  },
  props: ['formStatus'],
  methods: {
    handleClick () {
      this.$emit('input', !this.value)
    },
    getNewSC () {
      this.newServerCertificate = {
        name: this.serverCertificate.aliCloudCertificateName || '',
        commonName: this.serverCertificate.aliCloudCertificateName || '',
        expireTime: this.serverCertificate.expireTime || '',
        serverCertificateId: this.serverCertificateId || ''
      }
    },
    getServerCertificate (queryName) {
      let requestBody = {
        'queryName': queryName,
        'page': 1,
        'length': 20
      }
      queryAliyunSlbSCPage(requestBody)
        .then(res => {
          this.serverCertificateOptions = res.body.data
        })
    },
    initData (row) {
      this.setUpdateSC.id = row.id
      this.oldServerCertificate = {
        name: row.aliCloudCertificateName,
        commonName: row.commonName,
        expireTime: row.expireTime
      }
      this.newServerCertificate = newServerCertificate
    },
    saveSetSC () {
      setTimeout(() => {
        this.loading = true
        let requestBody = {
          'id': this.setUpdateSC.id,
          'updateServerCertificateId': this.serverCertificate.serverCertificateId
        }
        setUpdateSC(requestBody)
          .then(res => {
            // 返回数据
            this.$message({
              message: '成功',
              type: 'success'
            })
            this.loading = false
            this.formStatus.visible = false
            this.$emit('handlerSetActive')
          })
      }, 600)
    }
  }
}
</script>

<style scoped>
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 380px;
}

</style>
