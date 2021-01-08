<template>
  <el-card shadow="never">
    <div slot="header" style="height: 5px">
      <span>{{ title }}</span>
    </div>
    <div>
      <d2-markdown v-if="content !== '' && content !==  null" :source="content"></d2-markdown>
      <span v-else>未填写</span>
    </div>
  </el-card>
</template>

<script>
export default {
  props: ['title', 'content'],
  name: 'FaultInfoContentCard'
}
</script>

<style scoped>
</style>
