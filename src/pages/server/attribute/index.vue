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
                <el-button type="success" plain size="mini" @click="editServerGroupAttribute(scope.row.id)"
                           icon="el-icon-right"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="paginationCurrentChange"
                         layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                         :page-size="pagination.pageSize">
          </el-pagination>
        </el-col>
        <el-col :span="14" v-show="showServerAttributeCard">
          <transition name="el-zoom-in-top">
            <ServerAttributeCard ref="serverAttributeCard"
                                 :formStatus="formServerAttributeStatus"></ServerAttributeCard>
          </transition>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
  // Component
  import ServerAttributeCard from '@/components/opscloud/card/ServerAttributeCard'
  // API
  import { queryServerGroupTypePage } from '@api/server/server.group.type.js'
  import { queryServerGroupPage } from '@api/server/server.group.js'

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
        tableData: [],
        // options: {
        //   stripe: true
        // },
        loading: false,
        pagination: {
          currentPage: 1,
          pageSize: 5,
          total: 0
        },
        queryParam: {
          name: '',
          grpType: ''
        },
        grpTypeOptions: []
      }
    },
    mounted () {
      this.getGrpType('')
      this.fetchData()
    },
    components: {
      ServerAttributeCard
    },
    methods: {
      editServerGroupAttribute (id) {
        this.showServerAttributeCard = true
        this.$refs.serverAttributeCard.initData(2, id)
      },
      getGrpType (name) {
        queryServerGroupTypePage(name, '', 1, 10)
          .then(res => {
            this.grpTypeOptions = res.body.data
          })
      },
      // handleClick () {
      //   this.$emit('input', !this.value)
      // },
      // handleDialogCancel (done) {
      //   this.$message({
      //     message: '取消保存',
      //     type: 'warning'
      //   })
      //   done()
      // },
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
