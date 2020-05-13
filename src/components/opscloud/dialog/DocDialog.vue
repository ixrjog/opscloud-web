<template>
  <el-dialog title="文档" :visible.sync="formStatus.visible">
    <el-form :model="userDoc">
<!--      <el-input v-model="userDoc.docTitle" placeholder="" disabled></el-input>-->
      <d2-markdown :source="userDoc.docContent" v-if="operationType === 0"/>
      <d2-highlight :code="userDoc.docContent" v-show="false" lang="sh" style="margin-top: 5px"/>
      <editor v-model="userDoc.docContent" @init="editorInit" theme="kuroir" lang="markdown" v-if="operationType === 1"
              height="400"></editor>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handlerEdit" v-if="operationType === 0">编辑</el-button>
      <el-button @click="handlerSave" v-if="operationType === 1">保存</el-button>
      <el-button @click="formStatus.visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import { saveUserDoc } from '@api/doc/doc.js'

  export default {
    data () {
      return {
        userDoc: '',
        // userDoc: {
        //   docTitle: '????',
        //   docContent: ''
        // },
        // 0 查看 1 编辑
        operationType: 0,
        labelWidth: '100px',
        options: {
          stripe: true
        }
      }
    },
    name: 'DocDialog',
    props: ['formStatus'],
    mounted () {
    },
    components: {
      editor: require('vue2-ace-editor')
    },
    methods: {
      editorInit: function (ed) {
        // language extension prerequsite...
        require('brace/ext/language_tools')
        // language
        require('brace/mode/yaml')
        require('brace/mode/markdown')
        require('brace/theme/chrome')
        require('brace/theme/kuroir')
        // snippet
        require('brace/snippets/markdown')
        // ed.setReadOnly(true)
      },
      initData (userDoc) {
        this.operationType = 0
        this.userDoc = userDoc
      },
      handlerEdit () {
        this.operationType = 1
      },
      handlerSave () {
        saveUserDoc(this.userDoc).then(res => {
          if (res.success) {
            this.$message({
              message: '更新成功!',
              type: 'success'
            })
            this.operationType = 0
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    }
  }
</script>
