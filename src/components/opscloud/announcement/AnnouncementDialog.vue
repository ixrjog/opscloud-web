<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="announcementData" label-width="120px">
      <el-form-item label="公告标题" required>
        <el-input v-model="announcementData.title" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="公告标题" required>
        <editor v-model="announcementData.content" @init="editorInit" lang="yaml" theme="chrome"
                width="100%" height="400"></editor>
      </el-form-item>
      <el-form-item label="公告备注">
        <el-input v-model="announcementData.remark" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { saveAnnouncement } from '@api/announcement/announcement'

const announcementData = {
  id: '',
  title: '',
  type: 1,
  content: '',
  remark: '',
  valid: true
}

export default {
  data () {
    return {
      announcementData: {}
    }
  },
  name: 'AnnouncementDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {
    editor: require('vue2-ace-editor')
  },
  methods: {
    editorInit: function () {
      require('brace/ext/language_tools')
      require('brace/mode/yaml')
      require('brace/theme/chrome')
      require('brace/snippets/yaml')
    },
    initData (data) {
      if (data.id === 0) {
        this.announcementData = Object.assign({}, announcementData)
      } else {
        this.announcementData = Object.assign({}, data)
      }
    },
    handleSave () {
      saveAnnouncement(this.announcementData)
        .then(res => {
          this.$message.success('保存成功')
          this.formStatus.visible = false
          this.$emit('closeDialog')
        })
    }
  }
}
</script>
