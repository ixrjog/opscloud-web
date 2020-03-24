<template>
  <div>
    <el-input v-model="queryParam.queryName" placeholder="关键字查询" style="display: inline-block; max-width:200px"/>
    <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
    <el-button @click="addItem" style="margin-left: 5px">新增</el-button>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="账户uid">
              <span>{{ props.row.uid }}</span>
            </el-form-item>
            <el-form-item label="cidrBlock">
              <span>{{ props.row.cidrBlock }}</span>
            </el-form-item>
            <el-form-item label="描述">
              <span>{{ props.row.description }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ props.row.creationTime }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="templateName" label="模版名称"></el-table-column>
      <el-table-column prop="regionId" label="regionId"></el-table-column>
      <el-table-column label="可用区">
        <template slot-scope="props">
          <div class="tag-group" v-if="props.row.instanceTemplate != null">
            <el-tag style="margin-left: 5px" v-for="item in props.row.instanceTemplate.zoneIds" :key="item">{{ item }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="instanceTemplate.instance.typeId" label="实例类型"></el-table-column>
      <el-table-column prop="instanceTemplate.instance.cpuCoreCount" label="cpu"></el-table-column>
      <el-table-column prop="instanceTemplate.instance.memorySize" label="内存"></el-table-column>
      <el-table-column fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="warning" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
          <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <CloudInstanceTemplateDialog :formStatus="formTemplateStatus"
                                 ref="cloudInstanceTemplateDialog"
                                 @closeCloudInstanceTemplateDialog="fetchData"></CloudInstanceTemplateDialog>
  </div>
</template>

<script>
  // Component

  // Filters
  import { getActiveType, getActiveText } from '@/filters/public.js'
  // API
  import { fuzzyQueryCloudInstanceTemplatePage, deleteCloudInstanceTemplateById } from '@api/cloud/cloud.instance.js'
  import CloudInstanceTemplateDialog from '../dialog/CloudInstanceTemplateDialog'

  export default {
    name: 'cloudInstanceTemplate',
    data () {
      return {
        formTemplateStatus: {
          visible: false,
          labelWidth: '150px',
          operationType: true,
          addTitle: '新增实例模版配置',
          updateTitle: '更新实例模版配置',
          cloudType: ''
        },
        tableData: [],
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          extend: 1,
          queryName: ''
        },
        syncLoading: false
      }
    },
    props: ['formStatus'],
    mounted () {
      this.fetchData()
    },
    components: {
      CloudInstanceTemplateDialog
    },
    filters: {
      getActiveType,
      getActiveText
    },
    methods: {
      handleClick () {
        this.$emit('input', !this.value)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      delItem (row) {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCloudInstanceTemplateById(row.id).then(res => {
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
      editItem (row) {
        var templateData = Object.assign({}, row)
        this.formTemplateStatus.operationType = false
        this.formTemplateStatus.visible = true
        this.formTemplateStatus.cloudType = this.formStatus.cloudType
        this.$refs.cloudInstanceTemplateDialog.initData(this.formStatus.cloudType, templateData)
      },
      addItem () {
        this.formTemplateStatus.operationType = true
        this.formTemplateStatus.visible = true
        this.formTemplateStatus.cloudType = this.formStatus.cloudType
        var templateData = {
          id: '',
          templateName: '',
          cloudType: 2,
          instanceTypeFamily: '',
          instanceTypeId: '',
          regionId: '',
          cpuCoreCount: 0,
          memorySize: 0,
          instanceFamilyLevel: '',
          usageCount: 0,
          comment: '',
          templateYAML: ''
        }
        this.$refs.cloudInstanceTemplateDialog.initData(this.formStatus.cloudType, templateData)
      },
      fetchData () {
        this.loading = true
        var requestBody = Object.assign({}, this.queryParam)
        requestBody.cloudType = this.formStatus.cloudType
        requestBody.page = this.pagination.currentPage
        requestBody.length = this.pagination.pageSize
        fuzzyQueryCloudInstanceTemplatePage(requestBody)
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
