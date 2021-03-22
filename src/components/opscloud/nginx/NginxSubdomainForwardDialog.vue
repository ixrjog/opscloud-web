<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible" width="50%">
    <el-form :model="domainData">
      <el-form-item label="域名名称" :label-width="formStatus.labelWidth" :required="true">
        <el-select v-model="domainData.domainName" filterable clearable remote reserve-keyword placeholder="搜索域名"
                   class="searchBarHeadStyle" :remote-method="getDomain" :disabled="formStatus.isUpdate">
          <el-option
            v-for="item in domainOptions"
            :key="item.id"
            :label="item.domainName"
            :value="item.domainName">
          </el-option>
        </el-select>
      </el-form-item>
      <el-transfer v-model="domainData.loadBalanceIdList"
                   :props="{ key: 'loadBalancerId', label: 'loadBalancerName' }"
                   :data="domainData.loadBalanceOptions" :titles="['所有SLB', '关联的SLB']">
      </el-transfer>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="saveDomainConf">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { saveSubdomainForward } from '@api/nginx/nginx.subdomain.js'
import { queryAliyunDomainPage } from '@api/cloud/aliyun.domain'

export default {
  data () {
    return {
      loading: false,
      title: {
        addTitle: '新增子域名转发域名配置',
        updateTitle: '变更子域名转发域名配置'
      },
      ids: [],
      domainOptions: [],
      domainData: {}
    }
  },
  name: 'NginxSubdomainForwardDialog',
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
    handleClick () {
      this.$emit('input', !this.value)
    },
    initData (domainData) {
      this.domainData = domainData
    },
    saveDomainConf () {
      setTimeout(() => {
        if (this.domainData.loadBalanceIdList.length === 0) {
          this.$message.error('关联的slb列表不能为空')
          return
        }
        let requestBody = {
          'loadBalanceIdList': this.domainData.loadBalanceIdList,
          'domainName': this.domainData.domainName
        }
        if (this.formStatus.isUpdate) {
          requestBody.id = this.domainData.id
        }
        saveSubdomainForward(requestBody)
          .then(res => {
            // 返回数据
            this.$message({
              message: '成功',
              type: 'success'
            })
            this.formStatus.visible = false
            this.$emit('closeDialog')
          })
      }, 600)
    }
  }
}
</script>

<style scoped>
.searchBarHeadStyle {
  display: inline-block;
  max-width: 200px;
}

</style>
