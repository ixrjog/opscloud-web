<template>
  <d2-container>
    <template>
      <div>
        <h1>服务器属性</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model="queryParam.name" placeholder="名称" :style="searchBarHeadStyle"/>
          <el-select v-model="queryParam.grpType" filterable clearable :style="searchBarStyle"
                     remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getGrpType" :loading="loading">
            <el-option
              v-for="item in grpTypeOptions"
              :key="item.grpType"
              :label="item.name"
              :value="item.grpType">
            </el-option>
          </el-select>
          <el-button @click="fetchData" :style="searchBarStyle">查询</el-button>
          <el-button @click="addItem" :style="searchBarStyle">新增</el-button>
        </el-row>
      </div>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column prop="serverGroupType" label="组类型">
              <template slot-scope="scope">
                <el-tag disable-transitions :style="{ color: scope.row.serverGroupType.color }">
                  {{scope.row.serverGroupType.name}}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="描述"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="warning" plain size="mini" @click="getServerGroupAttribute(scope.row)">编辑</el-button>
                <!--            <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>-->
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="paginationCurrentChange"
                         layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                         :page-size="pagination.pageSize">
          </el-pagination>
          <ServerGroupDialog :formStatus="formServerGroupStatus" :formData="serverGroup"
                             @closeServerGroupDialog="fetchData"></ServerGroupDialog>
        </el-col>
        <el-col :span="14" v-if="attributeGroups != null && attributeGroups.length != 0">
          <transition name="el-zoom-in-top">
            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <span>服务器组属性(默认继承父属性)</span>
                <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
              </div>
              <el-collapse v-model="activeName" accordion>
                <div v-for="attributeGroup in attributeGroups" :key="attributeGroup.groupName" class="text item">
                  <el-collapse-item :title="attributeGroup.groupName" :name="attributeGroup.groupName">
                    <!--                  <d2-highlight :code="attributeGroup.attributes"/>-->
                    <!--                  width="500" height="100"-->
                    <editor v-model="attributeGroup.attributes" @init="editorInit" lang="yaml" theme="chrome"
                            width="1000"
                            height="200" :options="options"></editor>
                    <div style="margin-top: 5px">
                      <el-button type="success" plain size="mini" @click="getServerGroupAttribute(scope.row)">预览
                      </el-button>
                      <el-button type="info" plain size="mini" @click="getServerGroupAttribute(scope.row)">智能
                      </el-button>
                      <el-button type="warning" style="float:right; margin-right: 250px" plain size="mini" @click="getServerGroupAttribute(scope.row)">保存
                      </el-button>
                    </div>
                  </el-collapse-item>
                </div>
              </el-collapse>
            </el-card>
          </transition>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
  import ServerGroupDialog from '@/components/opscloud/dialog/ServerGroupDialog'
  // API
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { queryServerGroupPage, queryServerGroupAttribute } from '@api/server/server.group.js'

  export default {
    data () {
      return {
        searchBarHeadStyle: {
          display: 'inline-block',
          maxWidth: '200px'
        },
        searchBarStyle: {
          marginLeft: '5px'
        },
        activeName: '',
        attributeGroups: [],
        serverGroup: {},
        formServerGroupStatus: {
          visible: false,
          addTitle: '新增服务器组配置',
          updateTitle: '更新服务器组配置',
          operationType: true,
          labelWidth: '100px'
        },
        tableData: [],
        // options: {
        //   stripe: true
        // },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryParam: {
          name: '',
          grpType: ''
        },
        grpTypeOptions: [],
        grpTypeDialogOptions: [],
        // ace
        options: {
          // vue2-ace-editor编辑器配置自动补全等
          enableBasicAutocompletion: true,
          enableSnippets: true,
          // 自动补全
          enableLiveAutocompletion: true
        }
      }
    },
    mounted () {
      this.getGrpType('')
      this.fetchData()
    },
    components: {
      ServerGroupDialog,
      editor: require('vue2-ace-editor')
    },
    methods: {
      editorInit: function () {
        // language extension prerequsite...
        require('brace/ext/language_tools')
        require('brace/mode/html')
        // language
        require('brace/mode/yaml')
        require('brace/mode/less')
        require('brace/theme/chrome')
        // snippet
        require('brace/snippets/yaml')
      },
      getServerGroupAttribute (row) {
        queryServerGroupAttribute(row.id)
          .then(res => {
            this.attributeGroups = res.body
          })
      },
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      handleClick () {
        this.$emit('input', !this.value)
      },
      handleDialogCancel (done) {
        this.$message({
          message: '取消保存',
          type: 'warning'
        })
        done()
      },
      // delItem (row) {
      //   this.$confirm('此操作将删除当前配置?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     deleteServerGroupById(row.id).then(res => {
      //       this.fetchData()
      //       this.$message({
      //         type: 'success',
      //         message: '删除成功!'
      //       })
      //     })
      //   }).catch(() => {
      //     this.$message({
      //       type: 'info',
      //       message: '已取消删除'
      //     })
      //   })
      // },
      addItem () {
        this.formServerGroupStatus.operationType = true
        this.formServerGroupStatus.visible = true
        this.serverGroup = {
          id: '',
          name: 'group_',
          grpType: '',
          comment: ''
        }
      },
      updateItem (row) {
        var grpTypeOptions = []
        grpTypeOptions.push(row.serverGroupType)
        this.serverGroup = {
          id: row.id,
          name: row.name,
          grpType: row.grpType,
          comment: row.comment,
          grpTypeOptions: grpTypeOptions
        }
        this.formServerGroupStatus.operationType = false
        this.formServerGroupStatus.visible = true
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchData()
      },
      fetchData () {
        this.loading = true
        queryServerGroupPage(this.queryParam.name, this.queryParam.grpType, this.pagination.currentPage, this.pagination.pageSize)
          .then(res => {
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
