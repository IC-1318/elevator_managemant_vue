/**
 * 认证相关配置
 */
export default {
  /**
   * JWT令牌过期时间（毫秒）
   * 默认8小时
   */
  TOKEN_EXPIRATION: 8 * 60 * 60 * 1000,
  
  /**
   * 本地存储中的键名
   */
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    IS_LOGGED_IN: 'isLoggedIn',
    USER_ROLE: 'userRole',
    TOKEN: 'token'
  },
  
  /**
   * 用户角色
   */
  ROLES: {
    ADMIN: 'admin',
    MAINTENANCE: 'maintenance'
  },
  
  /**
   * 角色对应的默认路由
   */
  DEFAULT_ROUTES: {
    admin: '/',
    maintenance: '/maintenance-dashboard'
  }
}; 