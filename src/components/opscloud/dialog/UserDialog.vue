<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible" :before-close="closeDialog">
    <el-form :model="user">
      <el-form-item label="用户名" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model.trim="user.username" :readonly="nameChecked" placeholder="请输入内容" @change="smartEmail()">
          <el-button slot="append" :icon="nameChecked?'el-icon-success':'el-icon-warning'"
                     @click="handlerCheck(user.username)" :disabled="nameChecked"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="密码" :label-width="formStatus.labelWidth" :required="formStatus.operationType">
        <el-input v-model="password" clearable placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-key" @click="getUserRandomPassword"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="显示名" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model="user.displayName" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="姓名" :label-width="formStatus.labelWidth">
        <el-input v-model="user.name" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="部门" :label-width="formStatus.labelWidth">
        <el-cascader v-model="cascaderValue" :options="deptOptions" :props="deptCascaderProps" @change="handleChange"
                     class="cascader" placeholder="选择需要加入的部门"></el-cascader>
        <el-button type="primary" icon="el-icon-refresh" @click="deptTreeRefresh" size="mini" plain
                   style="margin-left: 10px"></el-button>
      </el-form-item>
      <el-form-item label="电话" :label-width="formStatus.labelWidth">
        <el-input v-model="user.phone" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" :label-width="formStatus.labelWidth" :required="true">
        <el-input v-model.trim="user.email" placeholder="请输入内容" class="input"></el-input>
        <el-button-group style="margin-left: 10px">
          <el-tooltip class="item" effect="dark" content="查询邮箱" placement="top-start">
            <el-button type="primary" size="mini" icon="el-icon-search" plain
                       @click="queryEmail()"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="创建邮箱" placement="top-start">
            <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" plain :disabled="!canCreateEmail"
                       @click="createEmail()"></el-button>
          </el-tooltip>
        </el-button-group>
      </el-form-item>
      <el-form-item label="微信" :label-width="formStatus.labelWidth">
        <el-input v-model="user.wechat" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="留言" :label-width="formStatus.labelWidth">
        <el-input v-model="user.comment" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="角色" :label-width="formStatus.labelWidth" v-if="formStatus.operationType">
        <el-checkbox v-model="user.isRD">研发工程师(授权dev角色)</el-checkbox>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="saveInfo">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { getRandomPassword, updateUser, createUser, checkUsername } from '@api/user/user'
import { queryDepartmentTreeV2, refreshDepartmentTreeV2 } from '@api/org/org'
import { checkUser, createUserMail } from '@api/tencent/tencent.exmail.user'

export default {
  data () {
    return {
      nameChecked: false,
      user: '',
      password: '',
      rootDeptId: 0,
      deptOptions: [],
      deptCascaderProps: {
        multiple: true,
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      emailChecked: false,
      canCreateEmail: false,
      cascaderValue: []
    }
  },
  name: 'UserDialog',
  props: ['formStatus'],
  mounted () {
  },
  methods: {
    closeDialog () {
      this.password = ''
      this.formStatus.visible = false
      this.$emit('closeDialog')
    },
    initData (user) {
      this.user = user
      this.nameChecked = false
      this.emailChecked = false
      this.canCreateEmail = false
      this.cascaderValue = []
      this.getDepartmentTree()
      if (!this.formStatus.operationType) {
        this.nameChecked = true
      }
    },
    getUserRandomPassword () {
      getRandomPassword()
        .then(res => {
          this.password = res.body
        })
    },
    handlerCheck (username) {
      if (username === '') {
        this.$message.warning('请输入用户名')
        return
      }
      checkUsername(username)
        .then(res => {
          this.nameChecked = res.success
          if (this.nameChecked) {
            this.$message.success('校验通过')
            this.nameChecked = true
            this.smartEmail()
          }
        })
    },
    getDepartmentTree () {
      queryDepartmentTreeV2()
        .then(res => {
          this.deptOptions = res.body
        })
    },
    deptTreeRefresh () {
      this.$message.info('数据刷新中')
      refreshDepartmentTreeV2()
        .then(res => {
          this.deptOptions = res.body
          this.$message.success('数据刷新完成')
        })
    },
    handleChange (value) {
      this.user.deptIdList = []
      value.map(deptIds => {
        this.user.deptIdList.push(deptIds[(deptIds.length - 1)])
      })
    },
    queryEmail () {
      this.canCreateEmail = false
      if (this.user.email === '') {
        this.$message.warning('请输入邮箱')
        return
      }
      checkUser(this.user.email)
        .then(res => {
          this.emailChecked = res.success
          if (this.emailChecked) {
            this.$message.success('校验通过')
            this.emailChecked = true
            this.canCreateEmail = true
          }
        })
    },
    createEmail () {
      let requestBody = {
        userid: this.user.email,
        name: this.user.displayName,
        department: [1],
        mobile: this.user.phone
      }
      this.$message.info('用户邮箱创建中')
      createUserMail(requestBody)
        .then(res => {
          this.canCreateEmail = false
          this.$message.success('用户邮箱创建成功')
        })
    },
    smartEmail () {
      this.user.email = this.user.username + '@xinc818.group'
    },
    saveInfo () {
      if (!this.nameChecked) {
        this.$message.warning('请先校验用户名')
        return
      }
      setTimeout(() => {
        let requestBody = Object.assign({}, this.user)
        requestBody.password = this.password
        if (this.formStatus.operationType) {
          createUser(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.closeDialog()
            })
        } else {
          updateUser(requestBody)
            .then(res => {
              // 返回数据
              this.$message({
                message: '成功',
                type: 'success'
              })
              this.closeDialog()
            })
        }
      }, 600)
    }
  }
}
</script>

<style scoped>
.cascader {
  display: inline-block;
  max-width: 300px;
  width: 300px;
}

.input {
  max-width: 300px;
  width: 300px;
}
</style>
