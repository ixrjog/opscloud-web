<template>
  <d2-container>
    <template>
      <div>
        <h1>{{ title }}</h1>
      </div>
      <el-card shadow="never" class="card">
        <div slot="header">
          <el-row>
            <el-tag type="warning">{{ card.faultLevel | faultLevelFilters }}</el-tag>
            <el-tag type="success" style="margin-left: 10px">{{ card.startTime + ' -> ' + card.endTime }}</el-tag>
          </el-row>
        </div>
        <div>
          <el-row>
            <el-col :span="4">
              <span class="span">故障标题</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.faultTitle !== '' && card.faultTitle !==  null"
                           :source="card.faultTitle"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">故障标题</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.faultTitle !== '' && card.faultTitle !==  null"
                           :source="card.faultTitle"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">故障现象</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.faultPerformance !== '' && card.faultPerformance !==  null"
                           :source="card.faultPerformance"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">故障原因</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.rootCause !== '' && card.rootCause !==  null"
                           :source="card.rootCause"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">详细过程</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.faultDetail !== '' && card.faultDetail !==  null"
                           :source="card.faultDetail"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">造成影响</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.effect !== '' && card.effect !==  null" :source="card.effect"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">评级原因</span>
            </el-col>
            <el-col :span="20">
              <d2-markdown v-if="card.faultJudge !== '' && card.faultJudge !==  null"
                           :source="card.faultJudge"></d2-markdown>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">解决方案</span>
            </el-col>
            <el-col :span="20" v-if="JSON.stringify(card.todoAction) !== '[]'">
              <el-table :data="card.todoAction" style="width: 100%">
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="faultAction" label="Action"></el-table-column>
                <el-table-column label="跟进人">
                  <template slot-scope="scope">
                    <span>{{ scope.row.followUser.displayName }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="deadline" label="截止日期"></el-table-column>
                <el-table-column label="状态">
                  <template slot-scope="scope">
                    <el-tag :type="getActionStatusColor(scope.row.actionStatus)">
                      {{ scope.row.actionStatus | actionStatusFilters }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">主要责任人</span>
            </el-col>
            <el-col :span="20">
              <el-tag v-if="JSON.stringify(card.primaryResponsiblePerson) === '{}'" type="info">待定</el-tag>
              <el-tag v-else v-for="person in card.primaryResponsiblePerson" :key="person.id" style="margin-left: 5px">
                {{ person | personFilters }}
              </el-tag>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">次要责任人</span>
            </el-col>
            <el-col :span="20">
              <el-tag v-if="JSON.stringify(card.secondaryResponsiblePerson) === '[]'" type="info">待定</el-tag>
              <el-tag v-else v-for="person in card.secondaryResponsiblePerson" :key="person.id"
                      style="margin-left: 5px">
                {{ person | personFilters }}
              </el-tag>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="4">
              <span class="span">所属团队</span>
            </el-col>
            <el-col :span="20">
              <span v-if="card.responsibleTeam !== '' && card.responsibleTeam !==  null">
                {{ card.responsibleTeam }}
              </span>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </template>
  </d2-container>
</template>

<script>
import { queryFaultInfo } from '@api/fault/fault.info.js'

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
.span {
  font-size: 16px;
  color: #99a9bf;
}

.card {
  margin-bottom: 10px;
}
</style>
