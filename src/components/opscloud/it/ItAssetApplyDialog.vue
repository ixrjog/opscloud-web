<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="35%">
    <el-form :model="assetApplyData" ref="assetApplyDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
             label-position="left" v-loading="saving" element-loading-text="资产申请中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="资产编码" prop="assetCode" required>
        <el-input v-model.trim="assetApplyData.assetCode" readonly></el-input>
      </el-form-item>
      <el-form-item label="申领方式" prop="applyType" required>
        <el-select v-model="assetApplyData.applyType" placeholder="选择申领方式">
          <el-option
            v-for="item in applyTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="领用人" prop="userId" required>
        <el-select v-model="assetApplyData.userId" filterable remote reserve-keyword placeholder="搜索用户"
                   :remote-method="getUser">
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.displayName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="使用部门" prop="userOrgDeptId" required>
        <el-select v-model="assetApplyData.userOrgDeptId" filterable remote reserve-keyword placeholder="搜索部门"
                   :remote-method="getOrgDept">
          <el-option
            v-for="item in orgDeptOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="领用/借用日期" prop="applyTime" required>
        <el-date-picker v-model="assetApplyData.applyTime" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="预计归还日期" prop="expectReturnTime" v-if="assetApplyData.applyType === 2">
        <el-date-picker v-model="assetApplyData.expectReturnTime" type="date" placeholder="选择日期"
                        value-format="timestamp">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="assetApplyAdd" :disabled="saving">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { applyAsset } from '@api/it/it.asset'
import { fuzzyQueryUserPage } from '@api/user/user'
import { queryFirstLevelDepartmentPage } from '@api/org/org'
import { updateAssetApply } from '@api/it/it.asset.apply'

const assetApplyData = {
  userId: '',
  userOrgDeptId: '',
  applyType: 1,
  applyTime: Date.now().valueOf(),
  expectReturnTime: ''
}

export default {
  data () {
    return {
      title: '资产申请',
      assetApplyData: assetApplyData,
      userOptions: [],
      orgDeptOptions: [],
      applyTypeOptions: [{
        value: 1,
        label: '使用'
      }, {
        value: 2,
        label: '借用'
      }],
      saving: false,
      rules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        userOrgDeptId: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ]
      }
    }
  },
  name: 'ItAssetApplyDialog',
  props: ['formStatus'],
  mounted () {
    this.getOrgDept('')
  },
  components: {},
  filters: {},
  methods: {
    initData (data) {
      this.saving = false
      if (this.formStatus.isUpdate) {
        this.assetApplyData = Object.assign({}, data)
        this.assetApplyData.applyTime = new Date(data.applyTime)
        if (data.expectReturnTime !== null) {
          this.assetApplyData.expectReturnTime = new Date(data.expectReturnTime)
        }
        let user = {
          id: data.userId,
          displayName: data.displayName
        }
        this.userOptions = []
        this.userOptions.push(user)
        let orgDept = {
          id: data.userOrgDeptId,
          name: data.userOrgDeptName
        }
        this.orgDeptOptions = []
        this.orgDeptOptions.push(orgDept)
      } else {
        this.assetApplyData = Object.assign({}, assetApplyData)
        this.assetApplyData.assetId = data.id
        this.assetApplyData.assetCode = data.assetCode
      }
    },
    getUser (queryName) {
      let requestBody = {
        'queryName': queryName,
        'extend': 0,
        'page': 1,
        'length': 20
      }
      fuzzyQueryUserPage(requestBody)
        .then(res => {
          this.userOptions = res.body.data
        })
    },
    getOrgDept (queryName) {
      let requestBody = {
        'queryName': queryName,
        'page': 1,
        'length': 20
      }
      queryFirstLevelDepartmentPage(requestBody)
        .then(res => {
          this.orgDeptOptions = res.body.data
        })
    },
    assetApplyAdd () {
      this.$refs.assetApplyDataForm.validate((valid) => {
        if (valid) {
          if (!this.formStatus.isUpdate) {
            this.saving = true
            applyAsset(this.assetApplyData)
              .then(res => {
                this.adding = false
                this.$message.success('保存成功')
                this.formStatus.visible = false
                this.$emit('closeDialog')
              })
          } else {
            updateAssetApply(this.assetApplyData)
              .then(res => {
                this.$message.success('保存成功')
                this.formStatus.visible = false
                this.$emit('closeDialog')
              })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
