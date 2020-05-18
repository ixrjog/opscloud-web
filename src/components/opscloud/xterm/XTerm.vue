<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" @close='handlerExit'>
    <div v-for="xterm in xterms" :key="xterm">
      <template>
        <el-col :span="24">
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
                           @click="handlerDuplicateSession()">Duplicate
                </el-button>
              </el-tooltip>
            </div>
            <div :id="xterm" class="xterm">
            </div>
          </el-card>
        </el-col>
      </template>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handlerExit">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import util from '@/libs/util'
  // X-Terminal
  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  const xtermUrl = 'ws/xterm'

  export default {
    data () {
      return {
        title: 'Web-XTerminal',
        socketURI: '',
        server: {},
        // 插件容器
        addonMap: [],
        // XTerm
        xterms: [],
        xtermMap: {},
        timer: null // 心跳定时器
      }
    },
    name: 'XTerm',
    props: ['formStatus'],
    mixins: [],
    mounted () {
      this.initWebSocketURL()
    },
    beforeDestroy () {
      try {
        this.socket.close()
        for (let instanceId in this.xtermMap) {
          this.xtermMap[instanceId].dispose()
        }
      } catch (e) {
      }
      clearInterval(this.timer) // 销毁定时器
    },
    methods: {
      handlerExit () {
        this.handlerClose()
        try {
          this.socket.close()
          for (let instanceId in this.xtermMap) {
            this.xtermMap[instanceId].dispose()
          }
        } catch (e) {
        }
        this.formStatus.visible = false
      },
      initData (server) {
        this.server = server
        this.handlerLogin()
      },
      initWebSocketURL () {
        if (process.env.NODE_ENV === 'development') {
          this.socketURI = process.env.VUE_APP_WS_API + xtermUrl
        } else {
          let host = window.location.host
          let httpProtocol = window.location.href.split('://')[0]
          const socketURI = (httpProtocol === 'http' ? 'ws' : 'wss') + '://' + host + '/oc3/' + xtermUrl
          this.socketURI = socketURI
        }
      },
      setTimer () {
        if (this.timer == null) {
          this.timer = setInterval(() => {
            this.handlerSSHHeartbeat()
            // console.log('开始定时...每10秒执行一次')
          }, 10000)
        }
      },
      /**
       * 发送空心跳 避免阿里云SLB会话断开
       */
      handlerSSHHeartbeat () {
        let heartbeat = {
          status: 'HEARTBEAT'
        }
        try {
          this.socketOnSend(JSON.stringify(heartbeat))
        } catch (e) {
        }
      },
      initTermInstance (server) {
        let _this = this
        let id = server.name
        const term = new Terminal({
          rendererType: 'canvas', // 渲染类型
          allowTransparency: true,
          fontSize: 11,
          // theme: 'default',
          theme: {
            foreground: 'white', // 字体
            background: '#5b5d66', // 背景色
            cursor: 'help'// 设置光标
          },
          termName: 'xterm',
          visualBell: false,
          popOnBell: false,
          scrollback: 1000, // 最大滚动行数
          screenKeys: false,
          debug: false,
          cancelEvents: false,
          cursorStyle: 'underline', // 光标样式
          cursorBlink: true, // 光标闪烁
          convertEol: true // 启用时，光标将设置为下一行的开头
        })
        _this.addonMap[id] = new FitAddon()
        term.loadAddon(_this.addonMap[id])
        term.open(document.getElementById(id))
        // 获取对象的高度和宽度
        _this.addonMap[id].fit()
        term.focus()
        term.onData(function (cmd) {
          let commond = {
            data: cmd,
            status: 'COMMAND',
            instanceId: id
          }
          _this.socketOnSend(JSON.stringify(commond))
        })
        this.xtermMap[id] = term
      },
      /**
       * 后端调整体型
       */
      handlerResize () {
        for (let instanceId in this.xtermMap) {
          // 获取对象的高度和宽度
          this.addonMap[instanceId].fit()
          let xtermResize = {
            status: 'RESIZE',
            instanceId: instanceId,
            xtermWidth: this.addonMap[instanceId]._terminal.cols * 7, // 边界扣除
            xtermHeight: document.getElementById(instanceId).clientHeight
          }
          this.socketOnSend(JSON.stringify(xtermResize))
          // 滚动到底部
          this.xtermMap[instanceId].scrollToBottom()
        }
      },
      /**
       * 获取一个uuid
       * 用于会话复制后的重命名
       * @returns {string}
       */
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
      /**
       * 复制会话，重开一个终端（支持变更用户类型）
       * @param id
       */
      handlerDuplicateSession () {
        // 计算 instanceId  源id  server-prod-1#1
        const instanceId = this.server.name + '#' + this.getUUID()

        let duplicateSession = {
          status: 'DUPLICATE_SESSION_IP',
          duplicateInstanceId: this.server.name,
          token: util.cookies.get('token'),
          instanceId: instanceId,
          xtermWidth: this.addonMap[instanceId.split('#')[0]]._terminal.cols * 7,
          xtermHeight: document.getElementById(instanceId.split('#')[0]).clientHeight
        }
        // console.log(duplicateSession)
        this.xterms.push(instanceId)
        let server = {
          name: instanceId,
          ip: this.server.privateIp
        }
        this.$nextTick(() => {
          this.initTermInstance(server)
          this.socketOnSend(JSON.stringify(duplicateSession))
        })
      },
      /**
       * 单个终端退出
       * @param id
       */
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
        this.$message.warning(id + '终端已关闭')
      },
      handlerClose () {
        var close = {
          status: 'CLOSE'
        }
        this.socketOnSend(JSON.stringify(close))
        this.xterms = []
        this.xtermMap = {}
        clearInterval(this.timer)
      },
      /**
       * 批量登录
       */
      handlerLogin () {
        this.xtermMap = {}
        this.initSocket()
        this.setTimer()
      },
      /**
       * WS初始化
       */
      initSocket () {
        this.socket = new WebSocket(this.socketURI)
        this.socketOnClose()
        this.socketOnOpen()
        this.socketOnError()
        this.socketOnMessage()
      },
      socketOnOpen () {
        this.socket.onopen = () => { // 链接成功后
          try {
            this.xterms = []
            this.xterms.push(this.server.name)
            this.$nextTick(() => { // 需要延迟执行
              this.initTermInstance(this.server)
              let initXterm = {
                token: util.cookies.get('token'),
                instanceId: this.server.name,
                ip: this.server.privateIp,
                status: 'INITIAL_IP',
                xtermWidth: 0,
                xtermHeight: 308
              }
              this.socketOnSend(JSON.stringify(initXterm))
              this.$nextTick(() => {
                this.handlerResize()
              })
            })
          } catch (e) {
            this.$message.error('登录失败，未选择服务器或其它原因')
          }
        }
      },
      socketOnClose () {
        this.socket.onclose = () => {
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
