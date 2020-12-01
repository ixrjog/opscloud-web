<template>
  <el-dialog :title="formStatus.operationType ? formStatus.addTitle : formStatus.updateTitle"
             :visible.sync="formStatus.visible" width="35%" v-loading="loading">
    <el-form :model="assetData" ref="assetDataForm" :rules="rules" label-width="120px" class="demo-ruleForm"
             label-position="left" v-loading="adding" element-loading-text="资产保存中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="资产编码" prop="assetCode" required>
        <el-input v-model.trim="assetData.assetCode" :readonly="codeChecked">
          <el-button slot="append" :icon="codeChecked?'el-icon-success':'el-icon-warning'"
                     @click="handlerCheck(assetData.assetCode)" :disabled="codeChecked"></el-button>
        </el-input>
        <el-alert type="warning" show-icon :closable="false">
          <el-row>1. 资产编码只能包含字母、数字和中划线（-）</el-row>
          <el-row>2. 资产编码一旦创建，则无法修改</el-row>
        </el-alert>
      </el-form-item>
      <el-form-item label="资产名称" prop="assetNameIds" required>
        <el-cascader v-model="assetData.assetNameIds" :options="assetTypeOptions"
                     expandTrigger="hover" @change="handleChange"></el-cascader>
        <el-button-group style="margin-left:5px">
          <el-button type="primary" icon="el-icon-circle-plus-outline" @click="assetNameAdd" size="mini"
                     plain></el-button>
          <el-button type="primary" icon="el-icon-refresh" @click="assetTypeTreeRefresh" size="mini" plain></el-button>
        </el-button-group>
      </el-form-item>
      <el-form-item label="资产状态" prop="assetStatus" required>
        <el-select v-model="assetData.assetStatus" placeholder="选择状态" disabled>
          <el-option
            v-for="item in assetStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属/承租公司" prop="assetCompany" required>
        <el-select v-model="assetData.assetCompany" placeholder="选择公司">
          <el-option
            v-for="item in companyOptions"
            :key="item.id"
            :label="item.assetCompanyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="购置/起租日期" prop="assetAddTimestamp" required>
        <el-date-picker v-model="assetData.assetAddTimestamp" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="assetData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="assetAdd" :disabled="adding">创建</el-button>
    </div>
    <it-asset-name-dialog ref="itAssetNameDialog" :formStatus="itAssetNameDialogStatus"
                          @closeDialog="getAssetTypeTree"></it-asset-name-dialog>
  </el-dialog>
</template>

<script>
import ItAssetNameDialog from '@/components/opscloud/it/ItAssetNameDialog'

// API
import {
  assetCodeCheck,
  queryAssetTypeTree,
  queryOcItAssetCompanyAll,
  refreshAssetTypeTree,
  saveAsset
} from '@api/it/it.asset'

const assetData = {
  id: '',
  assetCompany: '',
  assetCode: '',
  assetNameId: '',
  assetNameIds: [],
  assetStatus: 1,
  assetAddTimestamp: Date.now().valueOf(),
  remark: ''
}

export default {
  data () {
    return {
      assetData: assetData,
      itAssetNameDialogStatus: {
        visible: false
      },
      companyOptions: [],
      assetTypeOptions: [],
      assetStatusOptions: [{
        value: 1,
        label: '空闲'
      }, {
        value: 2,
        label: '在用'
      }, {
        value: 3,
        label: '借用'
      }, {
        value: 4,
        label: '报废'
      }],
      codeChecked: false,
      adding: false,
      rules: {
        assetCode: [
          { required: true, message: '请输入资产编码', trigger: 'blur' }
        ],
        assetCompany: [
          { required: true, message: '请选择所属/承租公司', trigger: 'change' }
        ]
      },
      loading: false
    }
  },
  name: 'ItAssetDialog',
  props: ['formStatus'],
  mounted () {
    this.getCompany()
    this.getAssetTypeTree()
  },
  components: {
    ItAssetNameDialog
  },
  filters: {},
  methods: {
    initData (data) {
      this.adding = false
      this.loading = false
      if (data.id === 0) {
        this.assetData = Object.assign({}, assetData)
      } else {
        this.assetData = Object.assign({}, data)
      }
      if (this.formStatus.operationType) {
        this.codeChecked = false
      } else {
        this.codeChecked = true
      }
    },
    getCompany () {
      queryOcItAssetCompanyAll()
        .then(res => {
          this.companyOptions = res.body
        })
    },
    getAssetTypeTree () {
      queryAssetTypeTree()
        .then(res => {
          this.assetTypeOptions = res.body
        })
    },
    assetTypeTreeRefresh () {
      this.$message.info('数据刷新中')
      this.loading = true
      refreshAssetTypeTree()
        .then(res => {
          this.assetTypeOptions = res.body
          this.$message.success('数据刷新完成')
          this.loading = false
        })
    },
    handlerCheck (assetCode) {
      if (assetCode === '') {
        this.$message.error('请输入资产编码')
        return
      }
      assetCodeCheck(assetCode)
        .then(res => {
          this.nameCheck = res.success
          if (this.nameCheck) {
            this.$message.success('校验通过')
            this.codeChecked = true
          }
        })
    },
    handleChange (value) {
      this.assetData.assetNameId = value[(value.length - 1)]
      console.log(this.assetData.assetNameId)
    },
    assetNameAdd () {
      this.itAssetNameDialogStatus.visible = true
      this.$refs.itAssetNameDialog.initData()
    },
    assetAdd () {
      this.$refs.assetDataForm.validate((valid) => {
        if (valid) {
          if (!this.codeChecked) {
            this.$message.error('请先校验资产编码')
            return
          }
          this.adding = true
          saveAsset(this.assetData)
            .then(res => {
              this.adding = false
              this.$message.success('保存成功')
              this.formStatus.visible = false
              this.$emit('closeDialog')
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.span-font {
  font-size: 6px;
  color: #99a9bf;
}
</style>
