<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible" width="35%">
    <el-form :model="assetDisposeData" label-width="120px" class="demo-ruleForm"
             label-position="left" v-loading="saving" element-loading-text="资产归还中"
             element-loading-spinner="el-icon-loading">
      <el-form-item label="资产编码">
        <el-input v-model.trim="assetCode" readonly></el-input>
      </el-form-item>
      <el-form-item label="处置方式">
        <el-select v-model="assetDisposeData.disposeType" placeholder="选择处置方式">
          <el-option
            v-for="item in disposeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="处置日期">
        <el-date-picker v-model="assetDisposeData.disposeTime" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="assetDisposeData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="assetDisposeAdd" :disabled="saving">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>

// API
import { disposeAsset } from '@api/it/it.asset'

const assetDisposeData = {
  assetId: '',
  disposeType: 1,
  disposeTime: Date.now().valueOf(),
  remark: ''
}

export default {
  data () {
    return {
      title: '资产处置',
      assetDisposeData: {},
      saving: false,
      disposeTypeOptions: [{
        value: 1,
        label: '退租'
      }, {
        value: 2,
        label: '报废清理'
      }, {
        value: 3,
        label: '盘亏处理'
      }, {
        value: 4,
        label: '转让出售'
      }, {
        value: 5,
        label: '维修处理'
      }],
      assetCode: ''
    }
  },
  name: 'ItAssetDisposeDialog',
  props: ['formStatus'],
  mounted () {
  },
  components: {},
  filters: {},
  methods: {
    initData (data) {
      this.saving = false
      this.assetDisposeData = Object.assign({}, assetDisposeData)
      this.assetDisposeData.assetId = data.assetId
      this.assetCode = data.assetCode
    },
    assetDisposeAdd () {
      disposeAsset(this.assetDisposeData)
        .then(res => {
          this.$message.success('资产处置成功')
          this.formStatus.visible = false
          this.$emit('closeDialog')
        })
    }
  }
}
</script>

<style scoped>
</style>
