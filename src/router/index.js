import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import TractionSystem from '../views/TractionSystem.vue'
import GuidanceSystem from '../views/GuidanceSystem.vue'
import ElectricalSystem from '../views/ElectricalSystem.vue'
import DoorSystem from '../views/DoorSystem.vue'
import AbnormalData from '../views/AbnormalData.vue'
import UserManagement from '../views/UserManagement.vue'
import MaintenanceLog from '../views/MaintenanceLog.vue'
import MaintenanceWorkerDashboard from '../views/MaintenanceWorkerDashboard.vue'
import AuthService from '../services/authService';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/system/sys-001',
      name: 'traction-system',
      component: TractionSystem,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/system/sys-002',
      name: 'guidance-system',
      component: GuidanceSystem,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/system/sys-003',
      name: 'electrical-system',
      component: ElectricalSystem,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/system/sys-004',
      name: 'door-system',
      component: DoorSystem,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/abnormal-data',
      name: 'abnormal-data',
      component: AbnormalData,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagement,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/maintenance-log',
      name: 'maintenance-log',
      component: MaintenanceLog,
      meta: { requiresAuth: true, roles: ['admin'] }
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
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/maintenance-dashboard',
      name: 'maintenance-dashboard',
      component: MaintenanceWorkerDashboard,
      meta: { requiresAuth: true, roles: ['maintenance'] }
    }
  ]
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userRole = AuthService.getUserRole();
  
  if (to.name === 'admin-login' && isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }
  
  // 如果需要认证但没有登录，重定向到登录页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'admin-login' });
    return;
  }
  
  // 如果页面有角色限制，检查用户角色是否匹配
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // 如果角色不匹配，重定向到他们有权访问的页面或登录页
    if (isAuthenticated) {
      next({ name: 'dashboard' }); // admin用户默认页
    } else {
      next({ name: 'admin-login' });
    }
    return;
  }
  
  // 其他情况，正常导航
  next();
})

export default router