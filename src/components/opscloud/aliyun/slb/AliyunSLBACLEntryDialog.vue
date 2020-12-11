<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="50%">
    <el-table :data="AclEntryData" style="width: 100%">
      <el-table-column prop="slbAclEntryIp" label="条目IP"></el-table-column>
      <el-table-column prop="slbAclEntryComment" label="条目备注"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      title: 'SLB访问控制详情',
      AclEntryData: [],
      options: {
        stripe: true
      }
    }
  },
  filters: {},
  name: 'AliyunSLBACLEntryDialog',
  props: ['formStatus'],
  methods: {
    initData (aclEntryData) {
      this.AclEntryData = aclEntryData
    }
  }
}
</script>
