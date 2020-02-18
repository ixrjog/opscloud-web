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
      // 演示页面
      {
        path: 'page1',
        name: 'page1',
        meta: {
          title: '页面 1',
          auth: true
        },
        component: _import('demo/page1')
      },
      {
        path: 'page2',
        name: 'page2',
        meta: {
          title: '页面 2',
          auth: true
        },
        component: _import('demo/page2')
      },
      {
        path: 'page3',
        name: 'page3',
        meta: {
          title: '页面 3',
          auth: true
        },
        component: _import('demo/page3')
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
        path: '/auth/group',
        name: 'auth-group',
        component: () => import('@/pages/auth/group'),
        meta: {
          auth: true,
          title: '资源组管理'
        }
      },
      {
        path: '/cloudserver/server/ecs',
        name: 'cloudserver-server-ecs',
        component: () => import('@/pages/cloudserver/server/ecs'),
        meta: {
          auth: true,
          title: 'ECS主机管理'
        }
      },
      {
        path: '/cloudserver/server/ec2',
        name: 'cloudserver-server-ec2',
        component: () => import('@/pages/cloudserver/server/ec2'),
        meta: {
          auth: true,
          title: 'EC2主机管理'
        }
      },
      {
        path: '/cloudserver/server/esxi',
        name: 'cloudserver-server-esxi',
        component: () => import('@/pages/cloudserver/server/esxi'),
        meta: {
          auth: true,
          title: 'ESXi主机管理'
        }
      },
      {
        path: '/cloudserver/server/vm',
        name: 'cloudserver-server-vm',
        component: () => import('@/pages/cloudserver/server/vm'),
        meta: {
          auth: true,
          title: 'VM主机管理'
        }
      },
      {
        path: '/cloudserver/server/zabbixhost',
        name: 'cloudserver-server-zabbixhost',
        component: () => import('@/pages/cloudserver/server/zabbixhost'),
        meta: {
          auth: true,
          title: 'ZabbixHost主机管理'
        }
      },
      // binlog订阅配置
      {
        path: '/binlog/config',
        name: 'binlog-config',
        component: () => import('@/pages/binlog-config'),
        meta: {
          auth: true,
          title: 'binlog订阅管理'
        }
      },
      {
        path: '/business/detail',
        name: 'business-detail',
        component: () => import('@/pages/business-detail'),
        meta: {
          auth: true,
          title: '业务域管理'
        }
      },
      {
        path: '/rule/detail',
        name: 'rule-detail',
        component: () => import('@/pages/rule-detail'),
        meta: {
          auth: true,
          title: '规则SQL管理'
        }
      },
      {
        path: '/rule/equal',
        name: 'rule-equal',
        component: () => import('@/pages/rule-equal'),
        meta: {
          auth: true,
          title: '规则等式'
        }
      },
      {
        path: '/rule/check/failure',
        name: 'rule-check-failure',
        component: () => import('@/pages/rule-check-failure'),
        meta: {
          auth: true,
          title: '检查失败记录'
        }
      },
      {
        path: '/business/rule',
        name: 'business-rule',
        component: () => import('@/pages/business-rule'),
        meta: {
          auth: true,
          title: '业务规则'
        }
      },
      {
        path: '/business/rule/detail',
        name: 'business-rule-detail',
        component: () => import('@/pages/business-rule-detail'),
        meta: {
          auth: true,
          title: '业务规则详情'
        }
      },
      {
        path: '/sql/debug',
        name: 'sql-debug',
        component: () => import('@/pages/sql-debug'),
        meta: {
          auth: true,
          title: 'SQL调试'
        }
      },
      {
        path: '/sql/debug/result',
        name: 'sql-debug',
        component: () => import('@/pages/sql-debug-detail'),
        meta: {
          auth: true,
          title: 'SQL调试结果'
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
