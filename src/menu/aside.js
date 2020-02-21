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
    title: '服务器组管理',
    icon: 'server',
    children: [
      { path: '/server/group', title: '服务器组', icon: 'window-restore' },
      { path: '/server/group/type', title: '服务器组类型', icon: 'window-restore' },
      { path: '/env', title: '环境配置', icon: 'window-restore' }
    ]
  },
  {
    title: '云主机管理',
    icon: 'server',
    children: [
      { path: '/cloudserver/server/ecs', title: 'ECS', icon: 'window-restore' },
      { path: '/cloudserver/server/ec2', title: 'EC2', icon: 'window-restore' },
      { path: '/cloudserver/server/esxi', title: 'ESXI', icon: 'window-restore' },
      { path: '/cloudserver/server/vm', title: 'VM', icon: 'window-restore' },
      { path: '/cloudserver/server/zabbixhost', title: 'ZabbixHost', icon: 'window-restore' }
    ]
  },
  {
    title: '权限配置',
    icon: 'address-card',
    children: [
      { path: '/auth/resource', title: '资源', icon: 'puzzle-piece' },
      { path: '/auth/group', title: '资源组', icon: 'th-list' },
      { path: '/auth/role', title: '角色配置', icon: 'users' },
      { path: '/auth/role/resource', title: '角色资源管理', icon: 'edit' },
      { path: '/auth/user/role', title: '用户角色配置', icon: 'id-card' }
    ]
  }
]
