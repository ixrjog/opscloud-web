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
            <el-select v-model="layoutMode" filterable reserve-keyword>
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
            <el-button @click="handlerLogin" :style="loginStyle">批量登录</el-button>
            <el-button @click="handlerClose" :style="loginStyle">全部关闭</el-button>
          </el-row>
          <el-row>
            <div v-for="xterm in xterms" :key="xterm">
              <template>
                <el-col :span="layoutSpan">
                  <el-card shadow="hover" body-style="padding: 2px" style="margin-right: 10px;margin-bottom: 10px">
                    <div slot="header" class="clearfix" style="height: 15px">
                      <span> <el-tag> {{ xterm }}</el-tag></span>
                      <el-button style="float: right; padding: 3px 0" type="text" @click="handlerLogout(xterm)">Logout
                      </el-button>
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
    </template>
  </d2-container>
</template>

<script>
  // Component
  import ServerTree from '@/components/opscloud/tree/ServerTree'
  // X-Terminal
  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  import util from '@/libs/util'

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
        xtermHeight: 308
      }
    },
    mounted () {
    },
    beforeDestroy () {
      this.socket.close()
      this.term.dispose()
    },
    components: {
      ServerTree
    },
    methods: {
      initTermInstance (hostname) {
        var that = this
        console.log(hostname)
        var id = hostname
        this.xtermWidth = document.getElementById(id).clientWidth
        let cols = Math.floor(this.xtermWidth / 7.2981)
        const term = new Terminal({
          rendererType: 'canvas', // 渲染类型
          fontSize: 11,
          cols: cols,
          rows: 21,
          // theme: 'default',
          theme: {
            foreground: 'white', // 字体
            background: '#5b5d66', // 背景色
            cursor: 'help'// 设置光标
          },
          termName: 'xterm',
          geometry: [cols, 21],
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
          var commond = {
            data: cmd,
            status: 'COMMAND',
            instanceId: id
          }
          that.socketOnSend(JSON.stringify(commond))
        })
        this.xtermMap[id] = term
      },
      handlerLogout (id) {
        var logout = {
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
      },
      handlerTest () {
        console.log(document.getElementById('xxxx').clientWidth)
        console.log(document.getElementById('xxxx').clientHeight)
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
        this.initSocket()
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
              const token = util.cookies.get('token')
              let initXterm = {
                uuid: uuid,
                token: token,
                loginUserType: 0,
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
          // this.initTerm(0)
          // this.initTerm(1)
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
          var messageJson = JSON.parse(message.data)

          for (var index = 0; index < messageJson.length; index++) {
            this.xtermMap[messageJson[index].instanceId].write(messageJson[index].output)
          }
        }
      }
    }
  }
</script>
