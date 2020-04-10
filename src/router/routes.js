import layoutHeaderAside from '@/layout/header-aside'

// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    redirect: { name: 'index' },
    component: layoutHeaderAside,
    children: [
      // 首页
      {
        path: 'index',
        name: 'index',
        meta: {
          auth: true
        },
        component: _import('system/index')
      },
      // 系统 前端日志
      {
        path: 'log',
        name: 'log',
        meta: {
          title: '前端日志',
          auth: true
        },
        component: _import('system/log')
      },
      // 刷新页面 必须保留
      {
        path: 'refresh',
        name: 'refresh',
        hidden: true,
        component: _import('system/function/refresh')
      },
      // 页面重定向 必须保留
      {
        path: 'redirect/:route*',
        name: 'redirect',
        hidden: true,
        component: _import('system/function/redirect')
      },
      // env
      {
        path: '/env',
        name: 'env',
        component: () => import('@/pages/env'),
        meta: {
          auth: true,
          title: '环境配置'
        }
      },
      // tag
      {
        path: '/tag',
        name: 'tag',
        component: () => import('@/pages/tag'),
        meta: {
          auth: true,
          title: '标签配置'
        }
      },
      // server(group)
      {
        path: '/server',
        name: 'server',
        component: () => import('@/pages/server'),
        meta: {
          auth: true,
          title: '服务器'
        }
      },
      {
        path: '/server/attribute',
        name: 'card',
        component: () => import('@/pages/server/attribute'),
        meta: {
          auth: true,
          title: '服务器属性'
        }
      },
      {
        path: '/server/group',
        name: 'server-group',
        component: () => import('@/pages/server/group'),
        meta: {
          auth: true,
          title: '服务器组'
        }
      },
      {
        path: '/server/group/type',
        name: 'server-groupp-type',
        component: () => import('@/pages/server/group/type'),
        meta: {
          auth: true,
          title: '服务器组类型'
        }
      },
      // opscloud auth
      {
        path: '/auth/role',
        name: 'auth-role',
        component: () => import('@/pages/auth/role'),
        meta: {
          auth: true,
          title: '角色管理'
        }
      },
      {
        path: '/auth/resource',
        name: 'auth-resource',
        component: () => import('@/pages/auth/resource'),
        meta: {
          auth: true,
          title: '资源管理'
        }
      },
      {
        path: '/auth/user/role',
        name: 'auth-user-role',
        component: () => import('@/pages/auth/user-role'),
        meta: {
          auth: true,
          title: '用户角色管理'
        }
      },
      {
        path: '/cloud/server/ecs',
        name: 'cloud-server-ecs',
        component: () => import('@/pages/cloud/server/ecs'),
        meta: {
          auth: true,
          title: 'ECS主机管理'
        }
      },
      {
        path: '/cloud/server/ec2',
        name: 'cloud-server-ec2',
        component: () => import('@/pages/cloud/server/ec2'),
        meta: {
          auth: true,
          title: 'EC2主机管理'
        }
      },
      {
        path: '/cloud/server/esxi',
        name: 'cloud-server-esxi',
        component: () => import('@/pages/cloud/server/esxi'),
        meta: {
          auth: true,
          title: 'ESXi主机管理'
        }
      },
      {
        path: '/cloud/server/vm',
        name: 'cloud-server-vm',
        component: () => import('@/pages/cloud/server/vm'),
        meta: {
          auth: true,
          title: 'VM主机管理'
        }
      },
      {
        path: '/cloud/server/zabbixhost',
        name: 'cloud-server-zabbixhost',
        component: () => import('@/pages/cloud/server/zabbixhost'),
        meta: {
          auth: true,
          title: 'ZabbixHost主机管理'
        }
      },
      // cloudDB
      {
        path: '/cloud/db/instance',
        name: 'cloud-db-instance',
        component: () => import('@/pages/cloud/db/instance'),
        meta: {
          auth: true,
          title: '数据库实例详情'
        }
      },
      {
        path: '/cloud/db/database',
        name: 'cloud-db-database',
        component: () => import('@/pages/cloud/db/database'),
        meta: {
          auth: true,
          title: '数据库'
        }
      },
      {
        path: '/cloud/db/database/slowlog',
        name: 'cloud-db-database-slowlog',
        component: () => import('@/pages/cloud/db/database/slowlog'),
        meta: {
          auth: true,
          title: '慢日志'
        }
      },
      {
        path: '/jump/jumpserver/settings',
        name: 'jump-jumpserver-settings',
        component: () => import('@/pages/jump/jumpserver/settings'),
        meta: {
          auth: true,
          title: 'Jumpserver设置'
        }
      },
      {
        path: '/jump/jumpserver/user',
        name: 'jump-jumpserver-user',
        component: () => import('@/pages/jump/jumpserver/user'),
        meta: {
          auth: true,
          title: 'Jumpserver用户管理'
        }
      },
      {
        path: '/jump/jumpserver/asset',
        name: 'jump-jumpserver-asset',
        component: () => import('@/pages/jump/jumpserver/asset'),
        meta: {
          auth: true,
          title: 'Jumpserver资产管理'
        }
      },
      // task
      {
        path: '/task/command',
        name: 'task-command',
        component: () => import('@/pages/task/command'),
        meta: {
          auth: true,
          title: '批量命令'
        }
      },
      // user
      {
        path: '/user',
        name: 'user',
        component: () => import('@/pages/user'),
        meta: {
          auth: true,
          title: '用户管理'
        }
      },
      {
        path: '/user/group',
        name: 'user-group',
        component: () => import('@/pages/user/group'),
        meta: {
          auth: true,
          title: '用户组管理'
        }
      },
      {
        path: '/user/detail',
        name: 'user-detail',
        component: () => import('@/pages/user/detail'),
        meta: {
          auth: true,
          title: '个人详情'
        }
      }
    ]
  }
]

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 登录
  {
    path: '/login',
    name: 'login',
    component: _import('system/login')
  }
]

/**
 * 错误页面
 */
const errorPage = [
  {
    path: '*',
    name: '404',
    component: _import('system/error/404')
  }
]

// 导出需要显示菜单的
export const frameInRoutes = frameIn

// 重新组织后导出
export default [
  ...frameIn,
  ...frameOut,
  ...errorPage
]
