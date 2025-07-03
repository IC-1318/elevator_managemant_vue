<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 管理员信息
const adminInfo = {
  name: '系统管理员',
  role: '超级管理员',
  department: '电梯维护部',
  phone: '138****8888',
  email: 'admin@elevator.com',
  lastLogin: '2023-12-20 10:30:45',
  permissions: ['系统配置', '用户管理', '电梯监控', '维护记录', '报警处理']
};

// 模拟系统信息
const systemInfo = ref({
  version: 'v1.0.0',
  uptime: '15天8小时37分钟',
  totalElevators: 12,
  activeAlerts: 3,
  pendingMaintenance: 2,
});

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  router.push('/login');
};

// 返回主页
const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="back-button" @click="goToHome">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回主页</span>
      </div>
      <h1>管理员控制台</h1>
    </div>
    
    <div class="admin-container">
      <div class="admin-profile panel">
        <div class="profile-header">
          <div class="profile-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="profile-basic-info">
            <h2>{{ adminInfo.name }}</h2>
            <div class="role-badge">{{ adminInfo.role }}</div>
            <div class="last-login">上次登录: {{ adminInfo.lastLogin }}</div>
          </div>
        </div>
        
        <div class="profile-details">
          <div class="details-section">
            <h3>个人信息</h3>
            <div class="detail-item">
              <span class="detail-label">部门:</span>
              <span class="detail-value">{{ adminInfo.department }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">电话:</span>
              <span class="detail-value">{{ adminInfo.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">邮箱:</span>
              <span class="detail-value">{{ adminInfo.email }}</span>
            </div>
          </div>
          
          <div class="details-section">
            <h3>权限信息</h3>
            <div class="permissions-list">
              <span v-for="(permission, index) in adminInfo.permissions" :key="index" class="permission-tag">
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="admin-actions panel">
        <h3>快速操作</h3>
        <div class="actions-grid">
          <div class="action-card">
            <div class="action-icon">📊</div>
            <div class="action-text">系统报表</div>
          </div>
          <div class="action-card" @click="() => router.push('/user-management')">
            <div class="action-icon">👥</div>
            <div class="action-text">用户管理</div>
          </div>
          <div class="action-card">
            <div class="action-icon">🔧</div>
            <div class="action-text">系统设置</div>
          </div>
          <div class="action-card">
            <div class="action-icon">🔔</div>
            <div class="action-text">通知中心</div>
          </div>
          <div class="action-card" @click="() => router.push('/maintenance-log')">
            <div class="action-icon">📝</div>
            <div class="action-text">维护记录</div>
          </div>
          <div class="action-card"  @click="() => router.push('/abnormal-data')">
            <div class="action-icon">⚠️</div>
            <div class="action-text">报警管理</div>
          </div>
        </div>
      </div>
      
      <div class="admin-system panel">
        <h3>系统信息</h3>
        <div class="system-info-grid">
          <div class="system-info-item">
            <div class="info-label">系统版本</div>
            <div class="info-value">{{ systemInfo.version }}</div>
          </div>
          <div class="system-info-item">
            <div class="info-label">运行时间</div>
            <div class="info-value">{{ systemInfo.uptime }}</div>
          </div>
          <div class="system-info-item">
            <div class="info-label">电梯总数</div>
            <div class="info-value">{{ systemInfo.totalElevators }}</div>
          </div>
          <div class="system-info-item">
            <div class="info-label">活跃警报</div>
            <div class="info-value alert">{{ systemInfo.activeAlerts }}</div>
          </div>
          <div class="system-info-item">
            <div class="info-label">待维护</div>
            <div class="info-value warning">{{ systemInfo.pendingMaintenance }}</div>
          </div>
        </div>
      </div>
      
      <button class="logout-button" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>退出登录</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a1a 100%);
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  cursor: pointer;
  position: absolute;
  left: 0;
  transition: color 0.2s;
}

.back-button:hover {
  color: var(--text-color);
}

.back-button svg {
  margin-right: 5px;
}

.admin-header h1 {
  margin: 0;
  text-align: center;
  width: 100%;
  font-size: 2rem;
  color: var(--text-color);
  background: linear-gradient(90deg, var(--primary-color), #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.admin-profile {
  grid-column: 1;
  grid-row: span 2;
}

.profile-header {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  margin-right: 20px;
  color: var(--primary-color);
}

.profile-basic-info {
  flex: 1;
}

.profile-basic-info h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.role-badge {
  display: inline-block;
  padding: 5px 10px;
  background: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.last-login {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.details-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 5px;
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
}

.detail-label {
  width: 80px;
  color: var(--text-secondary);
}

.detail-value {
  flex: 1;
  color: var(--text-color);
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  display: inline-block;
  padding: 5px 10px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 5px;
  font-size: 0.9rem;
  color: var(--primary-color);
}

.admin-actions {
  grid-column: 2;
}

.admin-actions h3, .admin-system h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 5px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.action-text {
  font-size: 0.9rem;
  color: var(--text-color);
}

.admin-system {
  grid-column: 2;
}

.system-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.system-info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.info-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.2rem;
  color: var(--text-color);
  font-weight: 600;
}

.info-value.alert {
  color: #e74c3c;
}

.info-value.warning {
  color: #f39c12;
}

.logout-button {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;
}

.logout-button:hover {
  background: rgba(231, 76, 60, 0.2);
}

.logout-button svg {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .admin-container {
    grid-template-columns: 1fr;
  }
  
  .admin-profile, .admin-actions, .admin-system, .logout-button {
    grid-column: 1;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 