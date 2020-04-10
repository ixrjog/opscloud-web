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
        </el-row>
      </div>
      <el-row>
        <el-col :span="6">
          <el-tree :data="treeData" show-checkbox ref="myServerTree" node-key="id"></el-tree>
        </el-col>
        <el-col :span="18">
          <el-button @click="executorCommand" :style="searchBarStyle">执行</el-button>
          <el-tabs tab-position="left" v-if="serverTask != ''">
            <el-tab-pane label="执行中">
              <el-card shadow="never" v-for="member in serverTask.memberMap.EXECUTING" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">{{member.env.envName}}</el-tag>
                <d2-highlight :code="member.outputMsg" style="margin-top: 5px"/>
              </el-card>
            </el-tab-pane>
            <el-tab-pane label="队列">
              <el-card shadow="never" v-for="member in serverTask.memberMap.QUEUE" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">{{member.env.envName}}</el-tag>
              </el-card>
            </el-tab-pane>
            <el-tab-pane label="已完成">
              <el-card shadow="never" v-for="member in serverTask.memberMap.FINALIZED" :key="member.id"
                       style="margin-top: 5px">
                <el-tag disable-transitions>{{member.hostPattern}} - {{member.manageIp}}</el-tag>
                <el-tag disable-transitions :style="{ color: member.env.color , marginLeft: '5px' }">{{member.env.envName}}</el-tag>
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
  import { executorCommand, queryServerTaskById } from '@api/server/server.task.js'

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
        grpTypeOptions: [],
        searching: false
      }
    },
    mounted () {
      this.getGrpType('')
      // this.fetchData()
    },
    components: {},
    methods: {
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
          var requestBody = {
            uuid: this.uuid,
            taskType: 0,
            command: '',
            hostPatterns: this.$refs.myServerTree.getCheckedKeys(true, false)
          }
          console.log(JSON.stringify(requestBody))
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
