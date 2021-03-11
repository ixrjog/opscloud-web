<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row>
        <el-col :span="16" v-if="prometheusConfig === ''">
          <el-row style="margin-bottom: 5px" :gutter="24">
            <el-button @click="fetchData" style="margin-left: 10px" :loading="loading">查询</el-button>
            <el-button @click="handlerPush" class="button" :loading="creating">创建</el-button>
          </el-row>
          <span>配置文件查询中……</span>
        </el-col>
        <el-col :span="16" v-else>
          <editor v-model="prometheusConfig" @init="editorInit" lang="yaml" theme="kuroir" height="600"></editor>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
import { prometheusConfigCreate, prometheusConfigPreview } from '@api/prometheus/prometheus'

export default {
  data () {
    return {
      loading: false,
      creating: false,
      prometheusConfig: '',
      title: 'Prometheus管理'
    }
  },
  mounted () {
    this.fetchData()
  },
  computed: {},
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
      ed.setReadOnly(true)
    },
    fetchData () {
      this.loading = true
      this.prometheusConfig = ''
      prometheusConfigPreview()
        .then(res => {
          this.prometheusConfig = res.body
          this.loading = false
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
</style>
