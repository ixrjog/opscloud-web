<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="30%" append-to-body>
    <el-form :model="assetNameData" label-width="80px"
             label-position="left" v-loading="adding" element-loading-text="资产名称添加中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="资产类型" prop="assetType" required>
        <el-select v-model.trim="assetNameData.assetType" placeholder="选择类型" allow-create filterable
                   ref="assetTypeSelect">
          <el-option
            v-for="item in assetTypeOptions"
            :key="item.id"
            :label="item.assetType"
            :value="item.assetType">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资产名称" prop="assetName">
        <el-input v-model.trim="assetNameData.assetName" ref="assetNameInput"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="assetNameData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="assetNameAdd" :disabled="adding">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
// API
import { queryOcItAssetTypeList, addAssetName } from '@api/it/it.asset'

const assetNameData = {
  assetType: '',
  assetName: '',
  remark: ''
}

export default {
  data () {
    return {
      title: '新增资产名称',
      assetNameData: assetNameData,
      assetTypeOptions: [],
      adding: false
    }
  },
  name: 'ItAssetNameDialog',
  props: ['formStatus'],
  mounted () {
    this.getAssetType()
  },
  methods: {
    initData () {
      this.assetNameData = Object.assign({}, assetNameData)
      this.adding = false
      this.$nextTick(() => { // 2. 弹框显示DOM更新完成后 获取refs.ref1 设置焦点
        this.$refs.assetNameInput.focus() // 设置焦点
      })
    },
    getAssetType () {
      this.assetTypeOptions = []
      queryOcItAssetTypeList()
        .then(res => {
          this.assetTypeOptions = res.body
        })
    },
    assetNameAdd () {
      this.adding = true
      addAssetName(this.assetNameData)
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
</style>
