// src/routes.ts
export default [
  {
    path: '/',
    redirect: '/services',
  },
  {
    name: '服务管理',
    path: '/services',
    icon: 'AppstoreOutlined',
    routes: [
      {
        name: '服务列表',
        path: '/services',
        component: './ServiceList',
      },
      {
        name: '服务详情',
        path: '/services/:id',
        component: './ServiceDetail',
        hideInMenu: true,
      },
      {
        name: '新增服务',
        path: '/services/new',
        component: './ServiceForm',
        hideInMenu: true,
      },
      {
        name: '编辑服务',
        path: '/services/:id/edit',
        component: './ServiceForm',
        hideInMenu: true,
      },
    ],
  },
  {
    name: '服务监控',
    path: '/monitor',
    icon: 'MonitorOutlined',
    component: './Monitor',
  },
];
