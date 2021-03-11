<template>
  <el-card shadow="never" v-show="menuId !== ''">
    <div slot="header" style="height: 15px">
      <span>{{ menuTitle }}</span>
      <el-row style="float: right">
        <el-button type="success" icon="el-icon-lock" v-if="finalized" plain
                   @click="updateFinalized()" size="mini"></el-button>
        <el-button type="warning" icon="el-icon-unlock" v-if="!finalized" plain
                   @click="updateFinalized()" size="mini"></el-button>
        <el-button-group style="margin-left: 10px">
          <el-button plain @click="addSubmenu()" size="mini" :disabled="finalized">新增</el-button>
          <el-button plain @click="saveSubmenu()" size="mini" :disabled="finalized">保存</el-button>
        </el-button-group>
      </el-row>
    </div>
    <draggable :list="submenuList" @start="dragging = true" @end="dragging = false" :disabled="finalized">
      <div v-for="(submenu,index) in submenuList" :key="index">
        <el-form :inline="true" :model="submenu" label-width="60px">
          <el-form-item label="名称" required>
            <el-input v-model.trim="submenu.submenuTitle" :readonly="finalized"></el-input>
          </el-form-item>
          <el-form-item label="路径" required>
            <el-input v-model.trim="submenu.submenuPath" :readonly="finalized" class="input"></el-input>
          </el-form-item>
          <el-form-item label="图标" required>
            <el-input v-model.trim="submenu.submenuIcon" :readonly="finalized"></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="submenu.isSvg" :disabled="finalized">SVG</el-checkbox>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="danger" plain @click.prevent="handlerDel(submenu)" :disabled="finalized">删除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </draggable>
  </el-card>
</template>

<script>
import draggable from 'vuedraggable'
import { delSubmenu, querySubmenuByMenuId, saveSubmenuList } from '@api/menu/menu'

const submenu = {
  id: '',
  menuId: '',
  submenuTitle: '',
  isSvg: false,
  submenuIcon: '',
  submenuPath: ''
}

export default {
  data () {
    return {
      menuId: '',
      menuTitle: '',
      finalized: true,
      submenuList: [],
      dragging: false
    }
  },
  name: 'SubmenuCard',
  mounted () {
  },
  components: {
    draggable
  },
  methods: {
    initData (menuId, menuTitle) {
      this.finalized = true
      this.menuId = menuId
      this.menuTitle = menuTitle
      this.fetchData()
    },
    updateFinalized () {
      this.finalized = !this.finalized
    },
    addSubmenu () {
      let data = Object.assign({}, submenu)
      data.menuId = this.menuId
      this.submenuList.push(data)
    },
    saveSubmenu () {
      let requestBody = {
        submenuList: this.submenuList
      }
      saveSubmenuList(requestBody)
        .then(res => {
          this.$message.success('保存子菜单成功')
          this.fetchData()
        })
    },
    handlerSubmenu (menu) {
      this.$emit('handlerSubmenu', menu.id)
    },
    handlerDel (submenu) {
      if (submenu.id === '') {
        let index = this.submenuList.indexOf(submenu)
        if (index !== -1) {
          this.submenuList.splice(index, 1)
        }
      } else {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delSubmenu(submenu.id)
            .then(res => {
              this.fetchData()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    fetchData () {
      querySubmenuByMenuId(this.menuId)
        .then(res => {
          this.submenuList = res.body
        })
    }
  }
}
</script>

<style scoped>
.input {
  display: inline-block;
  max-width: 220px;
  width: 220px;
}
</style>
