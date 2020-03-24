<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :before-close="closeDialog"
             :visible.sync="formStatus.visible">
    <el-tabs v-model="activeName">
      <el-tab-pane label="模版" name="template">
        <el-form :model="templateData">
          <el-form-item label="模版名称" :label-width="formStatus.labelWidth" :required="true">
            <el-input v-model="templateData.templateName" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item label="模版内容" :label-width="formStatus.labelWidth">
            <editor v-model="templateData.templateYAML" @init="editorInit" lang="yaml" theme="chrome"
                    width="1000"
                    height="420" :options="aceOptions"></editor>
          </el-form-item>
          <div style="width:100%;text-align:center">
            <el-button align="center" type="success" size="mini" @click="saveInfoYAML">保存YAML</el-button>
          </div>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="实例类型" name="instanceType">
        <el-form :model="templateData">
          <el-select v-model="queryInstanceTypeParam.regionId" clearable placeholder="地区">
            <el-option
              v-for="item in regionOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-input v-model="queryInstanceTypeParam.queryName" placeholder="关键字查询"
                    v-show="queryInstanceTypeParam.regionId != null && queryInstanceTypeParam.regionId != ''"
                    style="display: inline-block; max-width:200px; margin-left: 5px"/>
          <el-select v-model="queryInstanceTypeParam.cpuCoreCount" clearable placeholder="cpu规格"
                     style="margin-left: 5px">
            <el-option v-for="item in cpuOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-button size="mini" @click="fetchInstanceTypeData" style="margin-left: 5px"
                     v-show="queryInstanceTypeParam.regionId != null && queryInstanceTypeParam.regionId != ''">查询
          </el-button>
          <el-button size="mini" @click="syncInstanceType" style="margin-left: 5px">同步</el-button>
          <el-table :data="instanceTypeTableData" style="width: 100%" v-loading="instanceTypeTableLoading">
            <el-table-column label="实例类型">
              <template scope="scope">
                <el-radio v-model="typeId" :label="scope.row.instanceTypeId"
                          @change.native="getTypeRow(scope.$index,scope.row)"></el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="instanceTypeFamily" label="类型族" width="100"></el-table-column>
            <el-table-column v-if="false" prop="instanceTypeId" label="实例类型"></el-table-column>
            <el-table-column prop="zones" label="可用区">
              <template slot-scope="props">
                <div class="tag-group">
                  <el-tag style="margin-left: 5px"
                          v-for="item in props.row.zones"
                          :key="item">{{ item }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cpuCoreCount" label="cpu" width="80"></el-table-column>
            <el-table-column prop="memorySize" label="内存(GiB)" width="80"></el-table-column>
            <el-table-column fixed="right" label="操作" v-if="false" width="200">
              <template slot-scope="scope">
                <el-button :type="scope.row.isActive === 0 ? 'success' : 'info'" plain size="mini"
                           @click="setItemActive(scope.row)">{{scope.row.isActive === 0 ? '有效' : '无效'}}
                </el-button>
                <el-button type="primary" plain size="mini" @click="addItem(scope.row)"
                           v-show="scope.row.serverStatus == 0">
                  导入
                </el-button>
                <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="instanceTypePaginationCurrentChange"
                         layout="prev, pager, next" :total="instanceTypePagination.total"
                         :current-page="instanceTypePagination.currentPage"
                         :page-size="instanceTypePagination.pageSize">
          </el-pagination>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="镜像" name="image">
        <el-form :model="templateData">
          <el-input v-model="queryImageParam.queryName" placeholder="关键字查询"
                    style="display: inline-block; max-width:200px; margin-left: 5px"/>
          <el-button size="mini" @click="fetchImageData" style="margin-left: 5px"
                     :disabled="templateData.regionId == null || templateData.regionId == ''">查询
          </el-button>
          <el-table :data="imageTableData" style="width: 100%" v-loading="imageTableLoading">
            <el-table-column label="实例类型">
              <template scope="scope">
                <el-radio v-model="imageId" :label="scope.row.imageId"
                          @change.native="getImageRow(scope.$index,scope.row)"></el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="imageName" label="镜像名称"></el-table-column>
            <el-table-column prop="regionId" label="regionId"></el-table-column>
            <el-table-column prop="imageSize" label="容量(GiB)"></el-table-column>
          </el-table>
          <el-pagination background @current-change="imagePaginationCurrentChange"
                         layout="prev, pager, next" :total="imagePagination.total"
                         :current-page="imagePagination.currentPage"
                         :page-size="imagePagination.pageSize">
          </el-pagination>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="VPC" name="vpc">
        <el-form :model="templateData">
          <el-input v-model="queryVPCParam.queryName" placeholder="关键字查询"
                    style="display: inline-block; max-width:200px; margin-left: 5px"/>
          <el-button size="mini" @click="fetchVPCData" style="margin-left: 5px"
                     :disabled="templateData.regionId == null || templateData.regionId == ''">查询
          </el-button>
          <el-table :data="vpcTableData" style="width: 100%" v-loading="vpcTableLoading">
            <el-table-column label="实例类型">
              <template scope="scope">
                <el-radio v-model="vpcId" :label="scope.row.vpcId"
                          @change.native="getVPCRow(scope.$index,scope.row)"></el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="vpcName" label="vpc名称"></el-table-column>
            <el-table-column prop="regionId" label="regionId"></el-table-column>
            <el-table-column prop="vswitchMap" label="虚拟交换机" width="400">
              <template slot-scope="scope">
                <el-tree :data="scope.row.vswitchData" show-checkbox ref="vswitchTree" node-key="vswitchId"></el-tree>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination background @current-change="vpcPaginationCurrentChange"
                         layout="prev, pager, next" :total="vpcPagination.total"
                         :current-page="vpcPagination.currentPage"
                         :page-size="vpcPagination.pageSize">
          </el-pagination>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">关闭</el-button>
      <el-button type="primary" size="mini" @click="saveInfo">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
  // api
  import {
    fuzzyQueryCloudInstanceTypePage, syncCloudInstanceTypeByType, queryCloudRegionList,
    queryCloudCpuList, saveCloudInstanceTemplate, saveCloudInstanceTemplateYAML
  } from '@api/cloud/cloud.instance.js'
  import { fuzzyQueryCloudImagePage } from '@api/cloud/cloud.image.js'
  import { fuzzyQueryCloudVPCPage } from '@api/cloud/cloud.vpc.js'

  export default {
    name: 'CloudInstanceTemplateDialog',
    data () {
      return {
        loading: false,
        activeName: 'template',
        templateData: {},
        instanceTypeTableData: [],
        queryInstanceTypeParam: {
          regionId: '',
          extend: 1,
          queryName: '',
          cpuCoreCount: ''
        },
        instanceTypeTableLoading: false,
        instanceTypePagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        typeId: '',
        typeSelection: {},
        regionOptions: [],
        cpuOptions: [],
        cloudType: '',
        // image
        queryImageParam: {
          queryName: ''
        },
        imageId: '',
        imageTableData: [],
        imagePagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        imageSelection: {},
        imageTableLoading: false,
        // vpc
        queryVPCParam: {
          queryName: ''
        },
        vpcId: '',
        vpcTableData: [],
        vpcPagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        vpcSelection: {},
        vpcTableLoading: false,
        // ace
        aceOptions: {
          // vue2-ace-editor编辑器配置自动补全等
          enableBasicAutocompletion: true,
          enableSnippets: true,
          // 自动补全
          enableLiveAutocompletion: true
        }
      }
    },
    props: ['formStatus'],
    mixins: [],
    components: {
      editor: require('vue2-ace-editor')
    },
    mounted () {
    },
    methods: {
      closeDialog () {
        this.cloudType = ''
        // this.templateData = {}
        this.formStatus.visible = false
        this.$emit('closeCloudInstanceTemplateDialog')
      },
      getRegion () {
        queryCloudRegionList(this.cloudType)
          .then(res => {
            this.regionOptions = res.body
          })
      },
      getCpu () {
        queryCloudCpuList(this.cloudType)
          .then(res => {
            this.cpuOptions = res.body
          })
      },
      getTypeRow (index, row) {
        this.typeSelection = row
      },
      getImageRow (index, row) {
        this.imageSelection = row
      },
      getVPCRow (index, row) {
        this.vpcSelection = row
      },
      editorInit: function () {
        // language extension prerequsite...
        require('brace/ext/language_tools')
        require('brace/mode/html')
        // language
        require('brace/mode/yaml')
        require('brace/mode/less')
        require('brace/theme/chrome')
        // snippet
        require('brace/snippets/yaml')
      },
      initData (cloudType, templasteData) {
        this.cloudType = cloudType
        this.templateData = templasteData
        this.getRegion()
        this.getCpu()
      },
      syncInstanceType () {
        this.syncLoading = true
        setTimeout(() => {
          syncCloudInstanceTypeByType(this.cloudType)
            .then(res => {
              this.$message({
                message: '后台同步数据中',
                type: 'success'
              })
              this.fetchData()
              this.syncLoading = false
            })
        }, 300)
      },
      instanceTypePaginationCurrentChange (currentPage) {
        this.instanceTypePagination.currentPage = currentPage
        this.fetchInstanceTypeData()
      },
      imagePaginationCurrentChange (currentPage) {
        this.imagePagination.currentPage = currentPage
        this.fetchImageData()
      },
      vpcPaginationCurrentChange (currentPage) {
        this.vpcPagination.currentPage = currentPage
        this.fetchVPCData()
      },
      fetchInstanceTypeData () {
        this.instanceTypeTableLoading = true
        var requestBody = Object.assign({}, this.queryInstanceTypeParam)
        requestBody.cloudType = this.cloudType
        requestBody.page = this.instanceTypePagination.currentPage
        requestBody.length = this.instanceTypePagination.pageSize
        fuzzyQueryCloudInstanceTypePage(requestBody)
          .then(res => {
            this.instanceTypeTableData = res.body.data
            this.instanceTypePagination.total = res.body.totalNum
            this.instanceTypeTableLoading = false
          })
      },
      fetchImageData () {
        this.imageTableLoading = true
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
            this.imageTableData = res.body.data
            this.imagePagination.total = res.body.totalNum
            this.imageTableLoading = false
          })
      },
      convertVswitchData () {
        if (this.vpcTableData === null || this.vpcTableData.length === 0) return
        for (var i = 0; i < this.vpcTableData.length; i++) {
          var vswitchData = []
          var row = this.vpcTableData[i]
          for (var key in row.vswitchMap) {
            var children = []
            var vswList = row.vswitchMap[key]
            for (var index in vswList) {
              var vsw = vswList[index]
              var vswChildren = {
                vswitchId: vsw.vswitchId,
                label: vsw.vswitchName + ' (' + vsw.cidrBlock + ' : ' + vsw.availableIpAddressCount + ')'
              }
              children.push(vswChildren)
            }
            var zone = {
              label: key + ' (' + children.length + ')',
              children: children
            }
            vswitchData.push(zone)
          }
          row.vswitchData = vswitchData
        }
      },
      fetchVPCData () {
        this.vpcTableLoading = true
        var vpcQueryParam = {
          queryName: this.queryVPCParam.queryName,
          cloudType: this.formStatus.cloudType,
          isActive: 1,
          extend: 1,
          regionId: this.templateData.regionId,
          page: this.vpcPagination.currentPage,
          length: this.vpcPagination.pageSize
        }
        fuzzyQueryCloudVPCPage(vpcQueryParam)
          .then(res => {
            this.vpcTableData = res.body.data
            this.vpcPagination.total = res.body.totalNum
            this.vpcTableLoading = false
            this.convertVswitchData()
          })
      },
      saveInfoYAML () {
        saveCloudInstanceTemplateYAML(this.templateData)
          .then(res => {
            if (!res.success) {
              this.$message.error(res.msg)
            } else {
              this.$message({
                message: 'YAML保存成功！',
                type: 'success'
              })
              this.templateData = res.body
            }
          })
      },
      saveInfo () {
        if (this.queryInstanceTypeParam.regionId !== '') {
          this.templateData.regionId = this.queryInstanceTypeParam.regionId
        }
        // 保存实例类型
        if (this.typeId !== '') {
          var instance = {
            typeId: this.typeId
          }
          this.templateData.instanceTemplate.instance = instance
        }
        // 保存镜像
        if (this.imageId !== '') {
          this.templateData.imageId = this.imageId
          this.templateData.instanceTemplate.imageId = this.imageId
        }
        // 保存vpc/vswitch
        if (this.vpcId !== '') {
          this.templateData.vpcId = this.vpcId
          this.templateData.vswithcShecked = this.$refs.vswitchTree.getCheckedKeys()
        }
        saveCloudInstanceTemplate(this.templateData)
          .then(res => {
            if (!res.success) {
              this.$message.error(res.msg)
            } else {
              this.$message({
                message: '模版保存成功！',
                type: 'success'
              })
              this.templateData = res.body
            }
          })
      }
    }
  }
</script>

<style scoped>

</style>
