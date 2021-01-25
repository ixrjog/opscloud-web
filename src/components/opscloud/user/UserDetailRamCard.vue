<template>
  <el-card class="box-card" shadow="never" style="margin-top: 10px"
           v-if="JSON.stringify(userDetail.ramUsers) !== '[]'">
    <div slot="header" class="clearfix">阿里云RAM账户</div>
    <el-table :data="userDetail.ramUsers" style="width: 100%">
      <el-table-column prop="ramAccount" label="账户">
        <template slot-scope="props">
          <el-tooltip class="item" effect="light" content="点击打开登录连接" placement="top-start">
            <el-button style="padding: 3px 0" type="text" @click="handlerOpenLoginUrl(props.row)">
              {{ props.row.ramAccount }}
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="accessKeys" label="ak" width="80"></el-table-column>
      <el-table-column prop="expiredTime" label="策略">
        <template slot-scope="props">
          <div class="tag-group">
            <div v-for="item in props.row.policies" :key="item.id">
              <el-tooltip class="item" effect="light" :content="item.description" placement="top-start">
                <el-tag style="margin-left: 5px">{{ item.policyName }}</el-tag>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  props: ['userDetail'],
  name: 'UserDetailRamCard',
  methods: {
    handlerOpenLoginUrl (row) {
      window.open(row.ramAccountLoginUrl)
    }
  }
}
</script>

<style scoped>

</style>
