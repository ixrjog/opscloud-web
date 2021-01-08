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
      <el-card v-for="card in cardData" :key="card.id" v-loading="loading" shadow="never" class="card">
        <div slot="header" style="height: 20px">
          <span>{{ card.faultTitle }}</span>
          <el-tag type="warning" style="margin-left: 10px">{{ card.faultLevel | faultLevelFilters }}</el-tag>
          <el-tag type="primary" style="margin-left: 10px">{{ card.startTime + ' -> ' + card.endTime }}</el-tag>
          <span style="float: right">
              <el-button type="success" icon="el-icon-lock" v-if="card.finalized" plain
                         @click="updateFinalized(card)" size="mini">锁定
              </el-button>
              <el-button type="warning" icon="el-icon-unlock" v-if="!card.finalized" plain
                         @click="updateFinalized(card)" size="mini" style="margin-left: 5px">开放
              </el-button>
              <el-dropdown split-button type="primary" size="mini" style="margin-left: 5px" @click="openDetail(card)">
                详情
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item type="text" icon="el-icon-edit">
                    <el-button type="text" size="mini" @click="editItem(card)"
                               :disabled="card.finalized === true">编辑
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item icon="el-icon-delete">
                    <el-popconfirm title="确定删除吗？" @onConfirm="delItem(card)">
                      <el-button slot="reference" type="text" size="mini" style="color: #F56C6C"
                                 :disabled="card.finalized === true">删除
                      </el-button>
                    </el-popconfirm>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
        </div>
        <div>
          <el-row :gutter="15" style="margin-bottom: 15px">
            <el-col :span="12">
              <fault-info-content-card title="故障现象" :content="card.faultPerformance"></fault-info-content-card>
            </el-col>
            <el-col :span="12">
              <fault-info-content-card title="故障原因" :content="card.rootCause"></fault-info-content-card>
            </el-col>
          </el-row>
          <el-row :gutter="15" style="margin-bottom: 15px">
            <el-col :span="12">
              <fault-info-content-card title="详细过程" :content="card.faultDetail"></fault-info-content-card>
            </el-col>
            <el-col :span="12">
              <fault-info-content-card title="造成影响" :content="card.effect"></fault-info-content-card>
            </el-col>
          </el-row>
          <el-row :gutter="15" style="margin-bottom: 15px">
            <el-col :span="12">
              <fault-info-content-card title="评级原因" :content="card.faultJudge"></fault-info-content-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header" style="height: 5px">
                  <span>解决方案</span>
                </div>
                <div>
                  <el-table :data="card.todoAction" style="width: 100%">
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="faultAction" label="Action"></el-table-column>
                    <el-table-column label="跟进人" width="80">
                      <template slot-scope="scope">
                        <span>{{ scope.row.followUser.displayName }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="deadline" label="截止日期" width="90"></el-table-column>
                    <el-table-column label="状态" width="70">
                      <template slot-scope="scope">
                        <el-tag :type="getActionStatusColor(scope.row.actionStatus)">
                          {{ scope.row.actionStatus | actionStatusFilters }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template slot-scope="scope">
                        <el-select v-model="actionUpdateStatus" placeholder="更新状态" @change="updateAction(scope.row)">
                          <el-option v-for="item in actionStatusOptions"
                                     :key="item.value"
                                     :label="item.label"
                                     :value="item.value">
                          </el-option>
                        </el-select>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="15">
            <el-col :span="8">
              <el-card shadow="never">
                <div slot="header" style="height: 5px">
                  <span>主要责任人</span>
                </div>
                <div>
                  <span v-if="JSON.stringify(card.primaryResponsiblePerson) === '[]'" type="info">待定</span>
                  <el-tag v-else v-for="person in card.primaryResponsiblePerson" :key="person.id"
                          style="margin-left: 5px">
                    {{ person | personFilters }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never">
                <div slot="header" style="height: 5px">
                  <span>次要责任人</span>
                </div>
                <div>
                  <span v-if="JSON.stringify(card.secondaryResponsiblePerson) === '[]'" type="info">待定</span>
                  <el-tag v-else v-for="person in card.secondaryResponsiblePerson" :key="person.id"
                          style="margin-left: 5px">
                    {{ person | personFilters }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never">
                <div slot="header" style="height: 5px">
                  <span>所属团队</span>
                </div>
                <div>
                  <span>{{ card.responsibleTeam }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
      <el-pagination background @current-change="paginationCurrentChange" :page-sizes="[10, 15, 20, 25, 30]"
                     @size-change="handleSizeChange"
                     layout="sizes, prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                     :page-size="pagination.pageSize">
      </el-pagination>
      <!-- 数据预览-->
      <fault-info-dialog :formStatus="formFaultInfoStatus" ref="faultInfoDialog"
                         @closeFaultInfoDialog="fetchData"></fault-info-dialog>
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
import { updateFaultAction } from '@api/fault/fault.info'
import FaultInfoContentCard from '@/components/opscloud/fault/FaultInfoContentCard'

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
      actionStatusOptions: [{
        value: 0,
        label: '完成'
      }, {
        value: 1,
        label: '待完成'
      }, {
        value: 2,
        label: '关闭'
      }],
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
      causeTypeOptions: [],
      actionUpdateStatus: ''
    }
  },
  mounted () {
    this.fetchData()
    this.initPageSize()
    this.getCauseType()
  },
  filters: {
    actionStatusFilters (actionStatus) {
      if (actionStatus === 0) {
        return '完成'
      }
      if (actionStatus === 1) {
        return '待完成'
      }
      if (actionStatus === 2) {
        return '关闭'
      }
    },
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
    FaultInfoContentCard
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
    getActionStatusColor (actionStatus) {
      if (actionStatus === 0) {
        return 'success'
      }
      if (actionStatus === 1) {
        return 'danger'
      }
      if (actionStatus === 2) {
        return 'info'
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
    updateAction (row) {
      if (this.actionUpdateStatus === '') {
        this.$message.warning('状态错误')
        return
      }
      row.actionStatus = this.actionUpdateStatus
      updateFaultAction(row)
        .then(res => {
          this.$message.success('更新故障Action成功')
          this.actionUpdateStatus = ''
        })
    },
    updateFinalized (card) {
      updateFaultInfoFinalized(card.id).then(res => {
        // this.fetchData()
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

.card {
  margin-bottom: 10px;
}
</style>
