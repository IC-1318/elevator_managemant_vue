import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

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
      path: '/system/:id',
      name: 'system-detail',
      component: () => import('../views/SystemDetail.vue'),
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
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'admin-login' });
  } else {
    next();
  }
});

export default router