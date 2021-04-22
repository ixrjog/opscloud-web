<template>
  <el-card shadow="never">
    <div slot="header" style="height: 15px">
      <span>菜单目录</span>
      <el-row style="float: right">
        <el-button type="success" icon="el-icon-lock" v-if="finalized" plain
                   @click="updateFinalized()" size="mini"></el-button>
        <el-button type="warning" icon="el-icon-unlock" v-if="!finalized" plain
                   @click="updateFinalized()" size="mini"></el-button>
        <el-button-group style="margin-left: 10px">
          <el-button plain @click="addMenu()" size="mini" :disabled="finalized">新增</el-button>
          <el-button plain @click="saveMenu()" size="mini" :disabled="finalized">保存</el-button>
        </el-button-group>
      </el-row>
    </div>
    <draggable :list="menuList" @start="dragging = true" @end="dragging = false" :disabled="finalized">
      <div v-for="(menu,index) in menuList" :key="index">
        <el-form :inline="true" :model="menu" label-width="60px">
          <el-form-item label="名称" required>
            <el-input v-model.trim="menu.menuTitle" :readonly="finalized"></el-input>
          </el-form-item>
          <el-form-item label="图标" required>
            <el-input v-model.trim="menu.menuIcon" :readonly="finalized" :suffix-icon="getIcon(menu.menuIcon)"></el-input>
          </el-form-item>
          <span style="float: right">
            <el-form-item>
              <el-button :disabled="menu.id === ''" @click="handlerSubmenu(menu)" plain>子菜单</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" plain @click.prevent="handlerDel(menu)" :disabled="finalized">删除</el-button>
            </el-form-item>
          </span>
        </el-form>
      </div>
    </draggable>
  </el-card>
</template>

<script>
import draggable from 'vuedraggable'
import { delMenu, queryMenuAll, saveMenuList } from '@api/menu/menu'

const menu = {
  id: '',
  menuTitle: '',
  menuIcon: ''
}

export default {
  data () {
    return {
      finalized: true,
      menuList: [],
      dragging: false
    }
  },
  name: 'MenuTable',
  mounted () {
    this.fetchData()
  },
  components: {
    draggable
  },
  methods: {
    updateFinalized () {
      this.finalized = !this.finalized
    },
    addMenu () {
      this.menuList.push(Object.assign({}, menu))
    },
    saveMenu () {
      let requestBody = {
        menuList: this.menuList
      }
      saveMenuList(requestBody)
        .then(res => {
          this.$message.success('保存菜单成功')
          this.fetchData()
        })
    },
    handlerSubmenu (menu) {
      this.$emit('handlerSubmenu', menu.id, menu.menuTitle)
    },
    getIcon (icon) {
      return 'fa fa-' + icon
    },
    handlerDel (menu) {
      if (menu.id === '') {
        let index = this.menuList.indexOf(menu)
        if (index !== -1) {
          this.menuList.splice(index, 1)
        }
      } else {
        this.$confirm('此操作将删除当前配置?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delMenu(menu.id)
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
      queryMenuAll()
        .then(res => {
          this.menuList = res.body
        })
    }
  }
}
</script>
