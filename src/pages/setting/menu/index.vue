<template>
  <d2-container>
    <h1>{{ title }}</h1>
    <el-row :gutter="20">
      <el-col :span="10">
        <menu-card @handlerSubmenu="handlerSubmenu"></menu-card>
      </el-col>
      <el-col :span="14">
        <submenu-card ref="submenuCard"></submenu-card>
      </el-col>
    </el-row>
  </d2-container>
</template>

<script>
import MenuCard from '@/components/opscloud/menu/MenuCard'
import SubmenuCard from '@/components/opscloud/menu/SubmenuCard'

export default {
  data () {
    return {
      title: '菜单管理'
    }
  },
  components: {
    MenuCard,
    SubmenuCard
  },
  mounted () {
  },
  methods: {
    handlerSubmenu (menuId, menuTitle) {
      this.$refs.submenuCard.initData(menuId, menuTitle)
    }
  }
}
</script>

<style scoped>
</style>
