<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible" width="40%" @before-close="handlerClose">
    <el-form :model="instanceData" :rules="rules" label-width="130px" ref="instanceDataForm">
      <el-form-item label="域名名称" prop="domainName">
        <el-input v-model="instanceData.domainName" disabled class="input"></el-input>
      </el-form-item>
      <el-form-item label="主机记录" prop="recordRr">
        <div class="input">
          <el-input v-model.trim="instanceData.recordRr" placeholder="请输入主机记录" :disabled="formStatus.isUpdate"
                    :readonly="recordRrCheck">
            <el-button slot="append" :icon="recordRrCheck?'el-icon-success':'el-icon-warning'"
                       @click="handlerCheck(instanceData.recordRr)" :disabled="formStatus.isUpdate"></el-button>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item label="关联SLB" prop="loadBalanceId">
        <el-select v-model="instanceData.loadBalanceId" placeholder="请选择" class="search">
          <el-option
            v-for="item in loadBalanceOptions"
            :key="item.value"
            :label="item.loadBalancerName"
            :value="item.loadBalancerId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务器组" prop="serverGroupId">
        <el-select v-model.trim="instanceData.serverGroupId" class="search" filterable clearable
                   remote reserve-keyword placeholder="输入关键词搜组" :remote-method="getServerGroup"
                   @change="getUpstream">
          <el-option
            v-for="item in serverGroupOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联upstream" prop="backendId">
        <el-select v-model="instanceData.backendId" placeholder="请选择" class="search">
          <el-option
            v-for="item in backendOptions"
            :key="item.id"
            :label="item.backendName"
            :value="item.id">
          </el-option>
        </el-select>
        <el-button-group style="margin-left:5px">
          <el-button type="primary" icon="el-icon-circle-plus-outline" @click="backendAdd" size="mini"
                     plain></el-button>
          <el-button type="primary" icon="el-icon-refresh" @click="getUpstream" size="mini" plain></el-button>
        </el-button-group>
      </el-form-item>
      <el-form-item label="WebSocket" prop="proxyTimeout">
        <el-switch
          v-model="instanceData.isWebSocket"
          active-color="#67C23A" inactive-color="#909399"
          active-text="启用" inactive-text="不启用">
        </el-switch>
      </el-form-item>
      <el-form-item label="ProxyTimeout" prop="proxyTimeout">
        <el-input v-model="instanceData.proxyTimeout" placeholder="请输入超时时间，单位秒" class="input"></el-input>
      </el-form-item>
      <el-form-item label="Location参数" prop="locationParamList">
        <el-input v-model="instanceData.locationParamList"
                  type="textarea" :rows="4" placeholder="locationParam(多条参数需要换行)">
        </el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="instanceData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handlerClose">取消</el-button>
      <el-button type="primary" size="mini" @click="saveInstanceConf">确定</el-button>
    </div>
    <nginx-upstream-dialog ref="nginxUpstreamDialog" :formStatus="nginxUpstreamDialogStatus"></nginx-upstream-dialog>
  </el-dialog>
</template>

<script>
// API
import { saveSubdomainForwardInstance, subdomainForwardInstanceCheck } from '@api/nginx/nginx.subdomain.js'
import { queryServerGroupById, queryServerGroupPage } from '@api/server/server.group'
import { queryUpstreamPage } from '@api/nginx/nginx.upstream'
import NginxUpstreamDialog from '@/components/opscloud/nginx/NginxUpstreamDialog'

export default {
  data () {
    return {
      recordRrCheck: false,
      loading: false,
      title: {
        addTitle: '新增子域名转发域名配置',
        updateTitle: '变更子域名转发域名配置'
      },
      nginxUpstreamDialogStatus: {
        visible: false,
        isUpdate: true
      },
      loadBalanceOptions: [],
      serverGroupOptions: [],
      backendOptions: [],
      instanceData: {},
      rules: {
        recordRr: [
          { required: true, message: '请输入主机记录', trigger: 'blur' }
        ],
        loadBalanceId: [
          { required: true, message: '请选择关联的SLB', trigger: 'change' }
        ],
        serverGroupId: [
          { required: true, message: '请选择服务器组', trigger: 'change' }
        ],
        backendId: [
          { required: true, message: '请选择关联upstream', trigger: 'change' }
        ],
        proxyTimeout: [
          { required: true, message: '请输入超时时间', trigger: 'blur' }
        ]
      }
    }
  },
  name: 'NginxSubdomainForwardInstanceDialog',
  props: {
    formStatus: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  mounted () {
  },
  components: {
    NginxUpstreamDialog
  },
  filters: {},
  methods: {
    handlerCheck (recordRr) {
      if (recordRr === '') {
        this.$message.warning('请输入主机记录')
        return
      }
      let requestBody = {
        'subdomainId': this.instanceData.subdomainId,
        'recordRr': recordRr
      }
      subdomainForwardInstanceCheck(requestBody)
        .then(res => {
          this.$message.success('主机记录校验通过')
          this.recordRrCheck = true
        })
    },
    getServerGroup (queryName) {
      queryServerGroupPage(queryName, '', 1, 20)
        .then(res => {
          this.serverGroupOptions = res.body.data
        })
    },
    getUpstream () {
      this.backendOptions = []
      let requestBody = {
        'serverGroupId': this.instanceData.serverGroupId,
        'queryName': '',
        'page': 1,
        'length': 20
      }
      queryUpstreamPage(requestBody)
        .then(res => {
          this.backendOptions = res.body.data
        })
    },
    handlerClose () {
      this.loadBalanceOptions = []
      this.serverGroupOptions = []
      this.backendOptions = []
      this.formStatus.visible = false
      this.recordRrCheck = false
    },
    initData (instanceData) {
      this.instanceData = instanceData
      this.loadBalanceOptions = instanceData.loadBalanceOptions
    },
    initServerGroup (serverGroupOptions) {
      this.serverGroupOptions = serverGroupOptions
    },
    initBackend (backendOptions) {
      this.backendOptions = backendOptions
    },
    backendAdd () {
      let data = {
        id: '',
        backendType: 1,
        backendPort: '',
        remark: '',
        serverGroupId: this.instanceData.serverGroupId !== '' ? '' : this.instanceData.serverGroupId
      }
      if (this.instanceData.serverGroupId !== '') {
        queryServerGroupById(this.instanceData.serverGroupId)
          .then(res => {
            let serverGroupOptions = []
            serverGroupOptions.push(res.body)
            this.$refs.nginxUpstreamDialog.initServerGroup(serverGroupOptions)
          })
      }
      this.nginxUpstreamDialogStatus.isUpdate = false
      this.nginxUpstreamDialogStatus.visible = true
      this.$refs.nginxUpstreamDialog.initData(data)
    },
    saveInstanceConf () {
      if (!this.formStatus.isUpdate) {
        if (!this.recordRrCheck) {
          this.$message.warning('请先校验主机记录')
          return
        }
      }
      this.$refs.instanceDataForm.validate((valid) => {
        if (valid) {
          setTimeout(() => {
            let requestBody = {
              'subdomainId': this.instanceData.subdomainId,
              'recordRr': this.instanceData.recordRr,
              'serverGroupId': this.instanceData.serverGroupId,
              'backendId': this.instanceData.backendId,
              'isWebSocket': this.instanceData.isWebSocket,
              'proxyTimeout': this.instanceData.proxyTimeout,
              'loadBalanceId': this.instanceData.loadBalanceId,
              'locationParamList': this.instanceData.locationParamList,
              'remark': this.instanceData.remark
            }
            saveSubdomainForwardInstance(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerClose()
                this.$emit('closeDialog')
                this.$emit('handlerInstanceAdd')
              })
          }, 600)
        }
      })
    }
  }
}
</script>

<style scoped>
.search {
  display: inline-block;
  max-width: 200px;
  width: 200px;
}

.input {
  display: inline-block;
  max-width: 200px;
}
</style>
