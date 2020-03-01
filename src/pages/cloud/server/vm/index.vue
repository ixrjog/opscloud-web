<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-col :span="4">
            <el-input v-model="queryParam.serverName" placeholder="服务器名称"/>
          </el-col>
          <el-col :span="4">
            <el-input v-model="queryParam.queryIp" placeholder="ip"/>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParam.serverStatus" clearable placeholder="状态">
              <el-option
                v-for="item in statusOptions"
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
              <el-form-item label="付费类型">
                <span>{{ props.row.chargeType }}</span>
              </el-form-item>
              <el-form-item label="自动续费状态">
                <span>{{ props.row.renewalStatus }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="instanceName" label="实例名"></el-table-column>
        <el-table-column prop="publicIp" label="公网ip"></el-table-column>
        <el-table-column prop="privateIp" label="私网ip"></el-table-column>
        <el-table-column prop="cpu" label="cpu" width="80" v-if="showCpuColumn"></el-table-column>
        <el-table-column prop="memory" label="内存(GiB)" width="100" v-if="showCpuColumn">
          <template slot-scope="scope">
            <span>{{scope.row.memory | getMemoryText}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="zone" label="区"></el-table-column>
        <el-table-column prop="serverStatus" label="状态">
          <template slot-scope="scope">
            <el-tag class="filters" :type="scope.row.serverStatus | getStatusTagType" size="small ">{{scope.row.serverStatus | getStatusTagText}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <!--            <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth ===-->
            <!--              0 ? '鉴权' : '不鉴权'}}-->
            <!--            </el-button>-->
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
  import { getStatusTagType, getStatusTagText, getMemoryText } from '@/filters/server.js'
  // API
  import { queryCloudServerPage, syncCloudServerByKey, deleteCloudServerById } from '@api/cloud/cloud.server.js'

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
          cloudServerType: 2,
          serverName: '',
          queryIp: '',
          serverStatus: ''
        },
        statusOptions: [{
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
        }],
        cloudServerKey: 'AliyunECSCloudServer',
        title: 'Aliyun:ECS实例管理',
        showCpuColumn: true,
        showMemoryColumn: true
      }
    },
    mounted () {
      this.fetchData()
    },
    filters: {
      getStatusTagType,
      getStatusTagText,
      getMemoryText
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      // 普通的新增
      addRow () {
        this.$refs.d2Crud.showDialog({
          mode: 'add'
        })
      },
      handleRowRemove ({ index, row }, done) {
        setTimeout(() => {
          deleteCloudServerById(row.id)
            .then(res => {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.fetchData()
              done()
            })
        }, 300)
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCloudServerById(row.id).then(res => {
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
      // handleRowEdit ({ index, row }, done) {
      //   setTimeout(() => {
      //     updateCloudserver({
      //       id: row.id,
      //       roleName: row.roleName,
      //       comment: row.comment,
      //       workflow: row.workflow
      //     })
      //       .then(res => {
      //         this.$message({
      //           message: '更新成功',
      //           type: 'success'
      //         })
      //         this.fetchData()
      //         done()
      //       })
      //   }, 300)
      // },
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
        queryCloudServerPage(
          this.queryParam.cloudServerType, this.queryParam.serverName, this.queryParam.queryIp, this.queryParam.serverStatus, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      },
      handleSync () {
        setTimeout(() => {
          syncCloudServerByKey(this.cloudServerKey)
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
