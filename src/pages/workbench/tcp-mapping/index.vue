<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-col>
        <el-tabs tab-position="top" style="height: 200px;">
          <el-tab-pane label="使用帮助">
            <d2-markdown :source="dubboResolveDoc.previewDoc" v-if="success"/>
            <d2-highlight :code="dubboResolveDoc.previewDoc" v-show="false" lang="sh" style="margin-top: 5px"/>
          </el-tab-pane>
          <el-tab-pane label="配置详情">
            <el-row style="margin-bottom: 5px">
              <el-button @click="handlerRefreshDev" :loading="btnRefreshDevLoading">
                重新扫描并生成dev配置
              </el-button>
              <el-button @click="handlerRefreshDaily" :loading="btnRefreshDailyLoading" class="button">
                重新扫描并生成daily配置
              </el-button>
            </el-row>
            <el-tabs type="border-card">
              <el-tab-pane v-for="(value,key) in dubboResolvePreviewDoc" :key="key" :label="key">
                <d2-markdown :source="value.previewDoc" v-if="previewSuccess"/>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </template>
  </d2-container>
</template>

<script>
import { queryDocByKey } from '@api/doc/doc.js'
import { refreshDubboMappingByEnv } from '@api/dubbo/dubbo.mapping.js'
import { queryDubboMappingByEnv } from '@api/dubbo/dubbo.mapping'

export default {
  data () {
    return {
      title: 'Dubbo直连配置',
      dubboResolveDocKey: 'DUBBO_RESOLVE',
      dubboResolveDoc: {},
      dubboResolvePreviewDoc: {},
      btnRefreshDevLoading: false,
      btnRefreshDailyLoading: false,
      success: false,
      previewSuccess: false
    }
  },
  mounted () {
    this.handlerFetchDoc()
    this.fetchData()
  },
  filters: {},
  methods: {
    handlerFetchDoc () {
      queryDocByKey(this.dubboResolveDocKey)
        .then(res => {
          this.dubboResolveDoc = res.body
          this.success = true
        })
    },
    fetchData () {
      this.previewSuccess = false
      queryDubboMappingByEnv()
        .then(res => {
          this.dubboResolvePreviewDoc = res.body
          this.previewSuccess = true
        })
    },
    handlerRefreshDev () {
      this.btnRefreshDevLoading = true
      refreshDubboMappingByEnv('dev')
        .then(res => {
          this.$message({
            message: '后台任务执行中！',
            type: 'success'
          })
          this.btnRefreshDevLoading = false
        })
    },
    handlerRefreshDaily () {
      this.btnRefreshDailyLoading = true
      refreshDubboMappingByEnv('daily')
        .then(res => {
          this.$message({
            message: '后台任务执行中！',
            type: 'success'
          })
          this.btnRefreshDailyLoading = false
        })
    }
  }
}
</script>

<style scoped>
.button {
  margin-left: 5px;
}
</style>
