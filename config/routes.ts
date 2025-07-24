export default [
  {
    path: '/',
    redirect: '/disaster-recovery', 
  },
  {
    path: '/disaster-recovery',
    name: '灾备服务配置',
    icon: 'cluster',
    component: './DisasterRecovery/ServiceList',
    routes: [
      {
        path: '/disaster-recovery/new',
        name: '新建服务',
        component: './DisasterRecovery/ServiceDetail',
        hideInMenu: true,
      },
      {
        path: '/disaster-recovery/:id',
        name: '编辑服务',
        component: './DisasterRecovery/ServiceDetail',
        hideInMenu: true,
      },
    ],
  },
];