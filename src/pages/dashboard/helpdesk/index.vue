<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-row :gutter="24">
        <el-col :span="8">
          <help-desk-type-report></help-desk-type-report>
        </el-col>
        <el-col :span="16">
          <help-desk-report></help-desk-report>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

  // Component
  import helpDeskReport from '@/components/opscloud/dashboard/HelpDeskReport'
  import helpDeskTypeReport from '@/components/opscloud/dashboard/HelpDeskTypeReport'

  export default {
    name: 'HelpDeskReport',
    data() {
      return {
        title: 'HelpDesk表报'
      }
    },
    computed: {},
    mounted() {
    },
    components: {
      helpDeskReport,
      helpDeskTypeReport
    },
    methods: {}
  }
</script>

<style>
  .el-row {
    margin-left: 0px;
    margin-bottom: 5px;

  &
  :last-child {
  }

  }
</style>
