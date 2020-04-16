<template>
  <div>
    <el-input v-model="queryParam.queryName" placeholder="关键字查询" style="display: inline-block; max-width:200px"/>
    <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="playbook">
              <editor v-model="props.row.playbook" @init="editorInit" lang="yaml" theme="kuroir"
                      width="800" height="200" :options="options"></editor>
              <!--              <d2-highlight :code="props.row.ansible" lang="yml"/>-->
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="extraVars" label="vars" width="520px">
        <template slot-scope="scope">
          <editor v-model="scope.row.extraVars" @init="editorInit" lang="yaml" theme="kuroir"
                  width="500" height="100" :options="options"></editor>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="tags" width="520px">
        <template slot-scope="scope">
          <editor v-model="scope.row.tags" @init="editorInit" lang="yaml" theme="kuroir"
                  width="500" height="100" :options="options"></editor>
          <!--          <d2-highlight :code="scope.row.tags" lang="yml"/>-->
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <!--            <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth ===-->
          <!--              0 ? '鉴权' : '不鉴权'}}-->
          <!--            </el-button>-->
          <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
          <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <PlaybookDialog :formStatus="formPlaybookStatus" ref="playbookDialog" @closePlaybookDialog="fetchData"></PlaybookDialog>
  </div>
</template>

<script>
  // Component
  import PlaybookDialog from '@/components/opscloud/dialog/PlaybookDialog'

  // API
  import { queryPlaybookPage } from '@api/server/server.task.js'

  export default {
    data () {
      return {
        formPlaybookStatus: {
          visible: false,
          addTitle: '新增playbook配置',
          updateTitle: '更新playbook配置',
          labelWidth: '100px',
          operationType: true
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
          queryName: ''
        }
      }
    },
    name: 'AnsiblePlaybookTable',
    props: ['formStatus'],
    mounted () {
      this.fetchData()
    },
    components: {
      PlaybookDialog,
      editor: require('vue2-ace-editor')
    },
    methods: {
      editorInit: function (ed) {
        // language extension prerequsite...
        require('brace/ext/language_tools')
        // language
        require('brace/mode/yaml')
        require('brace/theme/chrome')
        require('brace/theme/kuroir')
        // snippet
        require('brace/snippets/yaml')
        ed.setReadOnly(true)
      },
      editItem (row) {
        let playbook = Object.assign({}, row)
        this.formPlaybookStatus.operationType = false
        this.formPlaybookStatus.visible = true
        this.$refs.playbookDialog.initData(playbook)
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        var requestBody = Object.assign({}, this.queryParam)
        requestBody.page = this.pagination.currentPage
        requestBody.length = this.pagination.pageSize
        queryPlaybookPage(requestBody)
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
