import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import TractionSystem from '../views/TractionSystem.vue'
import GuidanceSystem from '../views/GuidanceSystem.vue'
import ElectricalSystem from '../views/ElectricalSystem.vue'
import DoorSystem from '../views/DoorSystem.vue'
import AbnormalData from '../views/AbnormalData.vue'
import UserManagement from '../views/UserManagement.vue'
import MaintenanceLog from '../views/MaintenanceLog.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/system/sys-001',
      name: 'traction-system',
      component: TractionSystem,
      meta: { requiresAuth: true }
    },
    {
      path: '/system/sys-002',
      name: 'guidance-system',
      component: GuidanceSystem,
      meta: { requiresAuth: true }
    },
    {
      path: '/system/sys-003',
      name: 'electrical-system',
      component: ElectricalSystem,
      meta: { requiresAuth: true }
    },
    {
      path: '/system/sys-004',
      name: 'door-system',
      component: DoorSystem,
      meta: { requiresAuth: true }
    },
    {
      path: '/abnormal-data',
      name: 'abnormal-data',
      component: AbnormalData,
      meta: { requiresAuth: true }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/maintenance-log',
      name: 'maintenance-log',
      component: MaintenanceLog,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue')
    },
    {
      path: '/admin',
      name: 'admin-page',
      component: () => import('../views/AdminPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 临时禁用登录检查，直接放行所有路由
  next();
  
  // 原始代码（暂时注释掉）
  /*
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'admin-login' });
  } else {
    next();
  }
  */
});

export default router