<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="24">
      <el-input v-model="queryParam.serverName" placeholder="服务器名称" class="input"/>
      <el-input v-model="queryParam.queryIp" placeholder="ip" class="input"/>
      <el-select v-model="queryParam.chargeType" clearable placeholder="付费类型" class="search">
        <el-option
          v-for="item in chargeTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="queryParam.renewalStatus" clearable placeholder="续费类型" class="search">
        <el-option
          v-for="item in renewalStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="queryParam.serverStatus" clearable placeholder="状态" class="search">
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" class="button">查询</el-button>
      <el-button @click="handleSync" class="button" :loading="syncLoading">同步</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="实例id">
              <span>{{ props.row.instanceId }}</span>
            </el-form-item>
            <el-form-item label="服务器名称">
              <span>{{ props.row.serverName }}</span>
            </el-form-item>
            <el-form-item label="实例类型">
              <span>{{ props.row.instanceType }}</span>
            </el-form-item>
            <el-form-item v-if="props.row.vpcId != null && props.row.vpcId != ''" label="vpcId">
              <span>{{ props.row.vpcId }}</span>
            </el-form-item>
            <el-form-item label="镜像id">
              <span>{{ props.row.imageId }}</span>
            </el-form-item>
            <el-form-item label="系统盘容量(GiB)">
              <span>{{ props.row.systemDiskSize }}</span>
            </el-form-item>
            <el-form-item v-if="props.row.dataDiskSize != null && props.row.dataDiskSize != 0" label="数据盘容量(GiB)">
              <span>{{ props.row.dataDiskSize }}</span>
            </el-form-item>
            <el-form-item label="自动续费状态">
              <span>{{ props.row.renewalStatus }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="instanceName" label="实例名"></el-table-column>
      <el-table-column prop="privateIp" label="私网ip"></el-table-column>
      <el-table-column label="付费类型" width="100">
        <template slot-scope="scope">
          <el-tag class="filters" :type="scope.row.chargeType | getChargeType" size="small ">
            {{ scope.row.chargeType | getChargeTypeText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="续费状态" width="100">
        <template slot-scope="scope">
          <el-tag class="filters" :type="scope.row.renewalStatus | getRenewalStatus" size="small ">
            {{ scope.row.renewalStatus | getRenewalStatusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="expiredTime" label="过期时间" width="150"></el-table-column>
      <el-table-column prop="expiresDays" label="到期天数" width="80"></el-table-column>
      <el-table-column prop="cpu" label="cpu" width="80"></el-table-column>
      <el-table-column prop="memory" label="内存(GiB)" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.memory | getMemoryText }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="zone" label="区"></el-table-column>
      <el-table-column prop="serverStatus" label="状态">
        <template slot-scope="scope">
          <el-tag class="filters" :type="scope.row.serverStatus | getStatusTagType" size="small ">
            {{ scope.row.serverStatus | getStatusTagText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" :loading="scope.row.syncing"
                     @click="handleSyncInstance(scope.row)">同步
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <!-- server编辑-->
    <ServerDialog :formStatus="formServerStatus" ref="serverDialog" @closeServerDialog="fetchData"></ServerDialog>
  </div>
</template>

<script>
  // Component
  import ServerDialog from '@/components/opscloud/dialog/ServerDialog'
  // Filters
  import {
    getStatusTagType, getStatusTagText, getMemoryText, getChargeType, getChargeTypeText,
    getRenewalStatus, getRenewalStatusText
  } from '@/filters/server.js'
  // API
  import {
    queryCloudServerChargePage, syncCloudServerByKey, syncCloudServerById
  } from '@api/cloud/cloud.server.js'
  import { mapActions, mapState } from 'vuex'

  const chargeTypeOptions = [{
    value: 'PrePaid',
    label: '包年包月'
  }, {
    value: 'PostPaid',
    label: '按量付费'
  }]

  const renewalStatusOptions = [{
    value: 'AutoRenewal',
    label: '自动续费'
  }, {
    value: 'Normal',
    label: '手动续费'
  }, {
    value: 'NotRenewal',
    label: '不再续费'
  }]

  const statusOptions = [{
    value: 0,
    label: '新建(未录入)'
  }, {
    value: 1,
    label: '已录入'
  }, {
    value: 2,
    label: '标记删除'
  }, {
    value: 3,
    label: '服务器表未删除但云服务器已销毁'
  }]

  export default {
    data () {
      return {
        formServerStatus: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增服务器配置',
          updateTitle: '更新服务器配置'
        },
        tableData: [],
        options: {
          stripe: true
        },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          serverName: '',
          chargeType: '',
          renewalStatus: '',
          queryIp: '',
          serverStatus: ''
        },
        statusOptions: statusOptions,
        chargeTypeOptions: chargeTypeOptions,
        renewalStatusOptions: renewalStatusOptions,
        syncLoading: false
      }
    },
    name: 'CloudServerChargeTable',
    props: ['formStatus'],
    mounted () {
      this.initPageSize()
      this.fetchData()
    },
    computed: {
      ...mapState('d2admin/user', [
        'info'
      ])
    },
    components: {
      ServerDialog
    },
    filters: {
      getStatusTagType,
      getStatusTagText,
      getMemoryText,
      getChargeType,
      getChargeTypeText,
      getRenewalStatus,
      getRenewalStatusText
    },
    methods: {
      ...mapActions({
        setPageSize: 'd2admin/user/set'
      }),
      handleSizeChange (size) {
        this.pagination.pageSize = size
        this.info.pageSize = size
        this.setPageSize(this.info)
        this.fetchData()
      },
      initPageSize () {
        if (typeof (this.info.pageSize) !== 'undefined') {
          this.pagination.pageSize = this.info.pageSize
        }
      },
      getPowerStatus (value) {
        switch (value) {
          case 0:
            return 'STOPPED'
          case 1:
            return 'RUNNING'
          case 2:
            return 'STARTING'
          case 3:
            return 'STOPPING'
          case 4:
            return 'PENDING'
          case -1:
            return 'UNKNOWN'
          default:
            return 'UNKNOWN'
        }
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        let requestBody = Object.assign({}, this.queryParam)
        requestBody.extend = 1
        requestBody.page = this.pagination.currentPage
        requestBody.length = this.pagination.pageSize
        queryCloudServerChargePage(requestBody)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      },
      handleSyncInstance (row) {
        row.syncing = true
        syncCloudServerById(row.id)
          .then(res => {
            this.$message({
              message: '数据同步成功',
              type: 'success'
            })
            this.fetchData()
          })
      },
      handleSync () {
        this.syncLoading = true
        setTimeout(() => {
          syncCloudServerByKey(this.formStatus.cloudServerKey)
            .then(res => {
              this.$message({
                message: '后台同步数据中',
                type: 'success'
              })
              this.fetchData()
              this.syncLoading = false
            })
        }, 300)
      }
    }
  }
</script>

<style scoped>
  .table-expand {
    font-size: 0;
  }

  .table-expand label {
    width: 150px;
    color: #99a9bf;
  }

  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

  .input {
    display: inline-block;
    max-width: 200px;
    margin-right: 5px;
  }

  .search {
    margin-right: 5px;
  }

  .button {
    margin-left: 5px;
  }
</style>
