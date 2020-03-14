<template>
  <d2-container>
    <template>
      <div>
        <h1>{{title}}</h1>
      </div>
      <el-col>
        <el-tabs tab-position="top" style="height: 200px;">
          <el-tab-pane label="资产">
            <!--用户搜索-->
            <div style="margin-bottom: 5px">
              <!--            :gutter="24"-->
              <el-row style="margin-bottom: 5px">
                <el-input v-model="queryAssetParam.queryName" placeholder="名称" :style="searchBarHeadStyle"
                          style="display: inline-block; max-width:200px"/>
                <el-select v-model="queryAssetParam.assetsNodeId" filterable clearable :style="searchBarStyle"
                           remote reserve-keyword placeholder="搜索资产节点" :remote-method="getAssetsNode">
                  <el-option
                    v-for="item in assetsNodeOptions"
                    :key="item.id"
                    :label="item.value"
                    :value="item.id">
                  </el-option>
                </el-select>
                <el-select v-model="queryAssetParam.isActive" clearable placeholder="用户是否有效" :style="searchBarStyle">
                  <el-option
                    v-for="item in activeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-button @click="fetchAssetData" :style="searchBarStyle">查询</el-button>
                <el-button @click="syncAsset" :style="searchBarStyle" :loading="syncAssetLoading">同步</el-button>
              </el-row>
            </div>
            <!--资产table-->
            <el-row style="margin-bottom: 5px">
              <el-table :data="assetTableData" style="width: 100%" v-loading="assetLoading">
                <el-table-column prop="hostname" label="主机名"></el-table-column>
                <el-table-column prop="publicIp" label="公网ip"></el-table-column>
                <el-table-column prop="ip" label="私网ip"></el-table-column>
                <!--                  <el-table-column prop="ip" label="私网ip"></el-table-column>-->
                <!--                  <el-table-column prop="role" label="角色">-->
                <!--                    <template slot-scope="scope">-->
                <!--                      <el-tag class="filters" :type="scope.row.role | getUserRoleType" size="small ">-->
                <!--                        {{scope.row.role | getUserRoleText}}-->
                <!--                      </el-tag>-->
                <!--                    </template>-->
                <!--                  </el-table-column>-->
                <el-table-column prop="comment" label="描述"></el-table-column>
                <el-table-column fixed="right" label="操作" width="280">
                  <template slot-scope="scope">
                    <el-button type="primary" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
                    <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <!--资产翻页-->
              <el-pagination background @current-change="assetPaginationCurrentChange"
                             layout="prev, pager, next" :total="assetPagination.total"
                             :current-page="assetPagination.currentPage"
                             :page-size="assetPagination.pageSize">
              </el-pagination>
            </el-row>

          </el-tab-pane>
          <el-tab-pane label="帮助">
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </template>
  </d2-container>
</template>

<script>
  // Component
  // import ServerAttributeCard from '@/components/opscloud/card/ServerAttributeCard'
  // Filters
  import { getUserRoleType, getUserRoleText } from '@/filters/jumpserver.js'
  // API
  import { fuzzyQueryAssetPage, syncAsset, queryAssetsNodePage } from '@api/jump/jump.jumpserver.asset.js'

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
        assetsNodeOptions: [],
        activeOptions: [{
          value: -1,
          label: '全部'
        }, {
          value: 1,
          label: '有效'
        }, {
          value: 0,
          label: '无效'
        }],
        // 资产
        assetPagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        queryAssetParam: {
          assetsNodeId: '',
          queryName: '',
          isActive: -1,
          extend: 0
        },
        syncAssetLoading: false,
        assetLoading: false,
        assetTableData: [],
        title: 'Jumpserver资产管理'
      }
    },
    mounted () {
      this.fetchAssetData()
      this.getAssetsNode('')
    },
    filters: {
      getUserRoleType,
      getUserRoleText
    },
    // components: {
    //   ServerAttributeCard
    // },
    methods: {
      getAssetsNode (value) {
        queryAssetsNodePage(value, 1, 20)
          .then(res => {
            this.assetsNodeOptions = res.body.data
          })
      },
      assetPaginationCurrentChange (currentPage) {
        this.assetPagination.currentPage = currentPage
        this.fetchAssetData()
      },
      syncAsset () {
        this.syncAssetLoading = true
        syncAsset()
          .then(res => {
            this.fetchAssetData()
            this.$message({
              type: 'success',
              message: '同步完成!'
            })
            this.syncAssetLoading = false
          })
      },
      fetchAssetData () {
        this.assetLoading = true
        var requestBody = Object.assign({}, this.queryAssetParam)
        requestBody.page = this.assetPagination.currentPage
        requestBody.length = this.assetPagination.pageSize
        fuzzyQueryAssetPage(requestBody)
          .then(res => {
            this.assetTableData = res.body.data
            this.assetPagination.total = res.body.totalNum
            this.assetLoading = false
          })
      }
    }
  }
</script>
