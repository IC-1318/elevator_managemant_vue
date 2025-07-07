import axios from 'axios';
import config from '../api/config';
import authConfig from '../config/auth.config';

const API_BASE_URL = config.API_BASE_URL;

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
    try {
      // 实际项目中应该调用后端API登录
      // 目前使用模拟数据
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟登录逻辑
          // 管理员: admin/admin123
          // 维修人员: repair/repair123
          if (username === 'admin' && password === 'admin123') {
            // 管理员登录成功
            const token = 'admin-mock-jwt-token'; // 实际应该是从后端获取的JWT
            const userData = {
              userId: '001',
              username: 'admin',
              role: authConfig.ROLES.ADMIN,
              token: token
            };
            resolve({
              success: true,
              data: userData
            });
          } else if (username === 'repair' && password === 'repair123') {
            // 维修人员登录成功
            const token = 'repair-mock-jwt-token'; // 实际应该是从后端获取的JWT
            const userData = {
              userId: '002',
              username: 'repair',
              role: authConfig.ROLES.MAINTENANCE,
              token: token
            };
            resolve({
              success: true,
              data: userData
            });
          } else {
            // 登录失败
            resolve({
              success: false,
              message: '用户名或密码错误'
            });
          }
        }, 1000);
      });

      // 实际项目中的API调用应该是这样:
      // const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      //   username,
      //   password
      // });
      // return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: '登录失败，请稍后再试'
      };
    }
  },

  /**
   * 保存用户信息到本地存储
   * @param {Object} userData - 用户数据
   */
  saveUserData(userData) {
    localStorage.setItem(authConfig.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    localStorage.setItem(authConfig.STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(authConfig.STORAGE_KEYS.USER_ROLE, userData.role);
    localStorage.setItem(authConfig.STORAGE_KEYS.TOKEN, userData.token);

    // 设置axios的默认Authorization头
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  },

  /**
   * 注销方法
   */
  logout() {
    localStorage.removeItem(authConfig.STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(authConfig.STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(authConfig.STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(authConfig.STORAGE_KEYS.TOKEN);
    
    // 清除axios的默认Authorization头
    delete axios.defaults.headers.common['Authorization'];
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return localStorage.getItem(authConfig.STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },

  /**
   * 获取当前用户角色
   * @returns {string|null} 用户角色
   */
  getUserRole() {
    return localStorage.getItem(authConfig.STORAGE_KEYS.USER_ROLE);
  },

  /**
   * 获取JWT令牌
   * @returns {string|null} JWT令牌
   */
  getToken() {
    return localStorage.getItem(authConfig.STORAGE_KEYS.TOKEN);
  },

  /**
   * 获取用户应该被重定向到的路由
   * @returns {string} 重定向路由
   */
  getRedirectRoute() {
    const role = this.getUserRole();
    return authConfig.DEFAULT_ROUTES[role] || '/login';
  },

  /**
   * 设置axios请求拦截器，自动添加JWT令牌到请求头
   */
  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器，处理401未授权错误
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          // 如果收到401响应，清除用户信息并跳转到登录页
          this.logout();
          window.location = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
};

export default AuthService; 