<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-col>
        <el-tabs tab-position="top" style="height: 200px;">
          <el-tab-pane label="使用帮助">
            <d2-markdown :source="dubboResolveDoc.previewDoc" v-if="success"/>
            <d2-highlight :code="dubboResolveDoc.previewDoc" v-show="false" lang="sh" style="margin-top: 5px"/>
          </el-tab-pane>
          <el-tab-pane label="配置详情">
            <el-row :gutter="24" style="margin-bottom: 5px;margin-left: 10px">
              <el-button @click="handlerRefreshDev" class="button" :loading="btnRefreshDevLoding">重新扫描并生成dev配置</el-button>
              <el-button @click="handlerRefreshDaily" :loading="btnRefreshDailyLoding" class="button">重新扫描并生成daily配置</el-button>
              <el-divider></el-divider>
              <d2-markdown :source="dubboResolvePreviewDoc.previewDoc" v-if="previewSuccess"/>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </template>
  </d2-container>
</template>

<script>
  // Component

  import { queryDocByKey } from '@api/doc/doc.js'

  import { refreshDubboMappingByEnv } from '@api/dubbo/dubbo.mapping.js'

  // import doc from '@/static/md/jump.jumpserver.settings.md'

  export default {
    data () {
      return {
        title: 'Dubbo直连配置',
        dubboResolveDocKey: 'DUBBO_RESOLVE',
        dubboResolveDoc: {},
        dubboResolvePreviewDocKey: 'DUBBO_RESOLVE_PREVIEW',
        dubboResolvePreviewDoc: {},
        btnRefreshDevLoding: false,
        btnRefreshDailyLoding: false,
        success: false,
        previewSuccess: false
      }
    },
    mounted () {
      this.handlerFeatchDoc()
      this.handlerFeatchPreviewDoc()
    },
    filters: {},
    methods: {
      handlerFeatchDoc () {
        queryDocByKey(this.dubboResolveDocKey)
          .then(res => {
            this.dubboResolveDoc = res.body
            this.success = true
          })
      },
      handlerFeatchPreviewDoc () {
        queryDocByKey(this.dubboResolvePreviewDocKey)
          .then(res => {
            this.dubboResolvePreviewDoc = res.body
            this.previewSuccess = true
          })
      },
      handlerRefreshDev () {
        this.btnRefreshDevLoding = true
        refreshDubboMappingByEnv('dev')
          .then(res => {
            this.$message({
              message: '后台任务之中！',
              type: 'success'
            })
            this.btnRefreshDevLoding = false
          })
      },
      handlerRefreshDaily () {
        this.btnRefreshDailyLoding = true
        refreshDubboMappingByEnv('daily')
          .then(res => {
            this.$message({
              message: '后台任务之中！',
              type: 'success'
            })
            this.btnRefreshDailyLoding = false
          })
      }
    }
  }
</script>

<style scoped>
</style>
