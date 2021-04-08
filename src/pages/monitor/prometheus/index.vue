<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card shadow="never">
            <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
              <el-button @click="handlerSave" size="mini" plain :disabled="customPrometheusConfig === ''">保存</el-button>
              <el-button @click="handlerPush" size="mini" plain class="button" :loading="creating">创建</el-button>
            </el-row>
            <el-collapse v-model="activeName" @change="handleChange" accordion>
              <el-collapse-item name="1">
                <template slot="title">自定义配置文件
                  <el-tooltip effect="dark" content="自定义配置，可修改" placement="top">
                    <i class="header-icon el-icon-info"></i>
                  </el-tooltip>
                </template>
                <editor v-model="customPrometheusConfig" @init="editorInit" lang="yaml" theme="chrome"
                        height="650" v-if="customPrometheusConfig !==''"></editor>
              </el-collapse-item>
              <el-collapse-item name="2">
                <template slot="title">服务器配置文件
                  <el-tooltip effect="dark" content="根据服务器属性自动生成，不可修改" placement="top">
                    <i class="header-icon el-icon-info"></i>
                  </el-tooltip>
                </template>
                <span v-if="prometheusConfig ===''">内容加载中</span>
                <editor v-model="prometheusConfig" @init="readOnlyInit" lang="yaml" theme="kuroir" height="650"
                        v-else></editor>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never">
            <el-row style="margin-bottom: 5px" :gutter="24">
              <el-select v-model="serverGroupId" filterable clearable @change="getGroupConfig" class="select"
                         remote reserve-keyword placeholder="关键词搜索服务器组" :remote-method="getServerGroup">
                <el-option
                  v-for="item in serverGroupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px;margin-left: 20px">{{
                      item.comment
                    }}</span>
                </el-option>
              </el-select>
            </el-row>
            <el-collapse v-model="groupConfigActiveName">
              <el-collapse-item title="config" name="1">
                <editor v-model="groupConfig" @init="readOnlyInit" lang="yaml" theme="kuroir"
                        height="120" v-if="groupConfig !==''"></editor>
              </el-collapse-item>
              <el-collapse-item title="target" name="2">
                <editor v-model="groupTarget" @init="readOnlyInit" lang="json" theme="kuroir"
                        height="500" v-if="groupTarget !==''"></editor>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
import {
  getTargetMap,
  prometheusConfigCreate,
  prometheusConfigPreview, prometheusGroupConfigPreview,
  queryPrometheusConfig,
  savePrometheusConfig
} from '@api/prometheus/prometheus'
import { queryServerGroupPage } from '@api/server/server.group'

export default {
  data () {
    return {
      creating: false,
      customPrometheusConfig: '',
      prometheusConfig: '',
      title: 'Prometheus管理',
      activeName: '',
      groupConfigActiveName: ['1', '2'],
      serverGroupOptions: [],
      groupConfig: '',
      groupTarget: '',
      serverGroupId: ''
    }
  },
  mounted () {
  },
  computed: {},
  components: {
    editor: require('vue2-ace-editor')
  },
  filters: {},
  methods: {
    readOnlyInit: function (ed) {
      require('brace/ext/language_tools')
      require('brace/mode/yaml')
      require('brace/mode/json')
      require('brace/theme/chrome')
      require('brace/theme/kuroir')
      require('brace/snippets/yaml')
      ed.setReadOnly(true)
    },
    editorInit: function () {
      require('brace/ext/language_tools')
      require('brace/mode/yaml')
      require('brace/theme/chrome')
      require('brace/theme/kuroir')
      require('brace/snippets/yaml')
    },
    previewPrometheusConfig () {
      this.prometheusConfig = ''
      prometheusConfigPreview()
        .then(res => {
          this.prometheusConfig = res.body
        })
    },
    getPrometheusConfig () {
      queryPrometheusConfig()
        .then(res => {
          this.customPrometheusConfig = res.body
        })
    },
    handleChange (activeNames) {
      if (activeNames === '1') {
        this.getPrometheusConfig()
      }
      if (activeNames === '2') {
        this.previewPrometheusConfig()
      }
    },
    getGroupConfig () {
      this.groupConfig = ''
      this.groupTarget = ''
      if (this.serverGroupId === '') {
        return
      }
      prometheusGroupConfigPreview(this.serverGroupId)
        .then(res => {
          this.groupConfig = res.body
        })
      getTargetMap(this.serverGroupId)
        .then(res => {
          this.groupTarget = res.body
        })
    },
    handlerSave () {
      this.$confirm('确定保存Prometheus自定义配置文件吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          let requestBody = {
            content: this.customPrometheusConfig
          }
          savePrometheusConfig(requestBody)
            .then(res => {
              this.$message.success('保存成功')
              this.activeName = '1'
              this.getPrometheusConfig()
            })
        })
      }).catch(() => {
        this.$message.info('已取消成功')
      })
    },
    getServerGroup (queryName) {
      queryServerGroupPage(queryName, '', 1, 20)
        .then(res => {
          this.serverGroupOptions = res.body.data
        })
    },
    handlerPush () {
      this.$confirm('确定创建Prometheus配置文件吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.creating = true
        this.$message.info('配置创建中')
        setTimeout(() => {
          prometheusConfigCreate()
            .then(res => {
              this.$message.success('配置创建成功')
              this.creating = false
            })
        }, 300)
      }).catch(() => {
        this.$message.info('已取消创建')
      })
    }
  }
}
</script>

<style scoped>
.button {
  margin-left: 5px
}

.select {
  display: inline-block;
  max-width: 200px;
  width: 200px;
  margin-left: 10px
}
</style>
