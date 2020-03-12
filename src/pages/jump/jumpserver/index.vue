<template>
  <d2-container>
    <template>
      <div>
        <h1>Jumpserver管理</h1>
      </div>

        <el-col >
          <el-tabs tab-position="top" style="height: 200px;">
            <el-tab-pane label="用户管理">
              <!--服务器组搜索-->
              <div style="margin-bottom: 5px">
                <!--            :gutter="24"-->
                <el-row style="margin-bottom: 5px">
                  <el-input v-model="queryGroupParam.name" placeholder="名称" :style="searchBarHeadStyle"
                            style="display: inline-block; max-width:200px"/>
                  <el-select v-model="queryGroupParam.grpType" filterable clearable :style="searchBarStyle"
                             remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getGrpType"
                             :loading="loading">
                    <el-option v-for="item in grpTypeOptions"
                               :key="item.grpType" :label="item.name" :value="item.grpType">
                    </el-option>
                  </el-select>
                  <el-button @click="groupFetchData" :style="searchBarStyle">查询</el-button>
                </el-row>
              </div>
              <!--服务器组table-->
              <el-row style="margin-bottom: 5px">
                <el-table :data="groupTableData" style="width: 100%" v-loading="loading">
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
                      <el-button type="success" plain size="mini" @click="editServerGroupAttribute(scope.row.id)"
                                 icon="el-icon-setting"></el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <!--服务器组翻页-->
                <el-pagination background @current-change="groupPaginationCurrentChange"
                               layout="prev, pager, next" :total="groupPagination.total"
                               :current-page="groupPagination.currentPage"
                               :page-size="groupPagination.pageSize">
                </el-pagination>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="属性原型"></el-tab-pane>
          </el-tabs>
        </el-col>


    </template>
  </d2-container>
</template>

<script>
  // Component
  //import ServerAttributeCard from '@/components/opscloud/card/ServerAttributeCard'
  // API
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'
  import { fuzzyQueryServerPage } from '@api/server/server.js'

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
        formServerAttributeStatus: {
          serverAttributeTitle: '服务器属性',
          groupAttributeTitle: '服务器组属性'
        },
        showServerAttributeCard: false,
        serverGroup: {},
        serverGroupId: '',
        groupTableData: [],
        serverTableData: [],
        // options: {
        //   stripe: true
        // },
        loading: false,
        groupPagination: {
          currentPage: 1,
          pageSize: 5,
          total: 0
        },
        serverPagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryGroupParam: {
          name: '',
          grpType: ''
        },
        grpTypeOptions: []
      }
    },
    mounted () {
      this.getGrpType('')
      this.groupFetchData()
    },
    // components: {
    //   ServerAttributeCard
    // },
    methods: {
      editServerGroupAttribute (id) {
        this.serverGroupId = id
        this.showServerAttributeCard = true
        this.$refs.serverAttributeCard.initData(2, id)
        this.serverFetchData()
      },
      editServerAttribute (id) {
        this.showServerAttributeCard = true
        this.$refs.serverAttributeCard.initData(1, id)
      },
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      groupPaginationCurrentChange (currentPage) {
        this.groupPagination.currentPage = currentPage
        this.groupFetchData()
      },
      serverPaginationCurrentChange (currentPage) {
        this.serverPagination.currentPage = currentPage
        this.serverFetchData()
      },
      groupFetchData () {
        this.loading = true
        queryServerGroupPage(this.queryGroupParam.name, this.queryGroupParam.grpType, this.groupPagination.currentPage, this.groupPagination.pageSize)
          .then(res => {
            this.groupTableData = res.body.data
            this.groupPagination.total = res.body.totalNum
            this.loading = false
          })
      },
      serverFetchData () {
        // this.loading = true
        var requestBody = {
          'queryName': '',
          'extend': 0,
          'serverGroupId': this.serverGroupId,
          'envType': '',
          'tagId': '',
          'page': this.serverPagination.currentPage,
          'length': this.serverPagination.pageSize
        }
        fuzzyQueryServerPage(requestBody)
          .then(res => {
            this.serverTableData = res.body.data
            this.serverPagination.total = res.body.totalNum
            // this.loading = false
          })
      }
    }
  }
</script>
