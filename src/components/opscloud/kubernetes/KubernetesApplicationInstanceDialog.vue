<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible">
    <el-form :model="kubernetesApplicationInstance">
      <el-form-item label="应用名称" :label-width="labelWidth" :required="true">
        <el-input v-model="kubernetesApplication.name" placeholder="请输入内容" readonly></el-input>
      </el-form-item>
      <el-form-item label="环境" :label-width="labelWidth" :required="true">
        <el-select v-model="kubernetesApplicationInstance.envType" clearable placeholder="环境"
                   @change="handlerSelEnvType">
          <el-option
            v-for="item in envTypeOptions"
            :key="item.id"
            :label="item.envName"
            :value="item.envType">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="环境标签" :label-width="labelWidth" :required="true">
        <el-select v-model="kubernetesApplicationInstance.envLabel" clearable placeholder="环境标签"
                   :disabled="kubernetesApplicationInstance.envType == ''">
          <el-option
            v-for="item in envLabelOptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" :label-width="labelWidth">
        <el-input v-model="kubernetesApplicationInstance.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button size="mini" type="primary" @click="handlerSave">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // API
  import { queryEnvPage } from '@api/env/env.js'
  import {
    addKubernetesApplicationInstance, updateKubernetesApplicationInstance, queryKubernetesApplicationInstanceLable
  } from '@api/kubernetes/kubernetes.application.instance.js'

  export default {
    data () {
      return {
        kubernetesApplication: {},
        kubernetesApplicationInstance: {},
        labelWidth: '100px',
        options: {
          stripe: true
        },
        envTypeOptions: [],
        envLabelOptions: []
      }
    },
    name: 'KubernetesApplicationInstanceDialog',
    props: ['formStatus'],
    components: {},
    mounted () {
      this.getEnvType()
    },
    methods: {
      getEnvType () {
        queryEnvPage('', '', 1, 20)
          .then(res => {
            this.envTypeOptions = res.body.data
          })
      },
      handlerSelEnvType () {
        this.kubernetesApplicationInstance.envLabel = ''
        this.getEnvLabel()
      },
      getEnvLabel () {
        if (this.kubernetesApplicationInstance.envType === null) return
        if (this.kubernetesApplicationInstance.envType === '') return
        queryKubernetesApplicationInstanceLable(this.kubernetesApplicationInstance.envType)
          .then(res => {
            this.envLabelOptions = res.body
          })
      },
      handlerCloseDialog () {
        this.formStatus.visible = false
        this.$emit('closeDialog')
      },
      initData (kubernetesApplication, kubernetesApplicationInstance) {
        this.kubernetesApplication = kubernetesApplication
        this.kubernetesApplicationInstance = kubernetesApplicationInstance
      },
      handlerSave () {
        setTimeout(() => {
          let requestBody = Object.assign({}, this.kubernetesApplicationInstance)
          if (this.formStatus.operationType) {
            addKubernetesApplicationInstance(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerCloseDialog()
              })
          } else {
            updateKubernetesApplicationInstance(requestBody)
              .then(res => {
                // 返回数据
                this.$message({
                  message: '成功',
                  type: 'success'
                })
                this.handlerCloseDialog()
              })
          }
        }, 600)
      }
    }
  }
</script>
