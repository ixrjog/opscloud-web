<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible" width="40%" @before-close="handlerClose">
    <el-form :model="instanceData" :rules="rules" label-width="130px" ref="instanceDataForm">
      <el-form-item label="监听端口" prop="listenerPort">
        <div class="input">
          <el-input v-model.trim="instanceData.listenerPort" placeholder="端口(10000-50000)"
                    :disabled="formStatus.isUpdate">
            <el-button slot="append" :icon="listenerPortCheck?'el-icon-success':'el-icon-warning'"
                       @click="handlerCheck(instanceData.listenerPort)" :disabled="formStatus.isUpdate"></el-button>
          </el-input>
        </div>
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
        <el-select v-model="instanceData.backendId" placeholder="请选择" class="search" filterable>
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
      <el-form-item label="Location参数" prop="locationParamList">
        <el-input v-model="instanceData.locationParamList"
                  type="textarea" :rows="2" placeholder="locationParam(多条参数用;分割)">
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
import { tcpForwardInstanceCheck, saveTCPForwardInstance } from '@api/nginx/nginx.tcp.js'
import { queryServerGroupById, queryServerGroupPage } from '@api/server/server.group'
import { queryUpstreamPage } from '@api/nginx/nginx.upstream'
import NginxUpstreamDialog from '@/components/opscloud/nginx/NginxUpstreamDialog'

export default {
  data () {
    return {
      listenerPortCheck: false,
      loading: false,
      title: {
        addTitle: '新增TCP转发配置',
        updateTitle: '变更TCP转发配置'
      },
      serverGroupOptions: [],
      backendOptions: [],
      instanceData: {},
      nginxUpstreamDialogStatus: {
        visible: false,
        isUpdate: true
      },
      rules: {
        listenerPort: [
          { required: true, message: '请输入监听端口', trigger: 'blur' }
        ],
        serverGroupId: [
          { required: true, message: '请选择服务器组', trigger: 'change' }
        ],
        backendId: [
          { required: true, message: '请选择关联upstream', trigger: 'change' }
        ]
      }
    }
  },
  name: 'NginxTCPForwardInstanceDialog',
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
    handlerCheck (listenerPort) {
      if (listenerPort === '') {
        this.$message.error('请输入监听端口')
        return
      }
      if (listenerPort < 10000 || listenerPort > 50000) {
        this.$message.error('监听端口不符合规范')
        return
      }
      tcpForwardInstanceCheck(listenerPort)
        .then(res => {
          this.$message.success('校验通过')
          this.listenerPortCheck = true
        })
    },
    getServerGroup (queryName) {
      queryServerGroupPage(queryName, '', 1, 20)
        .then(res => {
          this.serverGroupOptions = res.body.data
        })
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
    handlerClose () {
      this.serverGroupOptions = []
      this.serverOptions = []
      this.formStatus.visible = false
      this.recordRrCheck = false
    },
    initData (instanceData) {
      this.instanceData = instanceData
    },
    initServerGroup (serverGroupOptions) {
      this.serverGroupOptions = serverGroupOptions
    },
    initBackend (backendOptions) {
      this.backendOptions = backendOptions
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
    saveInstanceConf () {
      if (!this.formStatus.isUpdate) {
        if (!this.listenerPortCheck) {
          this.$message.warning('请先校验监听端口')
          return
        }
      }
      this.$refs.instanceDataForm.validate((valid) => {
        if (valid) {
          setTimeout(() => {
            let requestBody = {
              'listenerPort': this.instanceData.listenerPort,
              'serverGroupId': this.instanceData.serverGroupId,
              'backendId': this.instanceData.backendId,
              'locationParamList': this.instanceData.locationParamList,
              'remark': this.instanceData.remark
            }
            saveTCPForwardInstance(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerClose()
                this.$emit('closeDialog')
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
