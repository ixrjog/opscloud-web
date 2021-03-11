<template>
  <el-dialog :title="title" :visible.sync="formStatus.visible">
    <el-row style="margin-bottom: 10px">
      <el-form label-width="80px">
        <el-form-item label="角色名称" >
          <el-input v-model="roleName" readonly></el-input>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-tree :data="menuOptions" show-checkbox node-key="value" ref="menuTree"></el-tree>
      </el-col>
      <el-col :span="18">
        <editor v-model="menuContent" @init="editorInit" lang="javascript" theme="kuroir"
                width="100%" height="600" disabled=""></editor>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="formStatus.visible = false">取消</el-button>
      <el-button type="primary" @click="saveRoleMenu">确定</el-button>
      <el-button type="primary" @click="getMenuTemp">预览</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { queryMenuListTree, queryRoleMenu, queryRoleMenuTemp, saveRoleMenu } from '@api/menu/menu'

export default {
  data () {
    return {
      title: '角色菜单配置',
      submenuIdList: [],
      menuOptions: [],
      menuCascaderProps: {
        multiple: true,
        expandTrigger: 'hover'
      },
      roleId: '',
      roleName: '',
      menuContent: ''
    }
  },
  name: 'RoleMenuDialog',
  props: ['formStatus'],
  components: {
    editor: require('vue2-ace-editor')
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    editorInit: function (ed) {
      require('brace/ext/language_tools')
      require('brace/mode/javascript')
      require('brace/mode/ejs')
      require('brace/theme/kuroir')
      ed.setReadOnly(true)
    },
    fetchData () {
      queryMenuListTree()
        .then(res => {
          this.menuOptions = res.body
        })
    },
    saveRoleMenu () {
      let subMenuIdList = []
      for (let subMenuId of this.$refs.menuTree.getCheckedKeys()) {
        if (subMenuId > 0) {
          subMenuIdList.push(subMenuId)
        }
      }
      let requestBody = {
        roleId: this.roleId,
        submenuIdList: subMenuIdList
      }
      saveRoleMenu(requestBody)
        .then(res => {
          this.$message.success('保存成功')
        })
    },
    initData (role) {
      this.menuContent = ''
      this.roleName = role.roleName
      this.roleId = role.id
      queryRoleMenu(this.roleId)
        .then(res => {
          let subMenuIdList = []
          for (let subMenu of res.body) {
            subMenuIdList.push(subMenu.submenuId)
          }
          this.$refs.menuTree.setCheckedKeys(subMenuIdList)
        })
      this.getMenuTemp()
    },
    getMenuTemp () {
      queryRoleMenuTemp(this.roleId)
      .then(res => {
        this.menuContent = res.body
      })
    }
  }
}
</script>

<style scoped>
</style>
