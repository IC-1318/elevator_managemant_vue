<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import TechGridBackground from '../components/TechGridBackground.vue';
import { useAIAnalysis } from '../composables/useAIAnalysis.js';

const router = useRouter();
const isAIExpanded = ref(false);
const isDetailedAnalysisOpen = ref(false);
const isLoading = ref(false);
const detailedAnalysis = ref('');

// 切换AI分析展开状态
const toggleAIAnalysis = () => {
  isAIExpanded.value = !isAIExpanded.value;
  if (isAIExpanded.value) {
    // 当展开时，请求简要AI分析
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 800);
  }
};

// 请求详细AI分析
const requestDetailedAnalysis = () => {
  isDetailedAnalysisOpen.value = true;
  isLoading.value = true;
  
  // 模拟请求详细AI分析
  setTimeout(() => {
    detailedAnalysis.value = `基于当前系统状态的深度分析：
    
1. 性能评估：
   - 系统健康度评分为${systemHealth.value.score}%，表现${systemHealth.value.status}
   - 存在${systemInfo.value.activeAlerts}个活跃警报需要立即处理
   - ${systemInfo.value.pendingMaintenance}台电梯处于待维护状态
   
2. 风险分析：
   - 5号电梯振动参数超标12%，建议72小时内进行检修
   - 3号电梯门系统响应时间延长，可能存在卡阻风险
   - 8号电梯能耗指标异常，可能存在电气系统问题
   
3. 优化建议：
   - 建议调整7号电梯的运行曲线以降低峰值功耗
   - 2号和4号电梯可调整楼层等待时间，优化高峰期运行效率
   - 建议对1号电梯进行润滑油更换，预防性维护
   
4. 预测性分析：
   - 根据当前使用模式，预计下一次系统维护窗口为15天后
   - 预测下周五将出现乘客高峰期，建议提前调整电梯配置
   - 基于历史数据，预计3号电梯将在25天内达到维护阈值

5. 长期规划：
   - 建议更新电梯群控算法，预计可提升整体效率8.5%
   - 考虑对老旧电梯组件进行现代化改造，延长使用寿命
   - 建议实施预测性维护计划，可减少计划外停机时间约22%`;
    
    isLoading.value = false;
  }, 1500);
};

// 关闭详细分析面板
const closeDetailedAnalysis = () => {
  isDetailedAnalysisOpen.value = false;
};

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

// AI分析数据
const { aiRecommendation } = useAIAnalysis();

// 快速操作菜单
const quickActions = [
  { name: '系统报表', icon: '📊', route: '/', color: 'rgba(33, 150, 243, 0.3)' },
  { name: '用户管理', icon: '👥', route: '/user-management', color: 'rgba(76, 175, 80, 0.3)' },
  { name: '维护记录', icon: '📝', route: '/maintenance-log', color: 'rgba(255, 152, 0, 0.3)' },
  { name: '报警管理', icon: '⚠️', route: '/abnormal-data', color: 'rgba(244, 67, 54, 0.3)' },
];

// 系统健康状态
const systemHealth = computed(() => {
  const total = systemInfo.value.totalElevators;
  const alerts = systemInfo.value.activeAlerts;
  const maintenance = systemInfo.value.pendingMaintenance;
  
  const healthScore = Math.round(((total - alerts - maintenance) / total) * 100);
  
  return {
    score: healthScore,
    status: healthScore > 90 ? '优秀' : healthScore > 75 ? '良好' : healthScore > 60 ? '一般' : '需注意',
    color: healthScore > 90 ? '#4caf50' : healthScore > 75 ? '#2196f3' : healthScore > 60 ? '#ff9800' : '#f44336'
  };
});

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  router.push('/login');
};

// 返回主页
const goToHome = () => {
  router.push('/');
};

// 处理快捷操作点击
const handleQuickActionClick = (route) => {
  router.push(route);
};
</script>

<template>
  <div class="admin-page">
    <TechGridBackground />
    
    <div class="admin-header">
      <div class="back-button" @click="goToHome">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </div>
      <h1 class="admin-title tech-text glow">管理员控制台</h1>
    </div>
    
    <div class="admin-content">
      <div class="admin-container">
        <!-- 管理员资料面板 -->
        <div class="admin-profile panel">
          <div class="panel-header">
            <h3 class="panel-title tech-text">管理员信息</h3>
            <div class="tech-decoration"></div>
          </div>
          
          <div class="profile-content">
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
                <h4 class="actions-title">权限操作</h4>
                <div class="actions-grid">
                  <div class="action-card" @click="handleQuickActionClick('/user-management')">
                    <span class="action-icon">👥</span>
                    <span class="action-text">用户管理</span>
                  </div>
                  <div class="action-card" @click="handleQuickActionClick('/abnormal-data')">
                    <span class="action-icon">🚨</span>
                    <span class="action-text">警报管理</span>
                  </div>
                  <div class="action-card" @click="handleQuickActionClick('/maintenance-log')">
                    <span class="action-icon">🛠️</span>
                    <span class="action-text">维修日志</span>
                  </div>
                  <div class="action-card" @click="handleQuickActionClick('/')">
                    <span class="action-icon">📊</span>
                    <span class="action-text">系统报表</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 系统概况面板 -->
        <div class="admin-system panel">
          <div class="panel-header">
            <h3 class="panel-title tech-text">系统概况</h3>
            <div class="tech-decoration"></div>
          </div>
          
          <div class="system-overview">
            <div class="system-health">
              <div class="health-gauge">
                <div class="svg-container">
                  <svg viewBox="0 0 36 36" class="health-chart">
                    <path class="health-circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="health-circle"
                      :stroke="systemHealth.color"
                      :stroke-dasharray="`${systemHealth.score}, 100`"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div class="health-score-container">
                    <div class="health-score tech-text">{{ systemHealth.score }}%</div>
                  </div>
                </div>
                <div class="health-status" :style="{'color': systemHealth.color}">
                  系统状态: {{ systemHealth.status }}
                </div>
              </div>
            </div>
            
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
            
            <!-- AI分析部分 -->
            <div class="system-ai-analysis">
              <div class="ai-toggle" @click="toggleAIAnalysis">
                <span class="ai-icon">🤖</span>
                <span class="ai-label">AI 分析</span>
                <span class="ai-arrow" :class="{ 'expanded': isAIExpanded }">▼</span>
              </div>
              
              <div class="ai-content" v-if="isAIExpanded">
                <div v-if="isLoading" class="ai-loading">
                  <div class="spinner"></div>
                  <span>分析中...</span>
                </div>
                <div v-else class="ai-recommendation">
                  <h4>AI 系统建议</h4>
                  <div class="ai-message">{{ aiRecommendation }}</div>
                  
                  <div class="ai-actions">
                    <button class="ai-button" @click="requestDetailedAnalysis">
                      <span>详细分析</span>
                      <span class="button-icon">▶</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析滑出面板 -->
    <div class="detailed-analysis-panel" :class="{ 'panel-open': isDetailedAnalysisOpen }">
      <div class="panel-header">
        <h3 class="panel-title tech-text">AI 深度分析报告</h3>
        <button class="close-button" @click="closeDetailedAnalysis">✕</button>
      </div>
      
      <div class="panel-content">
        <div v-if="isLoading" class="ai-loading">
          <div class="spinner"></div>
          <span>生成深度分析中...</span>
        </div>
        <div v-else class="detailed-content">
          <pre class="analysis-text">{{ detailedAnalysis }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  width: 100%;
  padding: 1.5vh;
  box-sizing: border-box;
  position: relative;
  background: transparent;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5vh 2vw;
  margin-bottom: 4vh; /* 从2vh增加到4vh，增大底部外边距 */
  position: relative;
}

.admin-content {
  padding: 0;
  box-sizing: border-box;
  margin-top: 3vh; /* 增加上边距，让内容往下移 */
}

.admin-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: minmax(min-content, max-content);
  grid-template-areas:
    "profile system";
  gap: 2vh;
}

.admin-profile {
  grid-area: profile;
}

.admin-system {
  grid-area: system;
}

.panel {
  background: rgba(13, 31, 61, 0.2);
  border: 1px solid rgba(30, 144, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
  backdrop-filter: blur(1px);
  padding: 2vh;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #2196f3, transparent);
}

.panel:hover {
  box-shadow: 0 0 25px rgba(33, 150, 243, 0.4);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid rgba(33, 150, 243, 0.3);
  width: 100%;
}

.panel-title {
  font-size: 1.4rem;
  margin: 0;
  color: #4dabf5;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(77, 171, 245, 0.5);
}

.tech-decoration {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
  border-radius: 1px;
  position: relative;
}

.tech-decoration::before {
  content: '';
  position: absolute;
  right: -10px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: rgba(77, 171, 245, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(77, 171, 245, 0.8);
}

.tech-text {
  font-family: 'Orbitron', sans-serif;
}

/* 管理员资料样式 */
.profile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  margin-bottom: 2vh;
  padding-bottom: 2vh;
  border-bottom: 1px solid rgba(33, 150, 243, 0.3);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 50%;
  margin-right: 20px;
  color: #4dabf5;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.3);
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
  background: rgba(33, 150, 243, 0.1);
  color: #4dabf5;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 5px;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.last-login {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.details-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
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

/* 系统概况样式 */
.system-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  flex: 1;
}

.system-health {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5vh;
  padding-bottom: 0.5vh;
  width: 100%;
}

.health-gauge {
  width: 100%;
  max-width: 280px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.svg-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.health-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.health-circle-bg {
  fill: none;
  stroke: rgba(33, 150, 243, 0.1);
  stroke-width: 2.5;
}

.health-circle {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.health-score-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-score {
  color: #4dabf5;
  font-size: 2.5rem;
  font-weight: 700;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}

.health-status {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
  margin-top: 10px;
}

.system-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.8vh;
  flex: 1;
}

.system-info-item {
  background: rgba(13, 31, 61, 0.4);
  border-radius: 8px;
  padding: 0.5vh;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid rgba(33, 150, 243, 0.2);
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 0;
  justify-content: center;
}

.system-info-item:hover {
  background: rgba(13, 31, 61, 0.6);
  transform: translateY(-2px);
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.2vh;
}

.info-value {
  font-size: 1rem;
  color: #4dabf5;
  font-weight: 600;
  line-height: 1;
  padding-bottom: 0.2vh;
}

.info-value.alert {
  color: #f44336;
}

.info-value.warning {
  color: #ff9800;
}

/* AI分析部分样式 */
.system-ai-analysis {
  margin-top: 2vh;
  border-top: 1px solid rgba(33, 150, 243, 0.3);
  padding-top: 2vh;
}

.ai-toggle {
  display: flex;
  align-items: center;
  background: rgba(33, 150, 243, 0.1);
  padding: 1vh 1.5vw;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(33, 150, 243, 0.3);
  width: 100%; /* 增加宽度到100%，使框更长 */
}

.ai-toggle:hover {
  background: rgba(33, 150, 243, 0.2);
}

.ai-icon {
  font-size: 1.4rem;
  margin-right: 1vw;
}

.ai-label {
  flex: 1;
  font-weight: 500;
  color: #4dabf5;
}

.ai-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.ai-arrow.expanded {
  transform: rotate(180deg);
}

.ai-content {
  margin-top: 1.5vh;
  background: rgba(33, 150, 243, 0.05);
  border-radius: 8px;
  padding: 1.5vh;
  border: 1px solid rgba(33, 150, 243, 0.2);
  max-height: 50vh;
  overflow-y: auto;
  width: 100%; /* 确保内容区域也是100%宽度 */
}

.ai-recommendation h4 {
  margin: 0 0 1vh 0;
  color: #4dabf5;
  font-size: 1rem;
}

.ai-message {
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text-color);
  margin-bottom: 1.5vh;
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
}

.ai-button {
  display: flex;
  align-items: center;
  background: rgba(33, 150, 243, 0.2);
  color: #4dabf5;
  border: 1px solid rgba(33, 150, 243, 0.4);
  border-radius: 4px;
  padding: 0.8vh 1.5vw;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.ai-button:hover {
  background: rgba(33, 150, 243, 0.3);
}

.button-icon {
  margin-left: 8px;
  font-size: 0.7rem;
}

/* 加载动画 */
.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #4dabf5;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(33, 150, 243, 0.2);
  border-top-color: #4dabf5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 详细分析滑出面板 */
.detailed-analysis-panel {
  position: fixed;
  top: 0;
  right: -600px;
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  background: rgba(13, 31, 61, 0.95);
  border-left: 1px solid rgba(33, 150, 243, 0.6);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.detailed-analysis-panel.panel-open {
  right: 0;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid rgba(33, 150, 243, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  color: #4dabf5;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #ffffff;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.detailed-content {
  color: var(--text-color);
}

.analysis-text {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-color);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .detailed-analysis-panel {
    width: 450px;
  }
}

@media (max-width: 768px) {
  .detailed-analysis-panel {
    width: 100%;
  }
}

/* 面板底部样式 */
.panel-footer {
  margin-top: 1vh;
  text-align: center;
}

.view-more-button {
  background: rgba(33, 150, 243, 0.1);
  color: #4dabf5;
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 4px;
  padding: 0.5vh 1vw;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.view-more-button:hover {
  background: rgba(33, 150, 243, 0.2);
}

/* 登出按钮样式 */
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
  padding: 0.5vh 1vw;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-button:hover {
  background: rgba(244, 67, 54, 0.2);
}

.logout-button svg {
  margin-right: 5px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(33, 150, 243, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(33, 150, 243, 0.5);
}

/* 响应式布局 */
@media (max-width: 1600px) {
  .admin-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1200px) {
  .admin-container {
    grid-template-columns: 1fr;
    grid-template-areas:
      "profile"
      "system";
  }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1vh;
  }
  
  .back-button {
    align-self: flex-start;
  }
}

.admin-title {
  font-size: 2rem;
  color: #4dabf5;
  margin: 0;
  background: linear-gradient(90deg, #4dabf5, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.back-button {
  position: absolute;
  left: 2vw;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.back-button:hover {
  color: var(--text-color);
}

.back-button svg {
  margin-right: 5px;
  stroke: #4dabf5;
}

/* 快速操作样式 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5vh;
}

.action-card {
  background: var(--card-color, rgba(33, 150, 243, 0.1));
  border-radius: 10px;
  padding: 1.5vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.action-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateY(5px);
  transition: transform 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-card:hover::after {
  transform: translateY(0);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1vh;
}

.action-text {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 500;
}

.actions-title {
  font-size: 1.1rem;
  color: #a9a9a9;
  margin-top: 30px;
  margin-bottom: 15px;
  font-weight: 500;
}
</style> 