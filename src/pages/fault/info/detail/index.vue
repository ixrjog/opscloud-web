<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-card shadow="never">
        <div slot="header" style="height: 20px">
          <span>{{ card.faultTitle }}</span>
          <el-tag type="warning" style="margin-left: 10px">{{ card.faultLevel | faultLevelFilters }}</el-tag>
          <el-tag type="primary" style="margin-left: 10px">{{ card.startTime + ' -> ' + card.endTime }}</el-tag>
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
                  <span v-if="card.responsibleTeam !== '' && card.responsibleTeam !== null">
                    {{ card.responsibleTeam }}
                  </span>
                  <span v-else>待定</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </template>
  </d2-container>
</template>

<script>
import { queryFaultInfo } from '@api/fault/fault.info.js'
import FaultInfoContentCard from '@/components/opscloud/fault/FaultInfoContentCard'

export default {
  data () {
    return {
      card: {
        id: '',
        faultTitle: '',
        faultLevel: '',
        rootCauseType: '',
        startTime: '',
        endTime: '',
        faultDate: '',
        rootCause: '',
        faultDetail: '',
        todoAction: '',
        faultJudge: '',
        responsibleTeam: '',
        primaryResponsiblePerson: [],
        secondaryResponsiblePerson: [],
        effect: '',
        faultPerformance: ''
      },
      faultId: '',
      title: '故障公告详情页'
    }
  },
  mounted () {
    this.$store.dispatch('d2admin/menu/asideCollapseSet', true)
    this.faultId = this.$route.query.faultId
    this.fetchData()
  },
  components: {
    FaultInfoContentCard
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
  methods: {
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
    fetchData () {
      queryFaultInfo(this.faultId)
        .then(res => {
          this.card = res.body
        })
    }
  }
}
</script>

<style scoped>
</style>
