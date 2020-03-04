<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <div style="margin-bottom: 5px">
            <el-input v-model="queryParam.queryName" placeholder="关键字查询" style="display: inline-block;max-width:200px"/>
            <el-select v-model="queryParam.cloudDbType" clearable placeholder="云数据库类型" style="margin-left: 5px">
              <el-option
                v-for="item in cloudDbTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="queryParam.envType" clearable placeholder="环境" style="margin-left: 5px">
              <el-option
                v-for="item in envTypeOptions"
                :key="item.id"
                :label="item.envName"
                :value="item.envType">
              </el-option>
            </el-select>
            <el-select
              v-model="queryParam.tagId" filterable clearable remote reserve-keyword
              placeholder="搜索标签" :remote-method="getTag" :loading="loading" style="margin-left: 5px">
              <el-option
                v-for="item in tagOptions"
                :key="item.id"
                :label="item.tagKey"
                :value="item.id">
              </el-option>
            </el-select>
            <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="table-expand">
              <el-form-item label="描述" v-show="props.row.dbDescription != null && props.row.dbDescription != ''">
                <span>{{ props.row.dbDescription }}</span>
              </el-form-item>
              <el-form-item label="备注" v-show="props.row.comment != null && props.row.comment != ''">
                <span>{{ props.row.comment }}</span>
              </el-form-item>
              <el-form-item label="状态">
                <span>{{ props.row.dbStatus }}</span>
              </el-form-item>
              <el-form-item label="字符集">
                <span>{{ props.row.characterSetName }}</span>
              </el-form-item>
              <el-form-item label="账户">
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
        <el-table-column prop="dbName" label="数据库名称"></el-table-column>
        <el-table-column prop="name" label="环境">
          <template slot-scope="scope">
            <el-tag disable-transitions :style="{ color: scope.row.env.color }">{{scope.row.env.envName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="engine" label="engine">
          <template slot-scope="scope">
            <el-tag class="filters"  size="small ">{{scope.row.engine}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签">
          <template slot-scope="scope">
            <div class="tag-group">
              <el-tag style="margin-left: 5px"
                      v-for="item in scope.row.tags"
                      :key="item.id"
                      :style="{ color: item.color }">
                {{ item.tagKey }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="editTag(scope.row)">标签</el-button>
            <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="paginationCurrentChange"
                     layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <dialogtag :form="formTag" :tag="tag" @closeTagDialog="fetchData"></dialogtag>
      <dialogdatabase :form="formDatabase" :database="database" @closeDatabaseDialog="fetchData"></dialogdatabase>
    </template>
  </d2-container>
</template>

<script>

  import TagDialog from '@/components/opscloud/dialog/TagDialog'
  import dialogdatabase from './dialog.database'

  // Filters
  import { getCloudDBTypeTagType, getCloudDBTypeTagText } from '@/filters/cloud.js'
  // API
  import { queryEnvPage } from '@api/env/env.js'
  import { queryBusinessTag, queryTagPage } from '@api/tag/tag.js'
  import { fuzzyQueryCloudDBDatabasePage, deleteCloudDBDatabaseById } from '@api/cloud/cloud.db.database.js'

  export default {
    data () {
      return {
        tag: {},
        formTag: {
          visible: false,
          labelWidth: '80px',
          title: '编辑标签'
        },
        database: {},
        formDatabase: {
          visible: false,
          labelWidth: '80px',
          title: '编辑数据库'
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
          queryName: '',
          envType: '',
          tagId: '',
          uid: ''
        },
        cloudDbTypeOptions: [{
          value: 2,
          label: 'Aliyun-RDS-Mysql'
        }, {
          value: 3,
          label: 'AWS-RDS-Mysql'
        }],
        envTypeOptions: [],
        tagOptions: [],
        businessType: 5,
        title: '云数据库管理'
      }
    },
    mounted () {
      this.fetchData()
      this.getEnvType()
      this.getTag('')
    },
    components: {
      TagDialog,
      dialogdatabase
    },
    filters: {
      getCloudDBTypeTagType,
      getCloudDBTypeTagText
    },
    methods: {
      getTag (tagKey) {
        queryTagPage(tagKey, 1, 100)
          .then(res => {
            this.tagOptions = res.body.data
          })
      },
      getEnvType () {
        queryEnvPage('', '', 1, 20)
          .then(res => {
            this.envTypeOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      editItem (row) {
        // form
        this.formDatabase.visible = true
        this.formDatabase.operationType = false
        // server
        this.database = Object.assign({}, row)
        this.database.envTypeOptions = this.envTypeOptions
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCloudDBDatabaseById(row.id).then(res => {
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
      editTag (row) {
        this.formTag.visible = true
        this.tag = {
          businessId: row.id,
          businessType: this.businessType,
          serverTag: [],
          tagOptions: []
        }
        queryTagPage('', 1, 100)
          .then(res => {
            this.tag.tagOptions = res.body.data
          })
        queryBusinessTag(this.businessType, this.tag.businessId, '')
          .then(res => {
            this.tag.serverTag = []
            for (var index = 0; index < res.body.length; index++) {
              this.tag.serverTag.push(res.body[index].id)
            }
          })
        this.formTag.visible = true
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
          'uid': this.queryParam.uid,
          'extend': 1,
          'envType': this.queryParam.envType,
          'tagId': this.queryParam.tagId,
          'page': this.pagination.currentPage,
          'length': this.pagination.pageSize
        }
        fuzzyQueryCloudDBDatabasePage(requestBody)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
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
