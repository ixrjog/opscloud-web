<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="50%">
    <el-row :gutter="24" style="margin-bottom: 5px">
      <el-select v-model="helpdeskType" placeholder="HelpDesk类型" class="select" value-key="value" @change="handlerAdd()">
        <el-option
          v-for="item in helpdeskTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item">
        </el-option>
      </el-select>
      <el-button type="primary" plain size="mini" @click="handlerAdd()" style="margin-left: 10px">添加
      </el-button>
    </el-row>
    <el-divider></el-divider>
    <el-form v-model="helpdeskData" label-width="120px">
      <el-form-item label="HelpDesk时间">
        <el-date-picker v-model="helpdeskData.helpdeskTime" type="week" placeholder="选择周"
                        format="yyyy 第 WW 周">
        </el-date-picker>
      </el-form-item>
      <el-row v-for="helpdesk in helpdeskData.helpdeskReportList" :key="helpdesk.helpdeskType">
        <el-col :span="6">
          <el-form-item :label="helpdesk.helpdeskName">
            <el-input-number v-model="helpdesk.helpdeskCnt" label="HelpDesk次数"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="说明">
            <el-input v-model="helpdesk.comment"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-form-item>
            <el-button @click.prevent="handlerDel(helpdesk)">删除</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="handlerSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { saveHelpdeskReport } from '@api/helpdesk/helpdesk'

const helpdesk = {
  helpdeskName: '',
  helpdeskType: '',
  helpdeskTime: '',
  helpdeskCnt: 0,
  comment: ''
}

export default {
  data () {
    return {
      title: '新增HelpDesk',
      helpdeskData: {},
      helpdeskType: {
        value: 0,
        label: '桌面维护'
      },
      helpdeskTypeOptions: [{
        value: 0,
        label: '桌面维护'
      }, {
        value: 1,
        label: '资产管理'
      }, {
        value: 2,
        label: '网络管理'
      }, {
        value: 3,
        label: '用户管理'
      }, {
        value: 4,
        label: '邮箱管理'
      }, {
        value: 5,
        label: 'IT知识库'
      }, {
        value: 6,
        label: '监控管理'
      }, {
        value: 7,
        label: '行为管理'
      }]
    }
  },
  name: 'HelpDeskTable',
  props: ['formStatus'],
  mounted () {
  },
  components: {},
  filters: {},
  methods: {
    initData () {
      this.helpdeskData = {
        helpdeskTime: Date.now(),
        helpdeskReportList: []
      }
    },
    handlerAdd () {
      let data = Object.assign({}, helpdesk)
      data.helpdeskName = this.helpdeskType.label
      data.helpdeskTime = this.helpdeskData.helpdeskTime.valueOf()
      data.helpdeskType = this.helpdeskType.value
      this.helpdeskData.helpdeskReportList.push(data)
    },
    handlerDel (item) {
      let index = this.helpdeskData.helpdeskReportList.indexOf(item)
      if (index !== -1) {
        this.helpdeskData.helpdeskReportList.splice(index, 1)
      }
    },
    handlerSave () {
      let requestBody = {
        'helpdeskReportList': []
      }
      this.helpdeskData.helpdeskReportList.map(value => {
        if (value.helpdeskCnt !== 0) {
          requestBody.helpdeskReportList.push({
            helpdeskType: value.helpdeskType,
            helpdeskTime: value.helpdeskTime,
            helpdeskCnt: value.helpdeskCnt,
            comment: value.comment
          })
        }
      })
      if (JSON.stringify(requestBody.helpdeskReportList) === '[]') {
        this.$message.warning('请新增至少一个HelpDesk类型')
        return
      }
      saveHelpdeskReport(requestBody)
        .then(res => {
          this.adding = false
          this.$message.success('保存成功')
          this.formStatus.visible = false
          this.$emit('closeDialog')
        })
    }
  }
}
</script>

<style scoped>
.select {
  display: inline-block;
  max-width: 200px;
  margin-left: 10px
}
</style>
