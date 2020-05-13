<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-row :gutter="10">
        <el-col :span="8" v-show="pageStatus == 0">
          <ServerTree ref="serverTree"></ServerTree>
        </el-col>
        <el-col :span="xtermSpan">
          <el-row style="margin-bottom: 5px;margin-left: 2px">
            <el-select v-model="layoutMode" filterable reserve-keyword @change="handlerResize">
              <el-option
                v-for="item in layoutModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="loginUserType" filterable reserve-keyword :style="loginStyle">
              <el-option
                v-for="item in loginUserTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-button @click="handlerBatchCmd" v-if="pageStatus === 1" :type="handlerBatchType" :style="loginStyle"
                       plain>命令同步
            </el-button>
            <el-button @click="handlerPreviewUserDoc" :style="loginStyle">用户文档</el-button>
            <el-button @click="handlerLogin" v-if="pageStatus === 0" :style="loginStyle">批量登录</el-button>
            <el-button @click="handlerClose" v-if="pageStatus === 1" :style="loginStyle">全部关闭</el-button>
          </el-row>
          <el-row>
            <div v-for="xterm in xterms" :key="xterm">
              <template>
                <el-col :span="layoutSpan">
                  <el-card shadow="hover" body-style="padding: 2px" style="margin-right: 10px;margin-bottom: 10px">
                    <div slot="header" class="clearfix" style="height: 15px">
                      <span> <el-tag> {{ xterm }}</el-tag></span>
                      <el-tooltip class="item" effect="light" content="退出" placement="top-start">
                        <el-button style="float: right; padding: 3px 0" type="text" @click="handlerLogout(xterm)">
                          Logout
                        </el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="light" content="复制会话" placement="top-start">
                        <el-button style="float: right; padding: 3px 0;margin-right: 20px" type="text"
                                   @click="handlerDuplicateSession(xterm)">Duplicate
                        </el-button>
                      </el-tooltip>
                    </div>
                    <!--                    style="border-right:2px solid #e0e0e0; border-left:2px solid #e0e0e0; border-bottom:2px solid #e0e0e0; border-top:1px solid #e0e0e0;margin-top:10px;margin-left: 10px"-->
                    <div :id="xterm" class="xterm">
                    </div>
                  </el-card>
                </el-col>
              </template>
            </div>
          </el-row>
        </el-col>
      </el-row>
      <DocDialog ref="docDialog" :formStatus="formDocStatus"></DocDialog>
    </template>
  </d2-container>
</template>

<script>
  import util from '@/libs/util'
  // Component
  // Component
  import DocDialog from '@/components/opscloud/dialog/DocDialog.vue'
  import ServerTree from '@/components/opscloud/tree/ServerTree'
  // X-Terminal
  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  import { queryUserDocByType } from '@api/doc/doc.js'

  export default {
    props: {
      socketURI: {
        type: String,
        default: process.env.VUE_APP_WS_API + 'ws/xterm'
        //  default: 'ws://127.0.0.1:8080/oc3/ws/xterm'
      }
    },
    data () {
      return {
        formDocStatus: {
          visible: false
        },
        // 页面状态0 选择   1 登录状态
        pageStatus: 0,
        xtermSpan: 16,
        loginStyle: {
          marginLeft: '5px'
        },
        title: 'Web-XTerminal',
        uuid: '',
        options: {
          stripe: true
        },
        layoutMode: 0,
        layoutSpan: 12,
        layoutModeOptions: [
          {
            value: 0,
            label: '双列布局'
          }, {
            value: 1,
            label: '单列布局'
          }
        ],
        loginUserType: 0,
        loginUserTypeOptions: [
          {
            value: 0,
            label: '普通用户'
          }, {
            value: 1,
            label: '系统管理员'
          }
        ],
        xterms: [],
        xtermMap: {},
        xtermWidth: 0,
        xtermHeight: 308,
        isBatch: false,
        handlerBatchType: '',
        timer: null // 心跳定时器
      }
    },
    mounted () {
    },
    beforeDestroy () {
      try {
        this.socket.close()
        for (let instanceId in this.xtermMap) {
          this.xtermMap[instanceId].dispose()
        }
      } catch (e) {
      }
      clearInterval(this.timer)
    },
    components: {
      ServerTree,
      DocDialog
    },
    methods: {
      setTimer () {
        if (this.timer == null) {
          this.timer = setInterval(() => {
            this.handlerSSHHeartbeat()
            // console.log('开始定时...每10秒执行一次')
          }, 10000)
        }
      },
      // SSH send NO-OP
      handlerSSHHeartbeat () {
        let heartbeat = {
          status: 'HEARTBEAT'
        }
        try {
          this.socketOnSend(JSON.stringify(heartbeat))
        } catch (e) {
        }
      },
      handlerPreviewUserDoc () {
        queryUserDocByType(1)
          .then(res => {
            // 返回数据
            this.formDocStatus.visible = true
            this.$refs.docDialog.initData(res.body)
          })
      },
      initTermInstance (hostname) {
        let _this = this
        // console.log(hostname)
        let id = hostname
        this.xtermWidth = document.getElementById(id).clientWidth
        //  let cols = Math.floor(this.xtermWidth / 7.2981)
        const term = new Terminal({
          rendererType: 'canvas', // 渲染类型
          allowTransparency: true,
          fontSize: 11,
          // cols: cols,
          rows: 21,
          // theme: 'default',
          theme: {
            foreground: 'white', // 字体
            background: '#5b5d66', // 背景色
            cursor: 'help'// 设置光标
          },
          termName: 'xterm',
          //  geometry: [cols, 21],
          visualBell: false,
          popOnBell: false,
          scrollback: 1000,
          screenKeys: false,
          debug: false,
          cancelEvents: false,
          cursorStyle: 'underline', // 光标样式
          cursorBlink: true, // 光标闪烁
          convertEol: true // 启用时，光标将设置为下一行的开头
        })
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(document.getElementById(id))
        // 获取对象的高度和宽度
        fitAddon.fit()
        term.focus()
        term.onData(function (cmd) {
          // console.log(cmd)
          var commond = {
            data: cmd,
            status: 'COMMAND',
            instanceId: id
          }
          _this.socketOnSend(JSON.stringify(commond))
        })
        this.xtermMap[id] = term
      },
      handlerResize () {
        if (this.layoutMode === 0) {
          this.layoutSpan = 12
        } else {
          this.layoutSpan = 24
        }
        this.$nextTick(() => {
          for (let instanceId in this.xtermMap) {
            let xtermWidth = document.getElementById(instanceId).scrollWidth
            let xtermHeight = document.getElementById(instanceId).scrollHeight
            // let cols = Math.floor(this.xtermWidth / 7.2981)
            // let rows = Math.floor(this.xtermHeight / 14.4166)
            // this.xtermMap[instanceId].geometry = [cols, rows]
            let xtermResize = {
              status: 'RESIZE',
              instanceId: instanceId,
              xtermWidth: xtermWidth,
              xtermHeight: xtermHeight
            }
            this.socketOnSend(JSON.stringify(xtermResize))
            // console.log(this.xtermMap[instanceId])
            // this.xtermMap[instanceId].dispose()
            this.xtermMap[instanceId]._addonManager._addons[0].instance.dispose()
            // 获取对象的高度和宽度
            let fitAddon = new FitAddon()
            this.xtermMap[instanceId].loadAddon(fitAddon)
            // this.xtermMap[instanceId].activate()
            try {
              fitAddon.fit()
            } catch (e) {
            }
            this.xtermMap[instanceId].focus()
            // this.xtermMap[instanceId].onResize(cols, rows)
            // 滚动到底部
            this.xtermMap[instanceId].scrollToBottom()
          }
        })
      },
      handlerBatchCmd () {
        this.isBatch = !this.isBatch
        if (this.isBatch) {
          this.handlerBatchType = 'success'
        } else {
          this.handlerBatchType = ''
        }
        var batchCommand = {
          status: 'BATCH_COMMAND',
          isBatch: this.isBatch
        }
        this.socketOnSend(JSON.stringify(batchCommand))
        // let _this = this
        // document.onkeydown = function (e) {
        //   // 事件对象兼容
        //   let e1 = e || event || window.event
        //   // console.log(e1)
        //   for (var i = 0; i < _this.xterms.length; i++) {
        //     let id = _this.xterms[i]
        //     var command = {
        //       data: e1.key,
        //       keyCode: e1.keyCode,
        //       status: 'BATCH_COMMAND',
        //       // status: 'COMMAND',
        //       instanceId: id
        //     }
        //     _this.socketOnSend(JSON.stringify(command))
        //   }
        // }
      },
      getUUID () {
        var s = []
        var hexDigits = '0123456789abcdef'
        for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = '-'
        var uuid = s.join('')
        return uuid
      },
      handlerDuplicateSession (id) {
        // 计算 instanceId  源id  server-prod-1#1
        const instanceId = id.split('#')[0] + '#' + this.getUUID()

        let duplicateSession = {
          status: 'DUPLICATE_SESSION',
          duplicateInstanceId: id,
          token: util.cookies.get('token'),
          loginUserType: this.loginUserType,
          instanceId: instanceId,
          xtermWidth: this.xtermWidth,
          xtermHeight: this.xtermHeight
        }
        // console.log(duplicateSession)
        this.xterms.push(instanceId)
        this.$nextTick(() => {
          this.initTermInstance(instanceId)
          this.socketOnSend(JSON.stringify(duplicateSession))
        })
      },
      handlerLogout (id) {
        let logout = {
          status: 'LOGOUT',
          instanceId: id
        }
        this.socketOnSend(JSON.stringify(logout))
        let term = this.xtermMap[id]
        term.dispose()
        delete (this.xtermMap[id])
        for (var i = 0; i < this.xterms.length; i++) {
          let instanceId = this.xterms[i]
          if (instanceId === id) {
            this.xterms.splice(i, 1)
            break
          }
        }
      },
      handlerClose () {
        var close = {
          status: 'CLOSE'
        }
        this.socketOnSend(JSON.stringify(close))
        this.xterms = []
        this.xtermMap = {}
        this.pageStatus = 0
        this.xtermSpan = 16
        clearInterval(this.timer)
      },
      handlerTest () {
        // console.log(document.getElementById('xxxx').clientWidth)
        //  console.log(document.getElementById('xxxx').clientHeight)
      },
      handlerLogin () {
        this.pageStatus = 1
        this.xtermSpan = 24
        if (this.layoutMode === 0) {
          this.layoutSpan = 12
        } else {
          this.layoutSpan = 24
        }
        this.xtermMap = {}
        this.isBatch = false
        this.handlerBatchType = ''
        this.initSocket()
        this.setTimer()
      },
      initSocket () {
        this.socket = new WebSocket(this.socketURI)
        this.socketOnClose()
        this.socketOnOpen()
        this.socketOnError()
        this.socketOnMessage()
      },
      socketOnOpen () {
        this.socket.onopen = () => {
          // 链接成功后
          try {
            let instanceIds = this.$refs.serverTree.getCheckedKeys(true)
            let uuid = this.$refs.serverTree.getUuid()
            this.xterms = instanceIds
            this.$nextTick(() => {
              instanceIds.forEach(hostname => {
                this.initTermInstance(hostname)
              })
              let initXterm = {
                uuid: uuid,
                token: util.cookies.get('token'),
                loginUserType: this.loginUserType,
                instanceIds: instanceIds,
                status: 'INITIAL',
                xtermWidth: this.xtermWidth,
                xtermHeight: this.xtermHeight
              }
              this.socketOnSend(JSON.stringify(initXterm))
            })
          } catch (e) {
            this.$message.error('登录失败，未选择服务器或其它原因')
          }
        }
      },
      socketOnClose () {
        this.socket.onclose = () => {
          // console.log('close socket')
        }
      },
      socketOnError () {
        this.socket.onerror = () => {
          // console.log('socket 链接失败')
        }
      },
      socketOnSend (data) {
        this.socket.send(data)
      },
      socketOnMessage () {
        this.socket.onmessage = (message) => {
          let messageJson = JSON.parse(message.data)
          for (var index = 0; index < messageJson.length; index++) {
            this.xtermMap[messageJson[index].instanceId].write(messageJson[index].output)
          }
        }
      }
    }
  }
</script>
