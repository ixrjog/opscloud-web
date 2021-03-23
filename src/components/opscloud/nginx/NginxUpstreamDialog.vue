<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle" append-to-body
             :visible.sync="formStatus.visible" width="40%" @before-close="handlerClose">
    <el-form :model="upstreamData" :rules="rules" label-width="130px" ref="upstreamDataForm">
      <el-form-item label="后端类型">
        <el-select v-model="upstreamData.backendType" class="search">
          <el-option
            v-for="item in backendTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务器组" prop="serverGroupId">
        <el-select v-model.trim="upstreamData.serverGroupId" class="search" filterable clearable
                   remote reserve-keyword placeholder="输入关键词搜组" :remote-method="getServerGroup"
                   @change="getBackend">
          <el-option
            v-for="item in serverGroupOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务器" v-show="upstreamData.backendType ===1">
        <el-select v-model.trim="upstreamData.serverId" class="search" clearable
                   :disabled="serverOptions === []">
          <el-option
            v-for="item in serverOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            <span style="float: left">{{ item.cloudServer.instanceName }}</span>
            <span style="float: right; color: #8492a6; font-size: 10px;margin-left: 20px">{{ item.privateIp }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="环境类型" v-show="upstreamData.backendType ===2">
        <el-select v-model="upstreamData.envType" class="search" clearable>
          <el-option
            v-for="item in envTypeOptions"
            :key="item.envType"
            :label="item.envName"
            :value="item.envType">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="端口" prop="backendPort">
        <el-input v-model.number="upstreamData.backendPort" placeholder="请输入端口" class="input"></el-input>
      </el-form-item>
      <el-form-item label="健康检查" prop="needHealthCheck">
        <el-switch
          v-model="upstreamData.needHealthCheck"
          active-color="#67C23A" inactive-color="#909399"
          active-text="开启" inactive-text="关闭">
        </el-switch>
      </el-form-item>
      <el-form-item label="健康检查路径" prop="healthCheckPath" v-if="upstreamData.needHealthCheck">
        <el-input v-model.trim="upstreamData.healthCheckPath" placeholder="请输入健康检查路径" class="input"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="upstreamData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handlerClose">取消</el-button>
      <el-button type="primary" size="mini" @click="saveUpstreamConf">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { queryServerGroupPage } from '@api/server/server.group'
import { queryEnvPage } from '@api/env/env'
import { queryServerByServerGroup } from '@api/server/server'
import { saveUpstream } from '@api/nginx/nginx.upstream'

export default {
  data () {
    return {
      recordRrCheck: false,
      loading: false,
      title: {
        addTitle: '新增upstream配置',
        updateTitle: '变更upstream配置'
      },
      ids: [],
      serverGroupOptions: [],
      serverOptions: [],
      upstreamData: {},
      backendTypeOptions: [
        {
          value: 1,
          label: '服务器'
        },
        {
          value: 2,
          label: '服务器组'
        }
      ],
      envTypeOptions: [],
      rules: {
        backendPort: [
          { required: true, message: '请输入代理端口', trigger: 'blur' }
        ],
        serverGroupId: [
          { required: true, message: '请选择服务器组', trigger: 'change' }
        ]
      }
    }
  },
  name: 'NginxUpstreamDialog',
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
  filters: {},
  methods: {
    getBackend () {
      if (this.upstreamData.serverGroupId === null || this.upstreamData.serverGroupId === '') {
        return
      }
      if (this.upstreamData.backendType === 1) {
        this.getServer(this.upstreamData.serverGroupId)
      }
      if (this.upstreamData.backendType === 2) {
        this.getEnvType()
      }
    },
    getServerGroup (queryName) {
      this.serverGroupOptions = []
      queryServerGroupPage(queryName, '', 1, 20)
        .then(res => {
          this.serverGroupOptions = res.body.data
        })
    },
    getEnvType () {
      this.envTypeOptions = []
      queryEnvPage('', '', 1, 20)
        .then(res => {
          this.envTypeOptions = res.body.data
        })
    },
    getServer (serverGroupId) {
      this.serverOptions = []
      let requestBody = {
        'serverGroupId': serverGroupId
      }
      queryServerByServerGroup(requestBody)
        .then(res => {
          this.serverOptions = res.body
        })
    },
    handlerClose () {
      this.serverGroupOptions = []
      this.serverOptions = []
      this.envTypeOptions = []
      this.formStatus.visible = false
    },
    initData (upstreamData) {
      this.upstreamData = upstreamData
    },
    initServerGroup (serverGroupOptions) {
      this.serverGroupOptions = serverGroupOptions
    },
    initServer (serverOptions) {
      this.serverOptions = serverOptions
    },
    initEnvType (envTypeOptions) {
      this.envTypeOptions = envTypeOptions
    },
    saveUpstreamConf () {
      this.$refs.upstreamDataForm.validate((valid) => {
        if (valid) {
          setTimeout(() => {
            let requestBody = {
              'id': this.upstreamData.id,
              'backendType': this.upstreamData.backendType,
              'serverGroupId': this.upstreamData.serverGroupId,
              'backendPort': this.upstreamData.backendPort,
              'needHealthCheck': this.upstreamData.needHealthCheck,
              'healthCheckPath': this.upstreamData.healthCheckPath,
              'remark': this.upstreamData.remark
            }
            if (this.upstreamData.backendType === 1) {
              requestBody.backendLinkKey = this.upstreamData.serverId
            }
            if (this.upstreamData.backendType === 2) {
              requestBody.backendLinkKey = this.upstreamData.envType
            }
            saveUpstream(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerClose()
                this.$emit('closeDialog')
                this.$emit('handlerUpstreamAdd')
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
