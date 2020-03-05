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
    title: '全局配置',
    icon: 'cogs',
    children: [
      { path: '/env', title: '环境配置', icon: 'cog' },
      { path: '/tag', title: '标签配置', icon: 'cog' }
    ]
  },
  {
    title: '服务器管理',
    iconSvg: 'servers',
    children: [
      { path: '/server', title: '服务器', iconSvg: 'server' },
      { path: '/server/group', title: '服务器组', iconSvg: 'servers' },
      { path: '/server/group/type', title: '服务器组类型', iconSvg: 'servergrp-type' }
    ]
  },
  {
    title: '云主机管理',
    icon: 'cloud',
    children: [
      { path: '/cloud/server/ecs', title: 'ECS', iconSvg: 'aliyun-ecs' },
      { path: '/cloud/server/ec2', title: 'EC2', iconSvg: 'amazonaws' },
      { path: '/cloud/server/esxi', title: 'ESXI', iconSvg: 'vmware' },
      // tencent
      { path: '/cloud/server/vm', title: 'VM', iconSvg: 'vmware' },
      { path: '/cloud/server/zabbixhost', title: 'ZabbixHost', iconSvg: 'zabbix' }
    ]
  },
  {
    title: '云数据库',
    icon: 'cloud',
    children: [
      { path: '/cloud/db/instance', title: '数据库实例', iconSvg: 'rds' },
      { path: '/cloud/db/database', title: '数据库', iconSvg: 'database' },
      { path: '/cloud/db/my/database', title: '我的数据库', iconSvg: 'my-database' }
    ]
  },
  {
    title: '用户管理',
    icon: 'user-circle',
    children: [
      { path: '/user', title: '用户', icon: 'user' },
      { path: '/user/group', title: '用户组', iconSvg: 'usergrp' }
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
  },
  {
    title: '个人详情',
    icon: 'user-o',
    children: [
      { path: '/user/detail', title: '我的详情', icon: 'address-book' }
    ]
  }
]
