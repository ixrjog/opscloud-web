<template>
  <el-dialog :title="formStatus.title"
             :before-close="closeDialog"
             :visible.sync="formStatus.visible">
    <el-tabs v-model="activeName">
      <el-tab-pane label="模版" name="template">
        <el-form :model="templateData">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline class="table-expand">
                  <el-form-item label="镜像id" v-show="props.row.imageId != null && props.row.imageId != ''">
                    <span>{{ props.row.imageId }}</span>
                  </el-form-item>
                  <el-form-item label="专有网络id" v-show="props.row.vpcId != null && props.row.vpcId != ''">
                    <span>{{ props.row.vpcId }}</span>
                  </el-form-item>
                  <el-form-item label="专有网络名称" v-show="props.row.vpcName != null && props.row.vpcName != ''">
                    <span>{{ props.row.vpcName }}</span>
                  </el-form-item>
                  <el-form-item label="安全组id"
                                v-show="props.row.securityGroupId != null && props.row.securityGroupId != ''">
                    <span>{{ props.row.securityGroupId }}</span>
                  </el-form-item>
                  <el-form-item label="安全组名称"
                                v-show="props.row.securityGroupName != null && props.row.securityGroupName != ''">
                    <span>{{ props.row.securityGroupName }}</span>
                  </el-form-item>
                  <el-form-item label="创建时间">
                    <span>{{ props.row.createTime }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="templateName" label="模版名称"></el-table-column>
            <el-table-column prop="regionId" label="地区id"></el-table-column>
            <el-table-column label="有效可用区">
              <template slot-scope="props">
                <div class="tag-group" v-if="props.row.instanceZones != null">
                  <el-tag style="margin-left: 5px" :type="item.active ? 'success': 'info'"
                          v-for="item in props.row.instanceZones" :key="item.zoneId">{{ item.zoneId }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="instanceTemplate.instance.typeId" label="实例类型"></el-table-column>
            <el-table-column prop="instanceTemplate.instance.cpuCoreCount" label="cpu"></el-table-column>
            <el-table-column prop="instanceTemplate.instance.memorySize" label="内存"></el-table-column>
          </el-table>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="通用选项" name="options">
        <el-form :model="templateData">
          <el-form-item label="服务器组" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="createInstanceData.serverGroupId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getServerGroup">
              <el-option
                v-for="item in serverGroupOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="服务器名称" :label-width="formStatus.labelWidth">
            <!--            style="display: inline-block; max-width:175px;"-->
            <el-input v-model="createInstanceData.serverName" placeholder="不填写按服务器组名称生成"></el-input>
          </el-form-item>
          <el-form-item label="登录用户" :label-width="formStatus.labelWidth" :required="true">
            <el-input v-model="createInstanceData.loginUser" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item label="登录类型" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="createInstanceData.loginType" placeholder="选择类型">
              <el-option
                v-for="item in loginTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="环境" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="createInstanceData.envType" filterable clearable
                       remote reserve-keyword>
              <el-option
                v-for="item in envTypeOptions"
                :key="item.envType"
                :label="item.envName"
                :value="item.envType">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="公网" :label-width="formStatus.labelWidth">
            <el-checkbox v-model="createInstanceData.allocatePublicIpAddress">分配公网ip地址</el-checkbox>
          </el-form-item>
          <el-form-item label="创建实例数量" :label-width="formStatus.labelWidth">
            <el-slider v-model="createInstanceData.createSize" :min="1" :max="40" show-input
                       input-size="mini"></el-slider>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="实例选项" name="instance">
        <el-form :model="templateData">
          <el-form-item label="镜像" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="createInstanceData.imageId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getImage">
              <el-option
                v-for="item in imageOptions"
                :key="item.imageId"
                :label="item.imageName"
                :value="item.imageId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="安全组" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="createInstanceData.securityGroupId" filterable clearable
                       remote reserve-keyword placeholder="输入关键词搜组类型" :remote-method="getSecurityGroup">
              <el-option
                v-for="item in securityGroupOptions"
                :key="item.securityGroupId"
                :label="item.securityGroupName"
                :value="item.securityGroupId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="可用区" :label-width="formStatus.labelWidth">
            <el-tooltip content="在有效可用区内平均创建实例" placement="bottom" effect="light">
              <el-radio v-model="createInstanceData.zonePattern" label="auto">自动</el-radio>
            </el-tooltip>
            <el-tooltip content="仅在选择的可用区内创建实例(必须在可用区内创建虚拟交换机)" placement="bottom" effect="light">
              <el-radio v-model="createInstanceData.zonePattern" label="single">手动</el-radio>
            </el-tooltip>
            <el-select v-model="createInstanceData.zoneId" placeholder="请选择" @change="selectionZone"
                       :disabled="createInstanceData.zonePattern === 'auto'">
              <el-option
                v-for="item in templateData.instanceZones"
                :key="item.zoneId"
                :label="item.zoneId"
                :value="item.zoneId"
                :disabled="!item.active">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="虚拟交换机" :label-width="formStatus.labelWidth" :required="true"
                        v-show="vswitchTree.length > 0 && createInstanceData.zonePattern === 'single'">
            <el-tree :data="vswitchTree" show-checkbox ref="vswitchTree" node-key="vswitchId"></el-tree>
          </el-form-item>
          <el-form-item label="付费选项" :label-width="formStatus.labelWidth">
            <el-tooltip content="默认付费方式为:按量付费" placement="bottom" effect="light">
              <el-checkbox v-model="createInstanceData.charge.chargeType">包月</el-checkbox>
            </el-tooltip>
            <el-select v-model="createInstanceData.charge.period" placeholder="请选择包月时长"
                       v-show="createInstanceData.charge.chargeType">
              <el-option v-for="item in chargePeriodOptions"
                         :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-checkbox style="margin-left: 30px" v-model="createInstanceData.charge.autoRenew"
                         v-show="createInstanceData.charge.chargeType">自动续费
            </el-checkbox>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="磁盘" name="disk">
        <el-form :model="templateData">
          <el-form-item label="系统盘类型" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="disk.sysDisk.category" placeholder="选择类型">
              <el-option
                v-for="item in aliyunDiskOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="系统盘容量GiB" :label-width="formStatus.labelWidth" :required="true">
            <el-input v-model="disk.sysDisk.size" placeholder="请输入内容"
                      style="display: inline-block; max-width:175px;"></el-input>
          </el-form-item>
          <el-form-item label="数据盘类型" :label-width="formStatus.labelWidth" :required="true">
            <el-select v-model="disk.dataDisk.category" placeholder="选择类型">
              <el-option
                v-for="item in aliyunDiskOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据盘容量GiB" :label-width="formStatus.labelWidth" :required="true">
            <el-input v-model="disk.dataDisk.size" placeholder="请输入内容"
                      style="display: inline-block; max-width:175px;"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="任务详情" name="task">
        <el-form>
          <el-form-item label="任务进度" :label-width="formStatus.labelWidth">
            <el-progress :text-inside="true" :stroke-width="24" :percentage="completedPercentage" status="success" style="max-width:200px"></el-progress>
          </el-form-item>
        </el-form>
        <div id="taskChart" style="width: 900px; height: 500px;"></div>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">关闭</el-button>
      <el-button type="primary" size="mini" @click="handlerCreate">创建</el-button>
    </div>
  </el-dialog>
</template>

<script>

  // api
  import { queryServerGroupPage } from '@api/server/server.group.js'
  import { queryEnvPage } from '@api/env/env.js'
  import { fuzzyQueryCloudImagePage } from '@api/cloud/cloud.image.js'
  import { queryCloudVPCPage, queryCloudVPCSecurityGroupPage } from '@api/cloud/cloud.vpc.js'
  import {
    queryCloudInstanceTemplateVSwitch,
    createCloudInstance,
    queryLastCloudInstanceTaskByTemplateId
  } from '@api/cloud/cloud.instance.js'

  let echarts = require('echarts/lib/echarts')
  require('echarts/lib/chart/pie')
  require('echarts/map/js/china')
  require('echarts/lib/chart/pie')
  require('echarts/lib/chart/line')
  require('echarts/lib/chart/bar')
  require('echarts/lib/component/tooltip')
  require('echarts/lib/component/legend')

  export default {
    name: 'CreateCloudInstanceDialog',
    data () {
      return {
        timer: null,
        tableData: [],
        activeName: 'template',
        templateData: {},
        createInstanceData: {
          charge: {
            chargeType: false,
            period: 1,
            autoRenew: true
          }
        },
        serverGroupOptions: [],
        envTypeOptions: [],
        loginTypeOptions: [{
          value: 0,
          label: 'key'
        }, {
          value: 1,
          label: 'passwd'
        }],
        aliyunDiskOptions: [{
          value: 'cloud_efficiency',
          label: '高效云盘'
        }, {
          value: 'cloud_ssd',
          label: 'SSD云盘'
        }, {
          value: 'cloud_essd',
          label: '高性能SSD云盘'
        }],
        disk: {
          sysDisk: {
            size: 40,
            category: 'cloud_efficiency'
          },
          dataDisk: {
            size: 0,
            category: 'cloud_efficiency'
          }
        },
        chargePeriodOptions: [
          {
            value: 1,
            label: '1个月'
          },
          {
            value: 2,
            label: '2个月'
          },
          {
            value: 3,
            label: '3个月'
          },
          {
            value: 4,
            label: '4个月'
          },
          {
            value: 5,
            label: '5个月'
          },
          {
            value: 6,
            label: '6个月'
          },
          {
            value: 7,
            label: '7个月'
          },
          {
            value: 8,
            label: '8个月'
          },
          {
            value: 9,
            label: '9个月'
          },
          {
            value: 12,
            label: '1年'
          },
          {
            value: 24,
            label: '2年'
          },
          {
            value: 36,
            label: '3年'
          }
        ],
        imageLoading: false,
        imageOptions: [],
        securityGroupOptions: [],
        securityGroupLoading: false,
        vswitchData: [],
        vswitchTree: [],
        completedPercentage: 0
      }
    },
    props: ['formStatus'],
    mixins: [],
    components: {},
    mounted () {
      this.getEnvType()
    },
    methods: {
      setTimer () {
        if (this.timer == null) {
          this.timer = setInterval(() => {
            this.queryTask()
            console.log('开始定时...每3秒执行一次')
          }, 3000)
        }
      },
      initMyChart (data) {
        let myChart = echarts.init(document.getElementById('taskChart'))
        // 指定图表的配置项和数据
        var option = {
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
          },
          series: [
            {
              type: 'tree',
              id: 0,
              name: 'tree1',
              data: [data],
              top: '10%',
              left: '8%',
              bottom: '22%',
              right: '25%',
              symbolSize: 7,
              edgeShape: 'polyline',
              edgeForkPosition: '63%',
              initialTreeDepth: 3,
              lineStyle: {
                width: 2
              },
              label: {
                backgroundColor: '#fff',
                position: 'left',
                verticalAlign: 'middle',
                align: 'right'
              },
              leaves: {
                label: {
                  position: 'right',
                  verticalAlign: 'middle',
                  align: 'left'
                }
              },
              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        }

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
      },
      closeDialog () {
        this.cloudType = ''
        // this.templateData = {}
        this.formStatus.visible = false
        clearInterval(this.timer)
        this.$emit('closeCloudInstanceTemplateDialog')
      },
      getServerGroup (queryName) {
        queryServerGroupPage(queryName, '', 1, 20)
          .then(res => {
            this.serverGroupOptions = res.body.data
          })
      },
      getImage (queryName) {
        this.imageLoading = true
        var imageQueryParam = {
          queryName: queryName,
          cloudType: this.formStatus.cloudType,
          isActive: 1,
          regionId: this.templateData.regionId,
          page: 1,
          length: 10
        }
        fuzzyQueryCloudImagePage(imageQueryParam)
          .then(res => {
            this.imageOptions = res.body.data
            this.imageLoading = false
          })
      },
      getSecurityGroup (queryName) {
        this.securityGroupLoading = true
        var securityGroupQueryParam = {
          queryName: queryName,
          isActive: 1,
          extend: 0,
          vpcId: this.templateData.vpcId,
          page: 1,
          length: 20
        }
        queryCloudVPCSecurityGroupPage(securityGroupQueryParam)
          .then(res => {
            this.securityGroupOptions = res.body.data
            this.securityGroupLoading = false
          })
      },
      convertTaskData (memberList) {
        if (memberList === undefined || JSON.stringify(memberList) === '{}') {
          return []
        }
        console.log(JSON.stringify(memberList))
        var childrens = []
        for (var i = 0; i < memberList.length; i++) {
          var member = memberList[i]
          var name = member.hostname
          if (member.privateIp !== null && member.privateIp !== '') {
            name = name + ' (' + member.privateIp + ' )'
          }
          var children = {
            name: name,
            value: member.seq
          }
          childrens.push(children)
        }
        return childrens
      },
      queryTask () {
        queryLastCloudInstanceTaskByTemplateId(this.templateData.id)
          .then(res => {
            var taskDetail = res.body
            this.completedPercentage = taskDetail.completedPercentage
            let memberMap = taskDetail.memberMap
            if (taskDetail.id !== null) {
              var data = {
                name: 'task',
                children: [{
                  name: 'create instance',
                  children: this.convertTaskData(memberMap.CREATE_INSTANCE)
                }, {
                  name: 'allocate public ip',
                  children: this.convertTaskData(memberMap.ALLOCATE_PUBLIC_IP_ADDRESS)
                }, {
                  name: 'start instance',
                  children: this.convertTaskData(memberMap.STARTING)
                }, {
                  name: 'instance running',
                  children: this.convertTaskData(memberMap.RUNNING)
                }
                ]
              }
              this.initMyChart(data)
            }
          })
      },
      getEnvType () {
        queryEnvPage('', '', 1, 20)
          .then(res => {
            this.envTypeOptions = res.body.data
          })
      },
      convertVswitchData () {
        // if (this.vswitchData === null || this.vswitchData.length === 0) return
        this.vswitchTree = []
        for (var i = 0; i < this.vswitchData.length; i++) {
          var vsw = this.vswitchData[i]
          var vswitch = {
            vswitchId: vsw.vswitchId,
            label: vsw.vswitchName + ' ( 可用ip: ' + vsw.availableIpAddressCount + ' )'
          }
          this.vswitchTree.push(vswitch)
        }
      },
      getTemplateVSwitch (zoneId) {
        queryCloudInstanceTemplateVSwitch(this.templateData.id, zoneId)
          .then(res => {
            this.vswitchData = res.body
            this.convertVswitchData()
          })
      },
      selectionZone () {
        if (this.createInstanceData.zoneId !== '' && this.createInstanceData.zonePattern === 'single') {
          this.getTemplateVSwitch(this.createInstanceData.zoneId)
        }
      },
      initData (cloudType, templateData) {
        this.cloudType = cloudType
        this.templateData = templateData
        // 设置模版详情
        this.tableData = []
        this.tableData.push(templateData)
        this.createInstanceData = {
          templateId: templateData.id,
          serverGroupId: '',
          securityGroupId: templateData.securityGroupId,
          imageId: templateData.imageId,
          serverName: '',
          loginUser: 'root',
          loginType: 0,
          envType: 4,
          allocatePublicIpAddress: false,
          createSize: 1,
          zonePattern: 'auto',
          zoneId: '',
          vswitchIds: [],
          charge: {
            chargeType: false,
            period: 1,
            autoRenew: true
          }
        }
        if (templateData.vpcId !== '') {
          this.vpcId = templateData.vpcId
        }
        if (templateData.instanceTemplate != null && templateData.instanceTemplate.disk !== null) {
          this.data = templateData.instanceTemplate.disk
        } else {
          this.disk = {
            sysDisk: {
              size: 40,
              category: 'cloud_efficiency'
            },
            dataDisk: {
              size: 0,
              category: 'cloud_efficiency'
            }
          }
        }
        // 设置选中的配置项
        this.securityGroupOptions = []
        this.securityGroupOptions.push(templateData.securityGroup)
        this.imageOptions = []
        this.imageOptions.push(templateData.cloudImage)
      },
      fetchImageData () {
        var imageQueryParam = {
          queryName: this.queryImageParam.queryName,
          cloudType: this.formStatus.cloudType,
          isActive: 1,
          regionId: this.templateData.regionId,
          page: this.imagePagination.currentPage,
          length: this.imagePagination.pageSize
        }
        fuzzyQueryCloudImagePage(imageQueryParam)
          .then(res => {
            this.imagePagination.total = res.body.totalNum
          })
      },
      handlerCreate () {
        var requestBody = Object.assign({}, this.createInstanceData)
        requestBody.disk = this.disk
        try {
          requestBody.vswitchIds = this.$refs.vswitchTree.getCheckedKeys()
        } catch (e) {
        }
        createCloudInstance(requestBody)
          .then(res => {
            if (!res.success) {
              this.$message.error(res.msg)
            } else {
              this.$message({
                message: '任务执行中！',
                type: 'success'
              })
              this.activeName = 'task'
              this.setTimer()
              // this.templateData = res.body
            }
          })
      },
      fetchVPCData () {
        this.vpcTableLoading = true
        var zoneIds = []
        if (this.templateData.instanceTemplate !== null && this.templateData.instanceTemplate.zoneIds !== null) {
          zoneIds = this.templateData.instanceTemplate.zoneIds
        }
        var vpcQueryParam = {
          queryName: this.queryVPCParam.queryName,
          cloudType: this.formStatus.cloudType,
          isActive: 1,
          extend: 1,
          zoneIds: zoneIds,
          regionId: this.templateData.regionId,
          page: this.vpcPagination.currentPage,
          length: this.vpcPagination.pageSize
        }
        queryCloudVPCPage(vpcQueryParam)
          .then(res => {
            this.vpcTableData = res.body.data
            this.vpcPagination.total = res.body.totalNum
            this.vpcTableLoading = false
            this.convertVswitchData()
          })
      }
    }
  }
</script>

<style scoped>

</style>
