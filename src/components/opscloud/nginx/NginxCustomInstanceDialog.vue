<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible" width="40%" @before-close="handlerClose">
    <el-form :model="instanceData" :rules="rules" label-width="130px" ref="instanceDataForm">
      <el-form-item label="配置名称" prop="instanceName">
        <div class="input">
          <el-input v-model.trim="instanceData.instanceName" :disabled="formStatus.isUpdate">
            <el-button slot="append" :icon="instanceNameCheck?'el-icon-success':'el-icon-warning'"
                       @click="handlerCheck(instanceData.instanceName)" :disabled="formStatus.isUpdate"></el-button>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item label="配置类型" prop="instanceType">
        <el-select v-model="instanceData.instanceType" placeholder="请选择" class="search">
          <el-option
            v-for="item in instanceTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="配置内容" prop="serverGroupId">
        <editor v-model="instanceData.instanceContent" @init="editorInit" lang="yaml" theme="kuroir"
                width="592" height="400"></editor>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="instanceData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handlerClose">取消</el-button>
      <el-button type="primary" size="mini" @click="saveInstanceConf">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { nginxCustomInstanceCheck, saveNginxCustomInstance } from '@api/nginx/nginx.custom'

export default {
  data () {
    return {
      instanceNameCheck: false,
      loading: false,
      title: {
        addTitle: '新增自定义配置',
        updateTitle: '变更自定义配置'
      },
      instanceData: {},
      instanceTypeOptions: [{
        value: 'server',
        label: 'server'
      }, {
        value: 'upstream',
        label: 'upstream'
      }],
      rules: {
        instanceName: [
          { required: true, message: '请填写配置名称', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请填写备注', trigger: 'blur' }
        ]
      }
    }
  },
  name: 'NginxCustomInstanceDialog',
  props: {
    formStatus: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  mounted () {
  },
  components: {
    editor: require('vue2-ace-editor')
  },
  filters: {},
  methods: {
    editorInit: function (ed) {
      require('brace/ext/language_tools')
      require('brace/mode/yaml')
      require('brace/theme/chrome')
      require('brace/theme/kuroir')
      require('brace/snippets/yaml')
    },
    handlerCheck (instanceName) {
      if (instanceName === '') {
        this.$message.error('请输入配置名称')
        return
      }
      nginxCustomInstanceCheck(instanceName)
        .then(res => {
          this.$message.success('校验通过')
          this.instanceNameCheck = true
        })
    },
    handlerClose () {
      this.formStatus.visible = false
      this.instanceNameCheck = false
    },
    initData (instanceData) {
      this.instanceData = instanceData
    },
    saveInstanceConf () {
      if (!this.formStatus.isUpdate) {
        if (!this.instanceNameCheck) {
          this.$message.warning('请先校验配置名称')
          return
        }
      }
      this.$refs.instanceDataForm.validate((valid) => {
        if (valid) {
          setTimeout(() => {
            let requestBody = {
              'instanceName': this.instanceData.instanceName,
              'instanceType': this.instanceData.instanceType,
              'instanceContent': this.instanceData.instanceContent,
              'remark': this.instanceData.remark
            }
            saveNginxCustomInstance(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerClose()
                this.$emit('closeDialog')
              })
          }, 600)
        }
      })
    }
  }
}
</script>

<style scoped>
.search {
  display: inline-block;
  max-width: 300px;
  width: 300px;
}

.input {
  display: inline-block;
  max-width: 300px;
  width: 300px;
}
</style>
