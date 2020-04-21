<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>组织架构</span>
              <el-button @click="fetchDepartmentTreeData" style="float: right" :loading="searching">查询</el-button>
            </div>
            <el-tree
              draggable
              default-expand-all
              node-key="id"
              :data="deptTree.tree"
              @node-drop="handleDrop"
              @node-click="handleNodeClick"></el-tree>
          </el-card>
        </el-col>
        <el-col :span="16">
          <!--  部门成员-->
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>部门成员</span>
            </div>
            <!--用户搜索-->
            <div style="margin-bottom: 5px">
              <!--            :gutter="24"-->
              <el-row style="margin-bottom: 5px">
                <el-input v-model="queryMemberParam.queryName" placeholder="名称" :style="searchBarHeadStyle"
                          style="display: inline-block; max-width:200px"/>
                <el-button @click="fetchDepartmentMemberData" :style="searchBarStyle">查询</el-button>
                <el-button @click="addItem" style="margin-left: 5px">新增</el-button>
              </el-row>
            </div>
            <el-table :data="tableData" style="width: 100%" v-loading="memberLoading">
              <el-table-column prop="username" label="用户名"></el-table-column>
              <el-table-column prop="displayName" label="显示名"></el-table-column>
              <el-table-column prop="role" label="角色">
                <template slot-scope="scope">
                  <el-tag class="filters" :type="scope.row.role | getUserRoleType" size="small ">
                    {{scope.row.role | getUserRoleText}}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isActive" label="有效">
                <template slot-scope="scope">
                  <el-tag class="filters" :type="scope.row.isActive | getActiveType" size="small ">
                    {{scope.row.isActive | getActiveText}}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="280">
                <template slot-scope="scope">
                  <el-button type="primary" plain size="mini" @click="syncItem(scope.row.id)">同步</el-button>
                  <el-button type="primary" plain size="mini" @click="setItemActive(scope.row.id)">{{!scope.row.isActive
                    | getActiveText}}
                  </el-button>
                  <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!--用户翻页-->
            <el-pagination background @current-change="paginationCurrentChange"
                           layout="prev, pager, next" :total="pagination.total"
                           :current-page="pagination.currentPage"
                           :page-size="pagination.pageSize">
            </el-pagination>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>

  // API
  import { queryDepartmentTree, dropDepartmentTree, queryDepartmentMemberPage } from '@api/org/org.js'

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
        title: '部门管理',
        rootParentId: 0,
        departmentId: '',
        deptTree: '',
        searching: false,
        loading: false,
        // member
        tableData: [],
        memberLoading: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryMemberParam: {
          queryName: ''
        }
      }
    },
    mounted () {
      this.fetchDepartmentTreeData()
    },
    components: {},
    methods: {
      handleDrop (draggingNode, dropNode, dropType, ev) {
        // console.log('tree drop: ', draggingNode.label, dropNode.label, dropType)
        // console.log('tree drop: ', draggingNode.key, dropNode.key, dropType)
        dropDepartmentTree(draggingNode.key, dropNode.key, dropType)
          .then(res => {
            if (res.success) {
              this.$message({
                type: 'success',
                message: '设置成功!'
              })
              this.fetchDepartmentTreeData()
            } else {
              this.$message.error(res.msg)
            }
          })
      },
      handleNodeClick (data, node) {
        try {
          this.departmentId = node.key
          this.fetchDepartmentMemberData()
        } catch (e) {
        }
      },
      paginationCurrentChange (currentPage) {
        this.pagination.currentPage = currentPage
        this.fetchDepartmentMemberData()
      },
      fetchDepartmentTreeData () {
        this.searching = true
        queryDepartmentTree(this.rootParentId)
          .then(res => {
            this.deptTree = res.body
            this.searching = false
          })
      },
      fetchDepartmentMemberData () {
        if (this.departmentId === null || this.departmentId === '') return
        this.loading = true
        let requestBody = {
          'departmentId': this.departmentId,
          'queryName': this.queryMemberParam.queryName,
          'memberType': -1,
          'isLeader': -1,
          'isApprovalAuthority': -1,
          'page': this.pagination.currentPage,
          'length': this.pagination.pageSize
        }
        queryDepartmentMemberPage(requestBody)
          .then(res => {
           // console.log(JSON.stringify(res))
            this.tableData = res.body.data
            this.pagination.total = res.body.totalNum
            this.loading = false
          })
      }
    }
  }
</script>
