<template>
  <el-card class="box-card" shadow="never" style="margin-bottom: 10px"
           v-if="JSON.stringify(userDetail.assets) !== '[]'" >
    <div slot="header" class="clearfix">资产</div>
    <el-table :data="userDetail.assets" style="width: 100%">
      <el-table-column prop="assetCode" label="资产编码">
        <template slot-scope="props">
          <span style="color: #20a9d9">{{ props.row.assetCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="assetName" label="资产名称"></el-table-column>
      <el-table-column prop="useTime" label="领用日期"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  props: ['userDetail'],
  name: 'UserDetailAssetCard'
}
</script>

<style scoped>

</style>
