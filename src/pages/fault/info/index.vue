<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <div style="margin-bottom: 5px">
        <el-row :gutter="24" style="margin-bottom: 5px">
          <el-input v-model.trim="queryParam.queryName" placeholder="关键字查询"
                    class="input"/>
          <el-select v-model="queryParam.faultLevel" clearable placeholder="故障级别" class="searchBarStyle">
            <el-option
              v-for="item in faultLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model.trim="queryParam.rootCauseTypeId" style="margin-left: 5px"
                     filterable clearable remote placeholder="故障归类" :remote-method="getCauseType">
            <el-option
              v-for="item in causeTypeOptions"
              :key="item.id"
              :label="item.rootCauseType"
              :value="item.id">
            </el-option>
          </el-select>
          <el-date-picker v-model="queryParam.queryDate" type="month" placeholder="选择月份"
                          style="margin-left: 5px" value-format="yyyy-MM"></el-date-picker>
          <el-button @click="fetchData" class="button" :loading="loading">查询</el-button>
          <el-button @click="addItem" class="button">新增</el-button>
        </el-row>
      </div>
      <el-table :data="cardData" style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="faultTitle" label="故障标题"></el-table-column>
        <el-table-column prop="rootCauseType" label="故障分类"></el-table-column>
        <el-table-column label="故障级别">
          <template slot-scope="scope">
            <el-tag type="warning">{{ scope.row.faultLevel | faultLevelFilters }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="影响时间">
          <template slot-scope="scope">
            <el-tag type="primary">{{ scope.row.startTime + ' -> ' + scope.row.endTime }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="240">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="故障信息锁定中" placement="top">
              <el-button type="success" icon="el-icon-lock" v-if="scope.row.finalized" plain
                         @click="updateFinalized(scope.row)" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="故障信息开放中" placement="top">
              <el-button type="warning" icon="el-icon-unlock" v-if="!scope.row.finalized" plain
                         @click="updateFinalized(scope.row)" size="mini">
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="更新Action状态" placement="top">
              <el-button type="primary" icon="el-icon-bell" plain @click="updateAction(scope.row)" size="mini">
              </el-button>
            </el-tooltip>
            <el-dropdown split-button type="primary" size="mini" style="margin-left: 10px"
                         @click="openDetail(scope.row)">
              详情
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item type="text" icon="el-icon-edit">
                  <el-button type="text" size="mini" @click="editItem(scope.row)"
                             :disabled="scope.row.finalized === true">编辑
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-delete">
                  <el-popconfirm title="确定删除吗？" @onConfirm="delItem(scope.row)">
                    <el-button slot="reference" type="text" size="mini" style="color: #F56C6C"
                               :disabled="scope.row.finalized === true">删除
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
      <fault-info-dialog :formStatus="formFaultInfoStatus" ref="faultInfoDialog"
                         @closeFaultInfoDialog="fetchData"></fault-info-dialog>
      <fault-action-dialog :formStatus="formFaultActionStatus" ref="faultActionDialog"></fault-action-dialog>
    </template>
  </d2-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  queryFaultRootCauseTypePage,
  queryFaultInfoPage,
  delFaultInfo,
  updateFaultInfoFinalized
} from '@api/fault/fault.info.js'

import util from '@/libs/util'
import FaultInfoDialog from '@/components/opscloud/fault/FaultInfoDialog'
import FaultActionDialog from '@/components/opscloud/fault/FaultActionDialog'

const faultInfoData = {
  id: '',
  finalized: false,
  faultTitle: '',
  faultLevel: '',
  rootCauseTypeId: '',
  startTime: '',
  endTime: '',
  faultDate: '',
  rootCause: '',
  faultDetail: '',
  todoAction: [],
  faultJudge: '',
  responsibleTeam: '',
  primaryResponsiblePersonIdList: [],
  secondaryResponsiblePersonIdList: [],
  effect: '',
  faultPerformance: ''
}

export default {
  data () {
    return {
      formFaultInfoStatus: {
        visible: false,
        isUpdate: false
      },
      formFaultActionStatus: {
        visible: false
      },
      cardData: [],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      queryParam: {
        queryName: '',
        faultLevel: '',
        rootCauseTypeId: '',
        queryDate: ''
      },
      faultLevelOptions: [{
        value: 'P1',
        label: 'P1'
      }, {
        value: 'P2',
        label: 'P2'
      }, {
        value: 'P3',
        label: 'P3'
      }, {
        value: 'P4',
        label: 'P4'
      }, {
        value: 'NoFault',
        label: '无故障'
      }, {
        value: 'Unrated',
        label: '未定级'
      }],
      title: '故障公告',
      causeTypeOptions: []
    }
  },
  mounted () {
    this.fetchData()
    this.initPageSize()
    this.getCauseType()
  },
  filters: {
    personFilters (person) {
      return person.displayName + '<' + person.username + '>'
    },
    faultLevelFilters (faultLevel) {
      if (faultLevel === 'NoFault') {
        return '无故障'
      }
      if (faultLevel === 'Unrated') {
        return '未定级'
      }
      return faultLevel
    }
  },
  components: {
    FaultInfoDialog,
    FaultActionDialog
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
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
    initPageSize () {
      if (typeof (this.info.pageSize) !== 'undefined') {
        this.pagination.pageSize = this.info.pageSize
      }
    },
    getCauseType () {
      let requestBody = {
        'rootCauseType': this.queryParam.rootCauseType,
        'page': 1,
        'length': 20
      }
      queryFaultRootCauseTypePage(requestBody)
        .then(res => {
          this.causeTypeOptions = res.body.data
        })
    },
    updateFinalized (card) {
      updateFaultInfoFinalized(card.id).then(res => {
        this.$message({
          type: 'success',
          message: '成功!'
        })
        card.finalized = !card.finalized
      })
    },
    delItem (card) {
      delFaultInfo(card.id).then(res => {
        this.fetchData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    addItem () {
      this.formFaultInfoStatus.visible = true
      this.formFaultInfoStatus.isUpdate = false
      let data = Object.assign({}, faultInfoData)
      this.$refs.faultInfoDialog.initData(data)
    },
    editItem (card) {
      this.formFaultInfoStatus.visible = true
      this.formFaultInfoStatus.isUpdate = true
      let data = Object.assign({}, card)
      let faultDate = []
      faultDate.push(card.startTime)
      faultDate.push(card.endTime)
      data.faultDate = faultDate
      this.$refs.faultInfoDialog.initData(data)
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
      this.cardData = []
      this.loading = true
      let queryDate = this.queryParam.queryDate === '' || this.queryParam.queryDate === null
      let requestBody = {
        'queryName': this.queryParam.queryName,
        'faultLevel': this.queryParam.faultLevel,
        'rootCauseTypeId': this.queryParam.rootCauseTypeId === '' ? -1 : this.queryParam.rootCauseTypeId,
        'queryYear': queryDate ? -1 : this.queryParam.queryDate.split('-')[0],
        'queryMonth': queryDate ? -1 : this.queryParam.queryDate.split('-')[1],
        'page': this.pagination.currentPage,
        'length': this.pagination.pageSize
      }
      queryFaultInfoPage(requestBody)
        .then(res => {
          this.cardData = res.body.data
          this.pagination.total = res.body.totalNum
          this.loading = false
        })
    },
    openDetail (row) {
      let host = window.location.host
      let httpProtocol = window.location.href.split('://')[0]
      let buildDetailsUrl = httpProtocol + '://' + host + '/#/fault/info/detail?faultId=' + row.id
      util.open(buildDetailsUrl)
    },
    updateAction (row) {
      this.formFaultActionStatus.visible = true
      this.$refs.faultActionDialog.initData(row.id)
    }
  }
}
</script>

<style scoped>
.input {
  margin-left: 12px;
  display: inline-block;
  max-width: 200px;
}

.button {
  margin-left: 5px;
}

.searchBarStyle {
  margin-left: 5px;
  max-width: 200px;
}
</style>
