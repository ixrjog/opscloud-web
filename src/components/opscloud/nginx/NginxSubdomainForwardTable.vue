<template>
  <div>
    <el-row style="margin-bottom: 5px; margin-left: 0px" :gutter="20">
      <el-input v-model="queryParam.queryName" placeholder="关键字查询" class="input"/>
      <el-button @click="fetchData" class="button">查询</el-button>
      <el-button @click="handlerRowAdd" class="button">新增</el-button>
      <el-popconfirm title="确定同步所有配置文件吗？" @onConfirm="handlerSync()">
        <el-button size="mini" slot="reference" plain class="button">同步</el-button>
      </el-popconfirm>
    </el-row>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="domainName" label="域名" width="120"></el-table-column>
      <el-table-column prop="loadBalanceList" label="SLB" width="250">
        <template slot-scope="scope">
          <div v-for="item in scope.row.loadBalanceList" :key="item.id">
            <el-tag style="margin-left: 5px">{{ item | loadBalanceFilters }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="instanceSize" label="实例数" width="60">
        <template slot-scope="props">
          <el-tag style="margin-left: 5px">{{ props.row.instanceSize }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" size="mini" @click="handlerRowInstance(scope.row)">
            实例
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-edit">
                <el-button type="text" @click="handlerRowEdit(scope.row)" style="margin-left: 5px">编辑</el-button>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete">
                <el-popconfirm
                  title="确定删除吗？" @onConfirm="handlerRowDel(scope.row)"
                >
                  <el-button slot="reference" type="text" style="margin-left: 5px;color: #F56C6C" size="mini">删除
                  </el-button>
                </el-popconfirm>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                   @size-change="handleSizeChange"
                   layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <nginx-subdomain-forward-dialog ref="nginxSubdomainForwardDialog" :formStatus="formStatus"
                                    @closeDialog="fetchData"></nginx-subdomain-forward-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { querySubdomainForwardPage, delSubdomainForward, syncSubdomainConf } from '@api/nginx/nginx.subdomain.js'
import NginxSubdomainForwardDialog from '@/components/opscloud/nginx/NginxSubdomainForwardDialog'
import { queryLinkNginxSLB } from '@api/cloud/aliyun.slb'

const formData = {
  id: '',
  domainName: '',
  loadBalanceIdList: [],
  loadBalanceOptions: []
}

export default {
  data () {
    return {
      tableData: [],
      loading: false,
      formStatus: {
        visible: false,
        isUpdate: true
      },
      formInstanceStatus: {
        visible: false
      },
      formData: formData,
      allSLBList: [],
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
  name: 'NginxSubdomainForwardTable',
  mounted () {
    this.initPageSize()
    this.fetchData()
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  components: {
    NginxSubdomainForwardDialog
  },
  filters: {
    loadBalanceFilters (loadBalance) {
      return loadBalance.loadBalancerName + ':' + loadBalance.address
    }
  },
  methods: {
    ...mapActions({
      setPageSize: 'd2admin/user/set'
    }),
    handleSizeChange (size) {
      this.pagination.pageSize = size
      this.info.pageSize = size
      this.setPageSize(this.info)
      this.fetchData()
    },
    handlerSync () {
      syncSubdomainConf()
        .then(res => {
          this.$message.success('Nginx配置同步中……')
        })
    },
    initPageSize () {
      if (typeof (this.info.pageSize) !== 'undefined') {
        this.pagination.pageSize = this.info.pageSize
      }
    },
    handlerRowAdd () {
      queryLinkNginxSLB()
        .then(res => {
          let data = {
            id: '',
            domainName: '',
            loadBalanceIdList: [],
            loadBalanceOptions: res.body
          }
          this.formStatus.isUpdate = false
          this.formStatus.visible = true
          this.$refs.nginxSubdomainForwardDialog.initData(data)
        })
    },
    handlerRowInstance (row) {
      this.$emit('handlerInstance', row)
    },
    handlerRowEdit (row) {
      this.formData.id = row.id
      this.formData.domainName = row.domainName
      let loadBalanceIdList = []
      for (let loadBalance of row.loadBalanceList) {
        loadBalanceIdList.push(loadBalance.loadBalancerId)
      }
      this.formData.loadBalanceIdList = loadBalanceIdList
      queryLinkNginxSLB()
        .then(res => {
          this.formData.loadBalanceOptions = res.body
          this.formStatus.visible = true
          this.formStatus.isUpdate = true
          this.$refs.nginxSubdomainForwardDialog.initData(this.formData)
        })
    },
    handlerRowDel (row) {
      delSubdomainForward(row.id).then(res => {
        this.$message({
          type: 'success',
          message: '设置成功!'
        })
        this.fetchData()
      })
    },
    paginationCurrentChange (currentPage) {
      this.pagination.currentPage = currentPage
      this.fetchData()
    },
    fetchData () {
      this.loading = true
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      querySubdomainForwardPage(requestBody)
        .then(res => {
          this.tableData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.input {
  display: inline-block;
  max-width: 200px;
}

.button {
  margin-left: 5px;
}
</style>
