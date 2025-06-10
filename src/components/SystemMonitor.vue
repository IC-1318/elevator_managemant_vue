<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  elevatorData: {
    type: Object,
    required: true
  }
});

// 当前选中的系统ID
const selectedSystemId = ref(null);

// 切换系统详情展示
const toggleSystemDetails = (systemId) => {
  if (selectedSystemId.value === systemId) {
    selectedSystemId.value = null; // 如果点击的是当前选中的系统，则关闭详情
  } else {
    selectedSystemId.value = systemId; // 否则选中该系统
  }
};

// 计算系统状态类名
const getStatusClass = (status) => {
  return status === '正常' ? 'status-normal' : 'status-warning';
};

// 检查系统是否有故障
const hasSystemFault = computed(() => {
  return props.elevatorData.systems.some(system => system.status !== '正常');
});

// 获取当前选中的系统
const selectedSystem = computed(() => {
  if (!selectedSystemId.value) return null;
  return props.elevatorData.systems.find(system => system.id === selectedSystemId.value);
});

// 判断是否处于详情视图
const isDetailView = computed(() => {
  return selectedSystemId.value !== null;
});

</script>

<template>
  <div class="system-monitor">
    <div class="system-header">
      <div class="section-title">设备系统监控</div>
      <div class="system-status-badge" :class="hasSystemFault ? 'status-warning' : 'status-normal'">
        {{ hasSystemFault ? '系统异常' : '系统正常' }}
      </div>
      <button v-if="isDetailView" @click="selectedSystemId = null" class="back-button">
        <span>返回</span>
      </button>
    </div>
    
    <!-- 系统概览视图 -->
    <div v-if="!isDetailView" class="systems-grid">
      <div 
        v-for="system in elevatorData.systems" 
        :key="system.id"
        class="system-card"
        :class="{ 'has-fault': system.status !== '正常' }"
        @click="toggleSystemDetails(system.id)"
      >
        <div class="system-title">{{ system.name }}</div>
        
        <div class="system-model-container">
          <!-- 这里将来会放置Three.js模型 -->
          <div class="model-placeholder">
            <div class="placeholder-icon">{{ system.icon }}</div>
            <div class="placeholder-text">3D模型预留位置</div>
          </div>
        </div>
        
        <div class="system-info">
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value" :class="getStatusClass(system.status)">
              {{ system.status }}
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">温度</div>
            <div class="info-value tech-text" :class="{'status-warning': system.temperature > 50}">
              {{ system.temperature }}°C
            </div>
          </div>
          
          <div class="info-item" v-if="system.faultCode !== '无'">
            <div class="info-label">故障代码</div>
            <div class="info-value tech-text has-fault">
              {{ system.faultCode }}
            </div>
          </div>
        </div>
        
        <div class="view-details-button">
          <span>查看详情</span>
        </div>
      </div>
    </div>
    
    <!-- 系统详情视图 -->
    <div v-if="isDetailView && selectedSystem" class="system-detail-view">
      <div class="detail-header">
        <h3 class="detail-title">{{ selectedSystem.name }} <span :class="getStatusClass(selectedSystem.status)">{{ selectedSystem.status }}</span></h3>
      </div>
      
      <div class="detail-content">
        <div class="detail-model-container">
          <!-- 这里将来会放置Three.js模型 -->
          <div class="model-placeholder large">
            <div class="placeholder-icon large">{{ selectedSystem.icon }}</div>
            <div class="placeholder-text">3D模型预留位置</div>
          </div>
        </div>
        
        <div class="detail-info-panel">
          <div class="detail-section">
            <h4 class="section-subtitle">基本信息</h4>
            <div class="detail-info-grid">
              <div class="detail-info-item">
                <div class="detail-info-label">运行时间</div>
                <div class="detail-info-value tech-text">{{ selectedSystem.runningHours }}小时</div>
              </div>
              
              <div class="detail-info-item">
                <div class="detail-info-label">温度</div>
                <div class="detail-info-value tech-text" :class="{'status-warning': selectedSystem.temperature > 50}">
                  {{ selectedSystem.temperature }}°C
                </div>
              </div>
              
              <div class="detail-info-item">
                <div class="detail-info-label">故障代码</div>
                <div class="detail-info-value tech-text" :class="{'has-fault': selectedSystem.faultCode !== '无'}">
                  {{ selectedSystem.faultCode }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4 class="section-subtitle">详细参数</h4>
            <div class="detail-params-grid">
              <div v-for="(param, index) in selectedSystem.parameters" :key="index" class="detail-param-item">
                <div class="detail-param-label">{{ param.name }}</div>
                <div class="detail-param-value tech-text">{{ param.value }} {{ param.unit }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4 class="section-subtitle">维护建议</h4>
            <div class="maintenance-tips" v-if="selectedSystem.status === '故障'">
              <p>检测到系统故障，建议进行以下操作：</p>
              <ul>
                <li>检查{{ selectedSystem.name }}的所有连接部件</li>
                <li>确认电源供应是否稳定</li>
                <li>联系专业维修人员进行检修</li>
              </ul>
            </div>
            <div class="maintenance-tips" v-else>
              <p>系统运行正常，建议定期维护：</p>
              <ul>
                <li>每月检查{{ selectedSystem.name }}的运行状态</li>
                <li>每季度进行一次全面检修</li>
                <li>记录运行数据，分析性能趋势</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-monitor {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  overflow-y: auto;
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.system-status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.back-button {
  position: absolute;
  right: 0;
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.5);
  color: #4dabf5;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(33, 150, 243, 0.3);
}

.status-normal {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.5);
}

.status-warning {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.system-card {
  background: rgba(7, 19, 39, 0.5);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(33, 150, 243, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.system-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.2);
}

.system-card.has-fault {
  border-color: rgba(231, 76, 60, 0.5);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);
}

.system-title {
  font-size: 1rem;
  color: #4dabf5;
  font-weight: 600;
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  padding-bottom: 5px;
}

.system-model-container {
  height: 120px;
  background: rgba(13, 31, 61, 0.7);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.model-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-icon {
  font-size: 2rem;
}

.placeholder-icon.large {
  font-size: 4rem;
}

.placeholder-text {
  font-size: 0.8rem;
}

.system-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  font-size: 0.9rem;
  color: #fff;
}

.view-details-button {
  text-align: center;
  padding: 8px;
  background: rgba(33, 150, 243, 0.2);
  border-radius: 4px;
  color: #4dabf5;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.system-card:hover .view-details-button {
  background: rgba(33, 150, 243, 0.4);
}

/* 系统详情视图样式 */
.system-detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(33, 150, 243, 0.3);
  padding-bottom: 10px;
}

.detail-title {
  font-size: 1.2rem;
  color: #4dabf5;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-title span {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.detail-model-container {
  height: 200px;
  background: rgba(13, 31, 61, 0.7);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: rgba(7, 19, 39, 0.5);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.section-subtitle {
  font-size: 1rem;
  color: #4dabf5;
  margin: 0 0 10px 0;
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  padding-bottom: 5px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.detail-info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.detail-info-value {
  font-size: 1rem;
  color: #fff;
}

.detail-params-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-param-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: rgba(13, 31, 61, 0.5);
  padding: 10px;
  border-radius: 6px;
}

.detail-param-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.detail-param-value {
  font-size: 1.1rem;
  color: #fff;
}

.maintenance-tips {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.5;
}

.maintenance-tips ul {
  margin-top: 10px;
  padding-left: 20px;
}

.maintenance-tips li {
  margin-bottom: 5px;
}

.has-fault {
  color: #e74c3c;
}

.has-fault {
  color: #e74c3c;
}

.system-details {
  background: rgba(13, 31, 61, 0.4);
  border-radius: 6px;
  padding: 10px;
}

.details-title {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.param-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

.param-value {
  font-size: 0.8rem;
  color: #fff;
}
</style>