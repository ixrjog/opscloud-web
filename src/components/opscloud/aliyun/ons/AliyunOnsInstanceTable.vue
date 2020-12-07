<template>
  <div>
    <el-row :gutter="30">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>实例</span>
            <i class="fa fa-bars" style="float: right; padding: 3px 10px"></i>
          </div>
          <span class="font-class">{{ instanceStatistics.instanceTotal }}</span>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>Topic</span>
            <i class="fa fa-bookmark-o" style="float: right; padding: 3px 10px"></i>
          </div>
          <span class="font-class">{{ instanceStatistics.topicTotal }}</span>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>Group</span>
            <i class="fa fa-th-large" style="float: right; padding: 3px 10px"></i>
          </div>
          <span class="font-class">{{ instanceStatistics.groupTotal }}</span>
        </el-card>
      </el-col>
    </el-row>
    <div style="margin-bottom: 30px"></div>
    <div>
      <el-row>
        <el-col :span="8">
          <span style="font-size: 18px;">公网实例</span>
        </el-col>
        <el-col :span="8">
          <el-button type="text" @click="handlerSync(internetRegionId)">同步</el-button>
          <el-button type="text" @click="fetchData(internetRegionId)">查询</el-button>
        </el-col>
      </el-row>
      <el-divider><i class="el-icon-monitor"></i></el-divider>
      <el-row :gutter="30">
        <el-col :span="12" v-for="item in internetInstanceList" :key="item.id">
          <el-card shadow="hover" style="margin-bottom: 30px">
            <div slot="header">
              <el-row>
                <el-col :span="21">
                  <span style="font-size: 20px;color: #2f74ff">{{ item.instanceName }}</span>
                  <el-tag style="margin-left: 10px">{{ item.envName }}</el-tag>
                  <el-tooltip class="item" effect="dark" :content="getRemark(item)" placement="right">
                    <i class="el-icon-info" style="margin-left: 10px"></i>
                  </el-tooltip>
                </el-col>
                <el-col :span="3">
                  <el-button icon="el-icon-refresh" type="success" @click="handlerRefresh(item)" plain>刷新</el-button>
                </el-col>
              </el-row>
            </div>
            <el-form label-position="left" label-width="130px">
              <el-row>
                <el-form-item label="实例ID">
                  <span>{{ item.instanceId }}</span>
                  <span v-clipboard:copy="item.instanceId" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="实例状态">
                    <img :src="getImgUrl(item)" style="width: 12px">
                    <span style="margin-left: 5px">{{ item.instanceStatus |statusFilters }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="命名空间">
                    <el-tag type="success">{{ item.independentNaming |namingFilters }}</el-tag>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="Topic数量">
                    <span>{{ item.topicTotal }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="GID数量">
                    <span>{{ item.groupIdTotal }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="item.tcpEndpoint !== ''">
                <el-form-item label="TCP接入点">
                  <span>{{ item.tcpEndpoint }}</span>
                  <span v-clipboard:copy="item.tcpEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternetEndpoint !== ''">
                <el-form-item label="HTTP公网接入点">
                  <span>{{ item.httpInternetEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternetEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternetSecureEndpoint !== ''">
                <el-form-item label="HTTPS公网接入点">
                  <span>{{ item.httpInternetSecureEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternetSecureEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternalEndpoint !== ''">
                <el-form-item label="HTTP内网接入点">
                  <span>{{ item.httpInternalEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternalEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <span style="font-size: 18px;">杭州实例</span>
        </el-col>
        <el-col :span="8">
          <el-button type="text" @click="handlerSync(hangzhouRegionId)">同步</el-button>
          <el-button type="text" @click="fetchData(hangzhouRegionId)">查询</el-button>
        </el-col>
      </el-row>
      <el-divider><i class="el-icon-monitor"></i></el-divider>
      <el-row :gutter="30">
        <el-col :span="12" v-for="item in hangzhouInstanceList" :key="item.id">
          <el-card shadow="hover" style="margin-bottom: 30px">
            <div slot="header">
              <el-row>
                <el-col :span="21">
                  <span style="font-size: 20px;color: #2f74ff">{{ item.instanceName }}</span>
                  <el-tag style="margin-left: 10px">{{ item.envName }}</el-tag>
                  <el-tooltip class="item" effect="dark" :content="getRemark(item)" placement="right">
                    <i class="el-icon-info" style="margin-left: 10px"></i>
                  </el-tooltip>
                </el-col>
                <el-col :span="3">
                  <el-button icon="el-icon-refresh" type="success" @click="handlerRefresh(item)" plain>刷新</el-button>
                </el-col>
              </el-row>
            </div>
            <el-form label-position="left" label-width="130px">
              <el-row>
                <el-form-item label="实例ID">
                  <span>{{ item.instanceId }}</span>
                  <span v-clipboard:copy="item.instanceId" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="实例状态">
                    <img :src="getImgUrl(item)" style="width: 12px">
                    <span style="margin-left: 5px">{{ item.instanceStatus |statusFilters }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="命名空间">
                    <el-tag type="success">{{ item.independentNaming |namingFilters }}</el-tag>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="Topic数量">
                    <span>{{ item.topicTotal }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="GID数量">
                    <span>{{ item.groupIdTotal }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="item.tcpEndpoint !== ''">
                <el-form-item label="TCP接入点">
                  <span>{{ item.tcpEndpoint }}</span>
                  <span v-clipboard:copy="item.tcpEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternetEndpoint !== ''">
                <el-form-item label="HTTP公网接入点">
                  <span>{{ item.httpInternetEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternetEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternetSecureEndpoint !== ''">
                <el-form-item label="HTTPS公网接入点">
                  <span>{{ item.httpInternetSecureEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternetSecureEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
              <el-row v-if="item.httpInternalEndpoint !== ''">
                <el-form-item label="HTTP内网接入点">
                  <span>{{ item.httpInternalEndpoint }}</span>
                  <span v-clipboard:copy="item.httpInternalEndpoint" v-clipboard:success="onCopy"
                        v-clipboard:error="onError" style="float: right">
                    <i class="el-icon-copy-document"></i>
                  </span>
                </el-form-item>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  queryONSInstanceList,
  syncONSInstance,
  refreshONSInstanceDetail,
  onsInstanceStatistics
} from '@api/cloud/aliyun.ons.instance.js'

export default {
  data () {
    return {
      activeName: '',
      internetInstanceList: [],
      hangzhouInstanceList: [],
      internetRegionId: 'mq-internet-access',
      hangzhouRegionId: 'cn-hangzhou',
      instanceStatistics: {
        instanceTotal: '',
        topicTotal: '',
        groupTotal: ''
      },
      successImageUrl: require('@/static/icons/success.svg'),
      warningImageUrl: require('@/static/icons/warning.svg'),
      dangerImageUrl: require('@/static/icons/danger.svg')
    }
  },
  components: {},
  name: 'AliyunONSInstanceTable',
  mounted () {
    this.fetchData(this.internetRegionId)
    this.fetchData(this.hangzhouRegionId)
    this.getStatistics()
  },
  filters: {
    statusFilters (status) {
      if (status === 0) {
        return '部署中'
      }
      if (status === 2) {
        return '已欠费'
      }
      if (status === 5) {
        return '服务中'
      }
      if (status === 7) {
        return '升级中'
      }
      return ''
    },
    namingFilters (naming) {
      if (naming) {
        return '有'
      }
      return '无'
    }
  },
  methods: {
    getImgUrl (item) {
      if (item.instanceStatus === 5) {
        return this.successImageUrl
      }
      if (item.instanceStatus === 2) {
        return this.dangerImageUrl
      }
      return this.warningImageUrl
    },
    getStatistics () {
      onsInstanceStatistics()
        .then(res => {
          this.instanceStatistics.instanceTotal = res.body.instanceTotal
          this.instanceStatistics.topicTotal = res.body.topicTotal
          this.instanceStatistics.groupTotal = res.body.groupTotal
        })
    },
    getRemark (item) {
      return item.remark
    },
    fetchData (regionId) {
      queryONSInstanceList(regionId)
        .then(res => {
          if (regionId === this.internetRegionId) {
            this.internetInstanceList = res.body
          }
          if (regionId === this.hangzhouRegionId) {
            this.hangzhouInstanceList = res.body
          }
        })
    },
    handlerSync (regionId) {
      setTimeout(() => {
        syncONSInstance(regionId)
          .then(res => {
            this.$message({
              message: '后台同步数据中',
              type: 'success'
            })
            this.fetchData(regionId)
            this.syncLoading = false
          })
      }, 300)
    },
    handlerRefresh (row) {
      let data = {
        regionId: row.regionId,
        instanceId: row.instanceId
      }
      refreshONSInstanceDetail(data)
        .then(res => {
          this.$message({
            message: '刷新完成',
            type: 'success'
          })
        })
    },
    onCopy (e) {
      // this.queryParam.queryName = e.text
      this.$message.success('内容已复制到剪切板！')
    },
    onError (e) {
      this.$message.error('抱歉，复制失败！')
    }
  }
}
</script>
