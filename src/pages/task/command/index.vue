<template>
  <d2-container>
    <template>
      <div>
        <h1>服务器资源树</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model="queryParam.name" placeholder="名称" :style="searchBarHeadStyle"/>
          <el-select v-model="queryParam.grpType" filterable clearable :style="searchBarStyle"
                     remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getGrpType" :loading="loading">
            <el-option
              v-for="item in grpTypeOptions"
              :key="item.grpType"
              :label="item.name"
              :value="item.grpType">
            </el-option>
          </el-select>
          <el-button @click="fetchData" :style="searchBarStyle" :loading="searching">查询</el-button>
          <el-tooltip content="创建ansible主机配置文件" placement="bottom" effect="light">
            <el-button @click="createAnsibleHostsCfg" :style="searchBarStyle" :loading="creating">创建</el-button>
          </el-tooltip>
        </el-row>
      </div>
      <el-row>
        <el-col :span="6">
          <el-tree :data="treeData" show-checkbox ref="myServerTree" node-key="id"></el-tree>
        </el-col>
        <el-col :span="18">
          <el-tooltip content="系统命令输入框" placement="bottom" effect="light">
            <editor v-model="executorCommandParam.command" @init="editorInit" lang="sh" theme="chrome"
                    width="800"
                    height="80" :options="options"></editor>
          </el-tooltip>
          <div style="margin-top: 5px">
            <el-tooltip content="并发线程数" placement="bottom" effect="light">
              <el-input-number size="mini" v-model="executorCommandParam.concurrent" :min="1" :max="10"
                               :step="2"></el-input-number>
            </el-tooltip>
            <el-tooltip content="批量命令执行" placement="bottom" effect="light">
              <el-button @click="executorCommand" :style="searchBarStyle">执行</el-button>
            </el-tooltip>
          </div>
          <el-tabs tab-position="top" v-if="serverTask != ''">
            <el-tab-pane>
              <span slot="label"><i class="el-icon-loading"></i> 执行中</span>
              <el-card shadow="never" v-for="member in serverTask.memberMap.EXECUTING" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">
                  {{member.env.envName}}
                </el-tag>
                <d2-highlight :code="member.outputMsg" style="margin-top: 5px"/>
              </el-card>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label"><i class="el-icon-video-pause"></i> 队列</span>
              <el-card shadow="never" v-for="member in serverTask.memberMap.QUEUE" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">
                  {{member.env.envName}}
                </el-tag>
              </el-card>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label"><i class="el-icon-check"></i> 结束</span>
              <el-card shadow="never" v-for="member in serverTask.memberMap.FINALIZED" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">
                  {{member.env.envName}}
                </el-tag>
                <d2-highlight :code="member.outputMsg" style="margin-top: 5px"/>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

  // API
  import { queryUserServerTree } from '@api/user/user.js'
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { executorCommand, queryServerTaskById, createAnsibleHosts } from '@api/server/server.task.js'

  export default {
    data () {
      return {
        timer: null,
        serverTask: '',
        taskId: '',
        activeName: '',
        searchBarHeadStyle: {
          display: 'inline-block',
          maxWidth: '200px'
        },
        searchBarStyle: {
          marginLeft: '5px'
        },
        serverGroup: {},
        treeData: [],
        uuid: '',
        options: {
          stripe: true
        },
        loading: false,
        queryParam: {
          name: '',
          grpType: ''
        },
        executorCommandParam: {
          command: '',
          concurrent: 4,
          becomeUser: '',
          hostPatterns: [],
          uuid: '',
          taskType: 0
        },
        grpTypeOptions: [],
        searching: false,
        creating: false
      }
    },
    mounted () {
      this.getGrpType('')
      // this.fetchData()
    },
    components: {
      editor: require('vue2-ace-editor')
    },
    methods: {
      editorInit: function () {
        // language extension prerequsite...
        require('brace/ext/language_tools')
        // require('brace/mode/html')
        // language
        // require('brace/mode/yaml')
        // require('brace/mode/less')
        require('brace/mode/sh')
        require('brace/theme/chrome')
        // snippet
        require('brace/snippets/yaml')
      },
      setTimer () {
        if (this.timer == null) {
          this.timer = setInterval(() => {
            this.queryTask()
            console.log('开始定时...每3秒执行一次')
          }, 3000)
        }
      },
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      executorCommand () {
        try {
          var requestBody = Object.assign({}, this.executorCommandParam)
          requestBody.uuid = this.uuid
          requestBody.hostPatterns = this.$refs.myServerTree.getCheckedKeys(true, false)
          // console.log(JSON.stringify(requestBody))
          executorCommand(requestBody).then(res => {
            if (res.success) {
              this.$message({
                message: '任务执行中!',
                type: 'success'
              })
              this.taskId = res.body.id
              this.setTimer()
            } else {
              this.$message.error(res.msg)
            }
          })
        } catch (e) {

        }
      },
      createAnsibleHostsCfg () {
        this.creating = true
        createAnsibleHosts().then(res => {
          if (res.success) {
            this.$message({
              message: 'ansible主机配置文件创建成功!',
              type: 'success'
            })
          } else {
            this.$message.error(res.msg)
          }
          this.creating = false
        })
      },
      queryTask () {
        queryServerTaskById(this.taskId)
          .then(res => {
            this.serverTask = res.body
            if (res.body.finalized === 1) {
              clearInterval(this.timer)
            }
          })
      },
      fetchData () {
        this.searching = true
        this.treeData = []
        this.uuid = ''
        var requestBody = {
          queryName: this.queryParam.name,
          grpType: this.queryParam.grpType
        }
        queryUserServerTree(requestBody)
          .then(res => {
            this.treeData = res.body.tree
            this.uuid = res.body.uuid
            this.searching = false
          })
      }
    }
  }
</script>
