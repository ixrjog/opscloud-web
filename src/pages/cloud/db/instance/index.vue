<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
            <el-input v-model="queryParam.queryName" placeholder="关键字查询" style="display: inline-block; max-width:200px"/>
            <el-select v-model="queryParam.cloudDbType" clearable placeholder="云数据库类型" style="margin-left: 5px">
              <el-option
                v-for="item in cloudDbTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
            <el-button @click="handleSync" style="margin-left: 5px">同步</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="账户uid">
                <span>{{ props.row.uid }}</span>
              </el-form-item>
              <el-form-item label="账户名称">
                <span>{{ props.row.accountName }}</span>
              </el-form-item>
              <el-form-item label="实例类型">
                <span>{{ props.row.dbInstanceClass }}</span>
              </el-form-item>
              <el-form-item v-if="props.row.createdTime != null && props.row.createdTime != ''" label="实例创建时间">
                <span>{{ props.row.createdTime }}</span>
              </el-form-item>
              <el-form-item v-if="props.row.expiredTime != null && props.row.expiredTime != ''" label="实例过期时间">
                <span>{{ props.row.expiredTime }}</span>
              </el-form-item>
              <el-form-item label="连接地址">
                <span>{{ props.row.attributeMap.ConnectionString }}</span>
              </el-form-item>
              <el-form-item label="端口">
                <span>{{ props.row.attributeMap.Port }}</span>
              </el-form-item>
              <el-form-item label="实例内存(MB)">
                <span>{{ props.row.attributeMap.DBInstanceMemory }}</span>
              </el-form-item>
              <el-form-item label="最大连接数">
                <span>{{ props.row.attributeMap.MaxConnections }}</span>
              </el-form-item>
              <el-form-item label="实例存储类型">
                <span>{{ props.row.attributeMap.DBInstanceStorageType }}</span>
              </el-form-item>
              <el-form-item label="实例存储(GB)">
                <span>{{ props.row.attributeMap.DBInstanceStorage }}</span>
              </el-form-item>
              <el-form-item label="可用性">
                <span>{{ props.row.attributeMap.AvailabilityValue }}</span>
              </el-form-item>
              <el-form-item label="databases">
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in props.row.databases"
                          :key="item.id">{{ item.dbName }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="dbInstanceId" label="实例id"></el-table-column>
        <el-table-column prop="cloudDbType" label="云类型">
          <template slot-scope="scope">
            <el-tag class="filters" :type="scope.row.cloudDbType | getCloudDBTypeTagType" size="small ">{{scope.row.cloudDbType | getCloudDBTypeTagText}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="databases.length" label="databases"></el-table-column>
        <el-table-column prop="dbInstanceDescription" label="描述"></el-table-column>
        <el-table-column prop="engine" label="engine" width="100">
          <template slot-scope="scope">
            <el-tag class="filters"  size="small ">{{scope.row.engine}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="engineVersion" label="version" width="80"></el-table-column>
        <el-table-column prop="zone" label="区"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="syncDatabase(scope.row)">同步</el-button>
            <el-button type="primary" plain size="mini" @click="accountPrivilege(scope.row)">授权</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <dialogPrivilege :form="formPrivilege" :formCheckedPrivileges="privileges" :cloudDbId="cloudDbId" @closeTagDialog="fetchData"></dialogPrivilege>
    </template>
  </d2-container>
</template>

<script>

  import dialogPrivilege from './dialog.privilege'

  // Filters
  import { getCloudDBTypeTagType, getCloudDBTypeTagText } from '@/filters/cloud.js'
  // API
  import { fuzzyQueryCloudDBPage, deleteCloudDBById, syncCloudDB, syncCloudDBDatabase } from '@api/cloud/cloud.db.js'

  export default {
    data () {
      return {
        privileges: [],
        cloudDbId: '',
        formPrivilege: {
          visible: false,
          labelWidth: '80px',
          title: '数据库实例账户授权'
        },
        // form: {
        //   group: '',
        //   id: '',
        //   groupId: '',
        //   resourceName: '',
        //   comment: '',
        //   needAuth: 1
        // },
        dialogVisible: false,
        formLabelWidth: '100px',
        dialogForm: {
          visible: false,
          addTitle: '新增资源配置',
          updateTitle: '更新资源配置',
          operationType: true
        },
        tableData: [],
        options: {
          stripe: true
        },
        formOptions: {
          labelWidth: '80px',
          labelPosition: 'left',
          saveLoading: false
        },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          cloudDbType: '',
          queryName: ''
        },
        cloudDbTypeOptions: [{
          value: 2,
          label: 'Aliyun-RDS-Mysql'
        }, {
          value: 3,
          label: 'AWS-RDS-Mysql'
        }],
        title: '云数据库实例管理'
      }
    },
    mounted () {
      this.fetchData()
    },
    components: {
      dialogPrivilege
    },
    filters: {
      getCloudDBTypeTagType,
      getCloudDBTypeTagText
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCloudDBById(row.id).then(res => {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      syncDatabase (row) {
        this.loading = true
        syncCloudDBDatabase(row.id).then(res => {
          this.fetchData()
          this.loading = false
          this.$message({
            type: 'success',
            message: '同步数据库成功!'
          })
        })
      },
      accountPrivilege (row) {
        // form
        this.formPrivilege.visible = true
        // 选中项(已授权项)
        this.privileges = []
        this.cloudDbId = row.id
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        var requestBody = {
          'queryName': this.queryParam.queryName,
          'cloudDbType': this.queryParam.cloudDbType,
          'page': this.pagination.currentPage,
          'length': this.pagination.pageSize
        }
        fuzzyQueryCloudDBPage(requestBody)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      },
      handleSync () {
        setTimeout(() => {
          this.loading = true
          syncCloudDB()
            .then(res => {
              this.$message({
                message: '后台同步数据中',
                type: 'success'
              })
              this.fetchData()
            })
        }, 300)
      }
    }
  }
</script>

<style>
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
</style>
