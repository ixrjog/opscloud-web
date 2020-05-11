<template>
  <d2-container>
    <template>
      <h1>{{title}}</h1>
      <div>
        <div id="xterm0" class="xterm" style="width: 45%;display: inline-block;"/>
        <div id="xterm1" class="xterm" style="width: 45%;display: inline-block; margin-left: 10px;"/>
      </div>
    </template>
  </d2-container>
</template>

<script>
  // Component
  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  export default {
    name: 'Xterm',
    props: {
      socketURI: {
        type: String,
        default: 'ws://127.0.0.1:8000/oc3/ws/xterm'
      }
    },
    data () {
      return {
        title: 'web终端',
        xtermMap: {}
      }
    },
    mounted () {
      this.initSocket()
    },
    beforeDestroy () {
      this.socket.close()
      this.term.dispose()
    },
    methods: {
      initTerm (termNum) {
        var that = this
        console.log(termNum)
        var id = 'xterm' + termNum
        const term = new Terminal({
          fontSize: 14,
          cols: 52,
          rows: 22,
          theme: 'default',
          convertEol: false,
          termName: 'xterm',
          geometry: [80, 20],
          cursorBlink: true,
          visualBell: false,
          popOnBell: false,
          scrollback: 1000,
          screenKeys: false,
          debug: false,
          cancelEvents: false
        })
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(document.getElementById(id))
        fitAddon.fit()
        term.focus()
        term.onData(function (cmd) {
          var commond = {
            data: cmd,
            status: 'SUCCESS',
            instanceId: id
          }
          that.socketOnSend(JSON.stringify(commond))
        })
        this.xtermMap[id] = term

        var initXterm = {
          instanceId: id,
          status: 'INITIAL'
        }
        this.socketOnSend(JSON.stringify(initXterm))
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
          this.initTerm(0)
          this.initTerm(1)
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
