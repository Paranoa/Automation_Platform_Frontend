import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/project'
  },
  {
    path: '/project',
    component: Layout,
    redirect: '/project/index',
    children: [
      {
        path: 'index',
        name: 'Project',
        component: () => import('@/views/project/index'),
        meta: { title: '项目管理' }
      },
      {
        path: 'add',
        name: 'projectAdd',
        component: () => import('@/views/project/addProject'),
        meta: { title: '新建项目', activeMenu: '/project/index' },
        hidden: true
      },
      {
        path: 'edit',
        name: 'projectEdit',
        component: () => import('@/views/project/addProject'),
        meta: { title: '编辑项目', activeMenu: '/project/index' },
        hidden: true,
        beforeEnter: (to, from, next) => {
          if (to.params.project) {
            next()
          } else {
            next({
              name: 'Project'
            })
          }
        }
      },
      {
        path: 'envs/:id',
        name: 'projectEnv',
        component: () => import('@/views/project/projectList/environmentManage'),
        meta: { title: '环境管理', activeMenu: '/project/index' },
        hidden: true
      },
      {
        path: 'users',
        name: 'projectUsers',
        component: () => import('@/views/project/projectList/userManage.vue'),
        meta: { title: '人员管理', activeMenu: '/project/index' },
        hidden: true,
        beforeEnter: (to, from, next) => {
          if (to.params.project) {
            next()
          } else {
            next({
              name: 'Project'
            })
          }
        }
      },
      {
        path: 'tamplate/:id',
        name: 'projectTemplateEdit',
        component: () => import('@/views/project/projectList/templateManage'),
        meta: { title: '项目环境模板', activeMenu: '/project/index' },
        hidden: true
      }
    ]
  },
  {
    path: '/interface',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Interface',
        component: () => import('@/views/interface/index'),
        meta: { title: '接口管理' }
      },
      {
        path: 'add/:projectId/:moduleId',
        name: 'InterfaceAdd',
        component: () => import('@/views/interface/addInterface/'),
        meta: { title: '新建接口', activeMenu: '/interface/index' },
        hidden: true
      },
      {
        path: 'edit/interface/:projectId/:interfaceId',
        name: 'InterfaceEdit',
        component: () => import('@/views/interface/addInterface/'),
        meta: { title: '编辑接口', activeMenu: '/interface/index' },
        hidden: true,
        beforeEnter: (to, from, next) => {
          const name = from.name || store.getters.lastInterfacePageState
          // 在本地记录最后一次进入接口详情 是从"接口模块"还是"执行模块" 决定左侧菜单选中
          store.dispatch('app/setLastInterfacePageState', name)
          if (name === 'Execution') {
            to.meta.activeMenu = '/execution/index'
          } else {
            to.meta.activeMenu = '/interface/index'
          }
          next()
        }
      },
      {
        path: 'addBusiness/:projectId/:moduleId',
        name: 'BusinessAdd',
        component: () => import('@/views/interface/addBusinessFlow/'),
        meta: { title: '新建流程', activeMenu: '/interface/index' },
        hidden: true
      },
      {
        path: 'edit/business/:projectId/:interfaceId',
        name: 'BusinessEdit',
        component: () => import('@/views/interface/addBusinessFlow/'),
        meta: { title: '编辑流程', activeMenu: '/interface/index' },
        hidden: true,
        beforeEnter: (to, from, next) => {
          const name = from.name || store.getters.lastInterfacePageState
          // 在本地记录最后一次进入接口详情 是从"接口模块"还是"执行模块" 决定左侧菜单选中
          store.dispatch('app/setLastInterfacePageState', name)
          if (name === 'Execution') {
            to.meta.activeMenu = '/execution/index'
          } else {
            to.meta.activeMenu = '/interface/index'
          }
          next()
        }
      },
      {
        path: 'execute/:interfaceId',
        name: 'InterfaceExecute',
        component: () => import('@/views/interface/interfaceList/runInterface'),
        meta: { title: '运行-环境选择', activeMenu: '/interface/index' },
        hidden: true
      },
      {
        path: 'executeResult/:id',
        name: 'InterfaceExecuteResult',
        component: () => import('@/views/interface/interfaceList/executionResult'),
        meta: { title: '测试结果-单接口', activeMenu: '/interface/index' },
        hidden: true
      }
    ]
  },
  {
    path: '/datasource',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Datasource',
        component: () => import('@/views/datasource/index'),
        meta: { title: '数据源' }
      }
    ]
  },
  {
    path: '/execution',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Execution',
        component: () => import('@/views/execution/index'),
        meta: { title: '测试执行' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
