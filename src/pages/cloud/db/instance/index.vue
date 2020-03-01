<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.queryName" placeholder="关键字查询"/>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParam.cloudDbType" clearable placeholder="云数据库类型">
              <el-option
                v-for="item in cloudDbTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="fetchData">查询</el-button>
            <el-button @click="handleSync">同步</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="tableData" style="width: 100%">
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
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="dbInstanceId" label="实例id"></el-table-column>
        <el-table-column prop="cloudDbType" label="云类型">
          <template slot-scope="scope">
            <el-tag class="filters" :type="scope.row.cloudDbType | getCloudDBTypeTagType" size="small ">{{scope.row.cloudDbType | getCloudDBTypeTagText}}</el-tag>
          </template>
        </el-table-column>
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
            <el-button type="primary" plain size="mini" @click="addItem(scope.row)">导入
            </el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
<!--      <el-dialog :title="dialogForm.operationType ? dialogForm.addTitle : dialogForm.updateTitle"-->
<!--                 :visible.sync="dialogForm.visible">-->
<!--        <el-form :model="form">-->
<!--          <el-form-item label="资源组" :label-width="formLabelWidth">-->
<!--            <el-select v-model="form.group" filterable clearable-->
<!--                       remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading">-->
<!--              <el-option-->
<!--                v-for="item in groupOptions"-->
<!--                :key="item.id"-->
<!--                :label="item.groupCode"-->
<!--                :value="item">-->
<!--              </el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <el-form :model="form">-->
<!--          <el-form-item label="资源路径" :label-width="formLabelWidth">-->
<!--            <el-input v-model="form.resourceName" placeholder="请输入内容"></el-input>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <el-form :model="form">-->
<!--          <el-form-item label="鉴权" :label-width="formLabelWidth">-->
<!--            <el-select v-model="form.needAuth" placeholder="是否鉴权">-->
<!--              <el-option-->
<!--                v-for="item in needAuthOptions"-->
<!--                :key="item.value"-->
<!--                :label="item.label"-->
<!--                :value="item.value">-->
<!--              </el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <el-form :model="form">-->
<!--          <el-form-item label="描述" :label-width="formLabelWidth">-->
<!--            <el-input v-model="form.comment" placeholder="请输入内容"></el-input>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <div slot="footer" class="dialog-footer">-->
<!--          <el-button @click="dialogForm.visible = false">取消</el-button>-->
<!--          <el-button type="primary" @click="saveInfo">确定</el-button>-->
<!--        </div>-->
<!--      </el-dialog>-->
    </template>
  </d2-container>
</template>

<script>
  // Filters
  import { getCloudDBTypeTagType, getCloudDBTypeTagText } from '@/filters/cloud.js'
  // API
  import { fuzzyQueryCloudDBPage, deleteCloudDBById, syncCloudDB } from '@api/cloud/cloud.db.js'

  export default {
    data () {
      return {
        form: {
          group: '',
          id: '',
          groupId: '',
          resourceName: '',
          comment: '',
          needAuth: 1
        },
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
        title: '云数据库实例管理',
        showCpuColumn: true,
        showMemoryColumn: true
      }
    },
    mounted () {
      this.fetchData()
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
      addItem () {
        this.dialogForm.operationType = true
        this.dialogForm.visible = true
        this.form = {
          id: '',
          groupId: '',
          resourceName: '',
          comment: '',
          needAuth: 1
        }
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
