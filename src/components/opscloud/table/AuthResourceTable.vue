<template>
  <div>
    <el-row :gutter="24" style="margin-bottom: 5px">
      <el-select v-model="queryParam.groupId" filterable clearable
                 remote reserve-keyword placeholder="输入关键词搜索资源组" :remote-method="getGroup" :loading="loading"
                 style="display: inline-block; max-width:200px">
        <el-option
          v-for="item in groupOptions"
          :key="item.id"
          :label="item.groupCode"
          :value="item.id">
        </el-option>
      </el-select>
      <el-input v-model="queryParam.resourceName" placeholder="资源路径"
                style="display: inline-block; max-width:200px; margin-left: 5px"/>
      <el-select v-model="queryParam.needAuth" clearable placeholder="鉴权" style="margin-left: 5px">
        <el-option
          v-for="item in authOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button @click="fetchData" style="margin-left: 5px">查询</el-button>
      <el-button @click="addItem" style="margin-left: 5px">新增</el-button>
    </el-row>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="groupCode" label="资源组"></el-table-column>
      <el-table-column prop="resourceName" label="资源路径"></el-table-column>
      <el-table-column prop="comment" label="描述"></el-table-column>
      <el-table-column prop="needAuth" label="鉴权">
        <template slot-scope="scope">
          <el-tag :type="scope.row.needAuth === 0 ? 'success' : 'danger'" disable-transitions>{{scope.row.needAuth ===
            0 ? '不鉴权' : '鉴权'}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="updateItemNeedAuth(scope.row)">{{scope.row.needAuth ===
            0 ? '鉴权' : '不鉴权'}}
          </el-button>
          <el-button type="warning" plain size="mini" @click="editItem(scope.row)">编辑</el-button>
          <el-button type="danger" plain size="mini" @click="delItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @current-change="paginationCurrentChange"
                   layout="prev, pager, next" :total="pagination.total" :current-page="pagination.currentPage"
                   :page-size="pagination.pageSize">
    </el-pagination>
    <ResourceDialog :formStatus="formResourceStatus" ref="resourceDialog"
                    @closeResourceDialog="fetchData"></ResourceDialog>
  </div>
</template>

<script>
  export default {
    name: 'AuthGroupTable'
  }
</script>

<style scoped>

</style>
