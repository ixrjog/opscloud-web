<template>
  <el-dialog :title="formStatus.isUpdate ? title.updateTitle : title.addTitle"
             :visible.sync="formStatus.visible">
    <el-alert v-if="!formStatus.isUpdate" description="相关内容建议使用Markdown语法"
              style="margin-bottom: 10px" center show-icon type="info" close-text="知道了">
    </el-alert>
    <el-form :model="faultInfoData" label-width="130px">
      <el-form-item label="故障标题" required>
        <el-input v-model.trim="faultInfoData.faultTitle" placeholder="请输入故障标题">
        </el-input>
      </el-form-item>
      <el-form-item label="故障级别" required>
        <el-select v-model="faultInfoData.faultLevel" clearable placeholder="故障级别" filterable>
          <el-option
            v-for="item in faultLevelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="故障归类" required>
        <el-select v-model.trim="faultInfoData.rootCauseTypeId"
                   filterable clearable remote placeholder="故障归类" :remote-method="getCauseType">
          <el-option
            v-for="item in causeTypeOptions"
            :key="item.id"
            :label="item.rootCauseType"
            :value="item.id">
          </el-option>
        </el-select>
        <el-input v-model.trim="newRootCauseType" class="input" placeholder="新增原因归类"></el-input>
        <el-tooltip class="item" effect="dark" content="新增原因归类" placement="top-start">
          <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" plain
                     :disabled="newRootCauseType ===''" @click="addCauseType()" style="margin-left: 10px"></el-button>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="故障时间" required>
        <el-date-picker
          v-model="faultInfoData.faultDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="故障现象" required>
        <editor v-model="faultInfoData.faultPerformance" @init="editorInit" lang="markdown" theme="chrome"
                height="200"></editor>
      </el-form-item>
      <el-form-item label="详细过程" required>
        <editor v-model="faultInfoData.faultDetail" @init="editorInit" lang="markdown" theme="chrome"
                height="200"></editor>
      </el-form-item>
      <el-form-item label="故障原因" required>
        <editor v-model="faultInfoData.rootCause" @init="editorInit" lang="markdown" theme="chrome"
                height="200"></editor>
      </el-form-item>
      <el-form-item label="造成影响" required>
        <editor v-model="faultInfoData.effect" @init="editorInit" lang="markdown" theme="chrome"
                height="200"></editor>
      </el-form-item>
      <el-form-item label="评级原因">
        <editor v-model="faultInfoData.faultJudge" @init="editorInit" lang="markdown" theme="chrome"
                height="200"></editor>
      </el-form-item>
      <el-form-item label="解决方案">
        <el-tooltip class="item" effect="dark" content="新增解决方案" placement="top-start">
          <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" plain
                     @click="handlerAddAction()" style="margin-left: 10px"></el-button>
        </el-tooltip>
      </el-form-item>
      <span v-for="(action, index)  in faultInfoData.todoAction" :key="index">
        <el-form-item :label="'Action' + (index +1)">
            <el-input v-model="action.faultAction"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="10">
            <el-form-item label="跟进人">
            <el-select v-model.trim="action.followUserId"
                       filterable clearable remote placeholder="输入关键词搜用户" :remote-method="getUser">
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.displayName"
                :value="user.id">
                <span style="float: left">{{ user.displayName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ user.username }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="截止日期">
            <el-date-picker v-model="action.deadline" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          </el-col>
        </el-row>
      </span>
      <el-form-item label="主要责任人">
        <el-select v-model.trim="faultInfoData.primaryResponsiblePersonIdList" value-key="username"
                   filterable clearable multiple remote placeholder="输入关键词搜用户" :remote-method="getUser">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.displayName"
            :value="user.id">
            <span style="float: left">{{ user.displayName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ user.username }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="次要责任人">
        <el-select v-model.trim="faultInfoData.secondaryResponsiblePersonIdList" value-key="username"
                   filterable clearable multiple remote placeholder="输入关键词搜用户" :remote-method="getUser">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.displayName"
            :value="user.id">
            <span style="float: left">{{ user.displayName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ user.username }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属团队">
        <el-input v-model.trim="faultInfoData.responsibleTeam" placeholder="请输入所属团队"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="handleSave">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { addRootCauseType, queryFaultRootCauseTypePage, saveFaultInfo } from '@api/fault/fault.info'
import { fuzzyQueryUserPage } from '@api/user/user'

const faultAction = {
  id: '',
  faultId: '',
  faultAction: '',
  followUserId: '',
  actionStatus: 1,
  deadline: ''
}

export default {
  data () {
    return {
      title: {
        addTitle: '新增故障信息',
        updateTitle: '变更故障信息'
      },
      newRootCauseType: '',
      causeTypeOptions: [],
      departmentOptions: [],
      faultInfoData: {},
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
      userOptions: []
    }
  },
  name: 'FaultInfoDialog',
  props: {
    formStatus: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  components: {
    editor: require('vue2-ace-editor')
  },
  mounted () {
    this.getCauseType()
  },
  methods: {
    editorInit: function () {
      require('brace/ext/language_tools')
      require('brace/mode/html')
      require('brace/mode/markdown')
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/yaml')
    },
    initData (data) {
      this.faultInfoData = Object.assign({}, data)
      if (this.formStatus.isUpdate) {
        let userList = []
        for (let user of this.faultInfoData.primaryResponsiblePerson) {
          userList.push(user)
        }
        for (let user of this.faultInfoData.secondaryResponsiblePerson) {
          userList.push(user)
        }
        for (let action of this.faultInfoData.todoAction) {
          userList.push(action.followUser)
        }
        this.userOptions = this.uniqueUserList(userList)
      } else {
        this.faultInfoData.todoAction = []
      }
    },
    uniqueUserList (userList) {
      let result = {}
      let finalResult = []
      for (let i = 0; i < userList.length; i++) {
        result[userList[i].id] = userList[i]
      }
      for (let item in result) {
        finalResult.push(result[item])
      }
      return finalResult
    },
    getUser (queryName) {
      let requestBody = {
        'queryName': queryName,
        'extend': 1,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
        })
    },
    getCauseType () {
      let requestBody = {
        'rootCauseType': this.faultInfoData.rootCauseType,
        'page': 1,
        'length': 20
      }
      queryFaultRootCauseTypePage(requestBody)
        .then(res => {
          this.causeTypeOptions = res.body.data
        })
    },
    addCauseType () {
      let requestBody = {
        'rootCauseType': this.newRootCauseType
      }
      addRootCauseType(requestBody)
        .then(res => {
          this.$message.success('新增原因归类成功')
          this.getCauseType(this.newRootCauseType)
          this.newRootCauseType = ''
        })
    },
    handlerAddAction () {
      let data = Object.assign({}, faultAction)
      data.faultId = this.faultInfoData.id
      this.faultInfoData.todoAction.push(data)
    },
    handleClick () {
      this.$emit('input', !this.value)
    },
    handleSave () {
      this.faultInfoData.startTime = this.faultInfoData.faultDate[0]
      this.faultInfoData.endTime = this.faultInfoData.faultDate[1]
      saveFaultInfo(this.faultInfoData)
        .then(res => {
          // 返回数据
          this.$message({
            message: '成功',
            type: 'success'
          })
          this.formStatus.visible = false
          this.$emit('closeFaultInfoDialog')
        })
    }
  }
}
</script>

<style scoped>
.input {
  max-width: 200px;
  width: 200px;
  margin-left: 10px;
}

</style>
22
