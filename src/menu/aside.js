// 菜单 侧边栏
export default [
  // { path: '/index', title: '首页', icon: 'home' },
  // {
  //   title: '页面',
  //   icon: 'folder-o',
  //   children: [
  //     { path: '/page1', title: '页面 1' },
  //     { path: '/page2', title: '页面 2' },
  //     { path: '/page3', title: '页面 3' }
  //   ]
  // },
  {
    title: '权限配置',
    icon: 'address-card',
    children: [
      { path: '/auth/role', title: '角色配置', icon: 'users' },
      { path: '/auth/resource', title: '资源', icon: 'puzzle-piece' },
      { path: '/auth/group', title: '资源组' },
      { path: '/auth/resource/group', title: '资源组配置' },
      { path: '/auth/user/role', title: '用户角色配置', icon: 'edit' }
    ]
  }
  // { path: '/business/detail', title: '业务域管理', icon: 'home' },
  // { path: '/binlog/config', title: 'binlog订阅管理', icon: 'home' },
  // { path: '/rule/detail', title: '规则SQL管理', icon: 'home' },
  // { path: '/rule/equal', title: '规则等式', icon: 'home' },
  // { path: '/rule/check/failure', title: '检查失败记录', icon: 'home' },
  // { path: '/business/rule', title: '业务规则', icon: 'home' },
  // { path: '/sql/debug', title: 'SQL调试', icon: 'home' }
]
