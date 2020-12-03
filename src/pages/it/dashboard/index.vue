<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-row :gutter="24">
        <el-col :span="16">
          <it-asset-stats-report></it-asset-stats-report>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

// Component
import ItAssetStatsReport from '@/components/opscloud/it/ItAssetStatsReport'

export default {
  name: 'ItAssetReport',
  data () {
    return {
      title: '资产报表'
    }
  },
  computed: {},
  mounted () {
  },
  components: {
    ItAssetStatsReport
  },
  methods: {}
}
</script>

<style scoped>
</style>
