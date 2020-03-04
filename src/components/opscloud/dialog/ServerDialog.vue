<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="formData">
      <el-form-item label="名称" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.name" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="服务器组" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.serverGroupId" filterable clearable
                   remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getServerGroup"
                   :loading="loading">
          <el-option
            v-for="item in formData.serverGroupOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="服务器类型" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.serverType" placeholder="选择类型">
          <el-option
            v-for="item in serverTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="登录用户" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.loginUser" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="登录类型" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.loginType" placeholder="选择类型">
          <el-option
            v-for="item in loginTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="环境" :label-width="formStatus.labelWidth">
        <el-select v-model="formData.envType" filterable clearable
                   remote reserve-keyword
                   :loading="loading">
          <el-option
            v-for="item in formData.envTypeOptions"
            :key="item.envType"
            :label="item.envName"
            :value="item.envType">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="区" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.area" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="公网ip" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.publicIp" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="私网ip" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.privateIp" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="序号" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.serialNumber" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <el-form :model="formData">
      <el-form-item label="描述" :label-width="formStatus.labelWidth">
        <el-input v-model="formData.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { addServer, updateServer } from '@api/server/server.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'

  export default {
    data () {
      return {
        loading: false,
        serverTypeOptions: [{
          value: 0,
          label: 'server'
        }, {
          value: 1,
          label: 'vmware vm'
        }, {
          value: 2,
          label: 'aliyun ecs'
        }, {
          value: 3,
          label: 'aws ec2'
        }, {
          value: 4,
          label: 'tencent cvm'
        }, {
          value: 5,
          label: 'vmware esxi'
        }],
        loginTypeOptions: [{
          value: 0,
          label: 'key'
        }, {
          value: 1,
          label: 'passwd'
        }]
      }
    },
    name: 'server-dialog',
    props: ['formStatus', 'formData'],
    mixins: [],
    mounted () {
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      getServerGroup (queryName) {
        queryServerGroupPage(queryName, '', 1, 20)
          .then(res => {
            this.formData.serverGroupOptions = res.body.data
          })
      },
      saveInfo () {
        setTimeout(() => {
          var requestBody = {}
          requestBody = Object.assign({}, this.formData)
          delete requestBody.serverGroupOptions
          delete requestBody.tags
          delete requestBody.env
          requestBody.serverGroupId = this.formData.serverGroup == null ? this.formData.serverGroupId : this.formData.serverGroup.id
          if (this.formStatus.operationType) {
            addServer(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeServerDialog')
              })
          } else {
            updateServer(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.formStatus.visible = false
                this.$emit('closeServerDialog')
              })
          }
        }, 600)
      }
    }
  }
</script>
