<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="35%">
    <el-form :model="assetReturnData" label-width="120px" class="demo-ruleForm"
             v-loading="saving" element-loading-text="资产归还中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="资产编码" prop="assetCode" required>
        <el-input v-model.trim="assetReturnData.assetCode" readonly></el-input>
      </el-form-item>
      <el-form-item label="归还日期" prop="returnTime" required>
        <el-date-picker v-model="assetReturnData.returnTime" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="assetReturnAdd" :disabled="saving">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { returnAsset, updateReturnAsset } from '@api/it/it.asset'

export default {
  data () {
    return {
      title: '资产归还',
      assetReturnData: {
        assetId: '',
        assetCode: '',
        returnTime: Date.now().valueOf()
      },
      saving: false
    }
  },
  name: 'ItAssetApplyDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {},
  filters: {},
  methods: {
    initData (data) {
      this.saving = false
      if (this.formStatus.isUpdate) {
        this.assetReturnData = Object.assign({}, data)
        this.assetReturnData.returnTime = new Date(data.returnTime)
      } else {
        this.assetReturnData.assetId = data.assetId
        this.assetReturnData.assetCode = data.assetCode
      }
    },
    assetReturnAdd () {
      if (this.formStatus.isUpdate) {
        updateReturnAsset(this.assetReturnData)
          .then(res => {
            this.$message.success('保存成功')
            this.formStatus.visible = false
            this.$emit('closeDialog')
          })
      } else {
        this.saving = true
        returnAsset(this.assetReturnData)
          .then(res => {
            this.adding = false
            this.$message.success('保存成功')
            this.formStatus.visible = false
            this.$emit('closeDialog')
          })
      }
    }
  }
}
</script>

<style scoped>
</style>
