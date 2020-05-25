<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" :before-close="handlerCloseDialog">
<!--    <el-form-item label="路径" :label-width="labelWidth">-->
<!--      <el-input v-model="sessionInstance.auditLog.path"></el-input>-->
<!--    </el-form-item>-->
    <el-col :span="24">
      <el-card shadow="hover" body-style="padding: 2px" style="margin-right: 10px;margin-bottom: 10px">
        <div slot="header" class="clearfix" style="height: 15px">
          <span><el-tag>{{sessionInstance.instanceId}}</el-tag></span>
        </div>
        <div id="auditXterm" class="xterm"></div>
      </el-card>
    </el-col>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handlerCloseDialog">关闭</el-button>
      <!--      <el-button size="mini" @click="ok">ok</el-button>-->
    </div>
  </el-dialog>
</template>

<script>

  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  import { querySessionInstanceById } from '@api/term/term.session.js'

  export default {
    data () {
      return {
        title: '审计日志',
        xterm: 'auditXterm',
        term: null,
        sessionInstance: '',
        labelWidth: '100px'
      }
    },
    name: 'PreviewTermAuditLogDialog',
    props: ['formStatus'],
    mixins: [],
    mounted () {
    },
    methods: {
      handlerCloseDialog () {
        this.sessionInstance = ''
        this.term.dispose()
        this.term = ''
        this.formStatus.visible = false
      },
      initData (id) {
        querySessionInstanceById(id)
          .then(res => {
            this.sessionInstance = res.body
            this.handlerAuditLog()
          })
      },
      handlerAuditLog () {
        const term = new Terminal({
          rendererType: 'canvas', // 渲染类型
          allowTransparency: true,
          fontSize: 11,
          // theme: this.xtermTheme,
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
        let fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(document.getElementById('auditXterm'))
        term.write(this.sessionInstance.auditLog.content)
        // 获取对象的高度和宽度
        fitAddon.fit()
        term.focus()
        this.term = term
      }
    }
  }
</script>
