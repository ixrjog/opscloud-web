<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div>
        <organization-chart :datasource="ds" :pan="true" :zoom="true" direction="l2r" :style="chartStyle"></organization-chart>
      </div>
    </template>
  </d2-container>
</template>

<script>

  import OrganizationChart from 'vue-organization-chart'
  import 'vue-organization-chart/dist/orgchart.css'

  // API
  import { queryOrgChartByParentId } from '@api/org/org.js'

  export default {
    data () {
      return {
        ds: {},
        chartStyle: {
          fontFamily: 'Arial',
          height: '420px',
          border: '2px dashed #aaa',
          borderRadius: '5px',
          overflow: 'auto',
          textAlign: 'left',
          direction: '12r'
        },
        title: '技术部-组织架构',
        options: {
          'data': this.ds,
          'nodeContent': 'title',
          'direction': 'l2r',
          'pan': true
        }
      }
    },
    mounted () {
      this.fetchOrgChartData()
    },
    components: {
      OrganizationChart
    },
    methods: {
      fetchOrgChartData () {
        queryOrgChartByParentId(9)
          .then(res => {
            this.ds = res.body
          })
      }
    }
  }
</script>

<style>
</style>
