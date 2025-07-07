// import axios from 'axios';
// import config from '../api/config';
// import authConfig from '../config/auth.config';

// const API_BASE_URL = config.API_BASE_URL;

// 从sessionStorage初始化状态，这样刷新页面后状态不会丢失
let isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
let userRole = sessionStorage.getItem('userRole');

/**
 * 认证相关的服务
 */
const AuthService = {
  /**
   * 登录方法
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password) {
    // 模拟异步操作
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          isAuthenticated = true;
          userRole = 'admin';
          // 将登录状态保存到sessionStorage
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('userRole', 'admin');
          resolve({
            success: true,
            data: {
              username: 'admin',
              role: 'admin',
            },
          });
        } else {
          resolve({
            success: false,
            message: '用户名或密码错误',
          });
        }
      }, 500); // 模拟网络延迟
    });
  },

  /**
   * 注销方法
   */
  logout() {
    isAuthenticated = false;
    userRole = null;
    // 从sessionStorage中移除登录状态
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
  },

  /**
   * 检查用户是否已认证
   * @returns {boolean} 是否已认证
   */
  isAuthenticated() {
    return isAuthenticated;
  },

  /**
   * 获取当前用户角色
   * @returns {string|null} 用户角色
   */
  getUserRole() {
    return userRole;
  },

  /**
   * 获取用户应该被重定向到的路由
   * @returns {string} 重定向路由
   */
  getRedirectRoute() {
    if (this.isAuthenticated()) {
      const role = this.getUserRole();
      // 登录后默认都跳转到主仪表盘
      return role === 'admin' ? '/' : '/';
    }
    return '/login';
  },
};

export default AuthService; 