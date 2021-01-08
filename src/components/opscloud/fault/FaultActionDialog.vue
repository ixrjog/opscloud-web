<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible">
    <el-table :data="todoAction" style="width: 100%">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="faultAction" label="Action"></el-table-column>
      <el-table-column label="跟进人" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.followUser.displayName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="90"></el-table-column>
      <el-table-column label="状态" width="70">
        <template slot-scope="scope">
          <el-tag :type="getActionStatusColor(scope.row.actionStatus)">
            {{ scope.row.actionStatus | actionStatusFilters }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-select v-model="actionUpdateStatus" placeholder="更新状态" @change="updateAction(scope.row)">
            <el-option v-for="item in actionStatusOptions"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { queryFaultInfo, updateFaultAction } from '@api/fault/fault.info'

export default {
  data () {
    return {
      title: '更新Action',
      todoAction: [],
      actionUpdateStatus: '',
      actionStatusOptions: [{
        value: 0,
        label: '完成'
      }, {
        value: 1,
        label: '待完成'
      }, {
        value: 2,
        label: '关闭'
      }]
    }
  },
  name: 'FaultActionDialog',
  props: ['formStatus'],
  filters: {
    actionStatusFilters (actionStatus) {
      if (actionStatus === 0) {
        return '完成'
      }
      if (actionStatus === 1) {
        return '待完成'
      }
      if (actionStatus === 2) {
        return '关闭'
      }
    }
  },
  methods: {
    initData (faultId) {
      queryFaultInfo(faultId)
        .then(res => {
          this.todoAction = res.body.todoAction
        })
    },
    getActionStatusColor (actionStatus) {
      if (actionStatus === 0) {
        return 'success'
      }
      if (actionStatus === 1) {
        return 'danger'
      }
      if (actionStatus === 2) {
        return 'info'
      }
    },
    updateAction (row) {
      if (this.actionUpdateStatus === '') {
        this.$message.warning('状态错误')
        return
      }
      row.actionStatus = this.actionUpdateStatus
      updateFaultAction(row)
        .then(res => {
          this.$message.success('更新故障Action成功')
          this.actionUpdateStatus = ''
        })
    }
  }
}
</script>

<style scoped>

</style>
