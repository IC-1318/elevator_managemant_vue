<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { maintenanceApi } from '../api';
import { ElMessage } from 'element-plus';
import AuthService from '../services/authService';

const router = useRouter();
const userInfo = ref(AuthService.getCurrentUser() || {});
const userRole = ref(AuthService.getUserRole());
const loading = ref(false);
const allTasks = ref([]);
const currentView = ref('current'); // 'current' 或 'history'

// 当前任务（只显示一个待处理任务）
const currentTask = computed(() => {
  const pending = allTasks.value.filter(task => task.status !== '已维护');
  return pending.length > 0 ? pending[0] : null;
});

// 历史任务
const completedTasks = computed(() => {
  return allTasks.value.filter(task => task.status === '已维护');
});

const fetchTasks = async () => {
  loading.value = true;
  try {
    // 获取分配给当前维修人员的任务
    const params = {
      userId: userInfo.value?.id,
      current: 1,
      size: 100
    };
    
    const response = await maintenanceApi.getMaintenance(params);
    if (response.data.code === 200) {
      allTasks.value = response.data.data.records || [];
    } else {
      ElMessage.error('获取任务失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取任务出错:', error);
    ElMessage.error('获取任务出错');
  } finally {
    loading.value = false;
  }
};

const completeTask = async (task) => {
  try {
    const updateData = {
      id: task.id,
      user_id: task.userId || userInfo.value?.id,
      status: '已维护',
      remark: task.remark || '维修完成'
    };
    
    const response = await maintenanceApi.updateMaintenance(updateData);
    if (response.data.code === 200) {
      ElMessage.success('任务已标记为已维护');
      fetchTasks(); // 重新获取任务列表
    } else {
      ElMessage.error('更新任务状态失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('更新任务状态出错:', error);
    ElMessage.error('更新任务状态出错');
  }
};

// 打开详情页
const viewTaskDetail = (task) => {
  // 这里可以实现查看详细信息的功能
  console.log('查看任务详情:', task);
};

// 登出功能
const handleLogout = async () => {
  try {
    await AuthService.logout();
    ElMessage.success('已成功登出');
    router.push('/login');
  } catch (error) {
    console.error('登出失败:', error);
    ElMessage.error('登出失败，请重试');
    // 即使登出失败，也跳转到登录页
    router.push('/login');
  }
};

// 页面挂载时获取数据
onMounted(() => {
  fetchTasks();
});
</script>

<template>
  <div class="maintenance-dashboard">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="logo">
          <div class="logo-icon">🔧</div>
          <span class="logo-text">智云梯维修</span>
        </div>
      </div>
      <div class="nav-right">
         <div class="user-info-section">
           <div class="welcome-text">欢迎您，{{ userInfo?.name || userInfo?.userName || userInfo?.userPhone || '维修员' }}</div>
           <div class="user-avatar">
             <div class="avatar-circle">{{ (userInfo?.name || userInfo?.userName || userInfo?.userPhone || '维修员').charAt(0) }}</div>
           </div>
         </div>
         <el-button class="logout-btn" @click="handleLogout" size="small" text>
           <svg class="logout-icon" viewBox="0 0 24 24" fill="none">
             <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg>
         </el-button>
       </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 底部导航 -->
      <div class="bottom-nav">
        <div 
          class="nav-item" 
          :class="{ active: currentView === 'current' }"
          @click="currentView = 'current'"
        >
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-label">当前任务</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: currentView === 'history' }"
          @click="currentView = 'history'"
        >
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2M9 11V9a2 2 0 1 1 4 0v2M9 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-label">历史记录</span>
        </div>
      </div>

      <!-- 当前任务视图 -->
      <div v-if="currentView === 'current'" class="current-task-view" v-loading="loading">
        <div v-if="!currentTask" class="no-task">
          <div class="no-task-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>暂无待处理任务</h3>
          <p>当前没有分配给您的维修任务</p>
          <el-button @click="fetchTasks" :loading="loading" class="refresh-btn">
            刷新任务
          </el-button>
        </div>
        
        <div v-else class="task-card-mobile">
          <div class="task-header-mobile">
            <div class="task-priority">
              <div class="priority-dot"></div>
              <span>紧急任务</span>
            </div>
            <div class="task-id">ID: {{ currentTask.id }}</div>
          </div>
          
          <div class="task-system">
            <div class="system-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="system-info">
              <h3>{{ currentTask.systemName }}</h3>
              <p class="system-desc">智云梯系统维护</p>
            </div>
          </div>
          
          <div class="task-details">
            <div class="detail-item">
              <span class="detail-label">维护时间</span>
              <span class="detail-value">{{ currentTask.mtTime }}</span>
            </div>
            <div v-if="currentTask.remark" class="detail-item">
              <span class="detail-label">备注说明</span>
              <span class="detail-value">{{ currentTask.remark }}</span>
            </div>
          </div>
          
          <div class="task-actions-mobile">
            <el-button class="action-btn secondary" @click="viewTaskDetail(currentTask)">
              查看详情
            </el-button>
            <el-button class="action-btn primary" @click="completeTask(currentTask)">
              完成维修
            </el-button>
          </div>
        </div>
      </div>

      <!-- 历史记录视图 -->
      <div v-if="currentView === 'history'" class="history-view" v-loading="loading">
        <div v-if="completedTasks.length === 0" class="no-history">
          <div class="no-history-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>暂无历史记录</h3>
          <p>您还没有完成任何维修任务</p>
        </div>
        
        <div v-else class="history-list">
          <div v-for="task in completedTasks" :key="task.id" class="history-item">
            <div class="history-header">
              <div class="history-status">
                <div class="status-dot completed"></div>
                <span>已完成</span>
              </div>
              <div class="history-date">{{ task.mtTime }}</div>
            </div>
            <div class="history-content">
              <h4>{{ task.systemName }}</h4>
              <p v-if="task.remark">{{ task.remark }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0f1419 100%);
  color: #ffffff;
  position: relative;
  overflow-x: hidden;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-text {
  color: #e0e7ff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.logout-btn {
  color: #94a3b8 !important;
  padding: 8px !important;
}

.logout-icon {
  width: 20px;
  height: 20px;
}

/* 主要内容区域 */
.main-content {
  padding: 20px;
  padding-bottom: 100px;
  min-height: calc(100vh - 80px);
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 80px;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.nav-item.active .nav-icon {
  color: #3b82f6;
}

.nav-label {
  font-size: 12px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.nav-item.active .nav-label {
  color: #3b82f6;
  font-weight: 500;
}

/* 当前任务视图 */
.current-task-view {
  max-width: 500px;
  margin: 0 auto;
}

.no-task {
  text-align: center;
  padding: 60px 20px;
  background: rgba(15, 20, 25, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
}

.no-task-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: #3b82f6;
  opacity: 0.7;
}

.no-task h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #ffffff;
}

.no-task p {
  margin: 0 0 24px;
  color: #94a3b8;
  font-size: 14px;
}

.refresh-btn {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8) !important;
  border: none !important;
  color: white !important;
  padding: 12px 24px !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3) !important;
}

/* 任务卡片 */
.task-card-mobile {
  background: rgba(15, 20, 25, 0.8);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.task-card-mobile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.task-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-priority {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.task-id {
  color: #94a3b8;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.task-system {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.system-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  flex-shrink: 0;
}

.system-info h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #ffffff;
}

.system-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.task-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #94a3b8;
  font-size: 14px;
  flex-shrink: 0;
  margin-right: 16px;
}

.detail-value {
  color: #ffffff;
  font-size: 14px;
  text-align: right;
  word-break: break-word;
}

.task-actions-mobile {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 14px !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
  font-size: 16px !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.action-btn.secondary {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

.action-btn.primary {
  background: linear-gradient(45deg, #10b981, #059669) !important;
  color: white !important;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3) !important;
}

/* 历史记录视图 */
.history-view {
  max-width: 500px;
  margin: 0 auto;
}

.no-history {
  text-align: center;
  padding: 60px 20px;
  background: rgba(15, 20, 25, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
}

.no-history-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: #3b82f6;
  opacity: 0.7;
}

.no-history h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #ffffff;
}

.no-history p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: rgba(15, 20, 25, 0.6);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.completed {
  background: #10b981;
}

.history-date {
  color: #94a3b8;
  font-size: 12px;
}

.history-content h4 {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 16px;
}

.history-content p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .main-content {
    padding: 16px;
  }
  
  .task-card-mobile {
    padding: 20px;
  }
  
  .action-btn {
    font-size: 14px !important;
    padding: 12px !important;
  }
}

/* 自定义加载动画 */
.el-loading-mask {
  background-color: rgba(0, 0, 0, 0.95) !important;
  background: rgba(0, 0, 0, 0.95) !important;
  backdrop-filter: blur(8px) !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 9999 !important;
}

/* 强制覆盖Element Plus默认样式 */
.maintenance-dashboard :deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.95) !important;
  background: rgba(0, 0, 0, 0.95) !important;
}

.current-task-view.el-loading-parent--relative .el-loading-mask,
.history-view.el-loading-parent--relative .el-loading-mask {
  background-color: rgba(0, 0, 0, 0.95) !important;
  background: rgba(0, 0, 0, 0.95) !important;
}

/* 自定义加载器样式 */
:deep(.el-loading-spinner) {
  margin-top: -25px;
}

:deep(.el-loading-spinner .circular) {
  display: none;
}

:deep(.el-loading-spinner .el-loading-text) {
  color: #3b82f6 !important;
  font-size: 14px;
  margin-top: 60px;
}

/* 科技感加载动画 */
:deep(.el-loading-spinner::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 2px solid transparent;
  border-top: 2px solid #3b82f6;
  border-right: 2px solid #60a5fa;
  border-radius: 50%;
  animation: tech-spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

:deep(.el-loading-spinner::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-bottom: 2px solid #10b981;
  border-left: 2px solid #34d399;
  border-radius: 50%;
  animation: tech-spin-reverse 0.8s linear infinite;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

@keyframes tech-spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
}

@keyframes tech-spin-reverse {
  0% {
    transform: translate(-50%, -50%) rotate(360deg);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(16, 185, 129, 0.6);
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }
}
</style>