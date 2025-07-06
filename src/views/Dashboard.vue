<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import ElevatorVisualizer from '../components/ElevatorVisualizer.vue';
import ControlPanel from '../components/ControlPanel.vue';
import HeaderPanel from '../components/HeaderPanel.vue';
import FooterPanel from '../components/FooterPanel.vue';
import AICenterNotification from '../components/AICenterNotification.vue';
import AbnormalDataLog from '../components/AbnormalDataLog.vue';
import DataCollectionService from '../services/DataCollectionService';
import elevatorSocketService from '../services/elevatorSocketService';
import { useElevatorSimulation } from '../composables/useElevatorSimulation.js';
import { useAIAnalysis } from '../composables/useAIAnalysis.js';

const router = useRouter();

// 电梯核心状态数据 (由前端模拟驱动)
const elevatorData = ref({
  id: 'EL-001',
  currentFloor: 1,
  targetFloor: 5,
  status: '运行中',
  speed: 2.5,
  direction: '上行',
  doorStatus: '关闭',
  loadWeight: 320,
  maxWeight: 1000,
  temperature: 24.5,
  maintenanceStatus: '正常',
  lastMaintenance: '2023-12-15',
  totalTrips: 12543,
  operatingHours: 5231,
  energyConsumption: 45.2,
  floorCount: 15,
  systems: [ /* 初始系统数据可以保留或从API获取 */ ]
});

// 新增：用于存储来自后端WebSocket的、专供3D可视化的数据
const visualizerData = ref(null);

// 计算属性：优先使用后端可视化数据，如果不存在则回退到前端模拟数据
const dataForVisualizer = computed(() => visualizerData.value || elevatorData.value);

const elevatorRunning = ref(true);

// 使用前端模拟 Composable
const { startSimulation } = useElevatorSimulation(elevatorData, elevatorRunning);
let simulationInterval = null;

// 核心控制功能
const stopElevator = () => {
  console.log('严重故障，停止电梯运行');
  elevatorRunning.value = false;
  elevatorData.value.status = '停止运行';
};
const resumeElevator = () => {
  console.log('维修完成，恢复电梯运行');
  elevatorRunning.value = true;
  elevatorData.value.status = '运行中';
  elevatorData.value.systems.forEach(system => {
    system.status = '正常';
    system.faultCode = '无';
  });
};

// 使用AI分析 Composable
const {
  centerAIResult,
  showCenterNotification,
  aiRecommendation,
  generateAbnormalData,
  isProcessingAI,
  analysisStep,
} = useAIAnalysis(stopElevator);

// 3D模式状态
const is360ModeActive = ref(false);

// 数据采集服务实例
const dataCollectionService = new DataCollectionService({
  collectionInterval: 5000,
  batchSize: 5
});

// 切换360°展示模式
const toggle360Mode = () => {
  is360ModeActive.value = !is360ModeActive.value;
  console.log(`360°展示模式: ${is360ModeActive.value ? '开启' : '关闭'}`);
};

// 跳转到系统详情页
const navigateToSystemDetail = (systemId) => {
  let routeName = '';
  switch (systemId) {
    case 'sys-001': routeName = 'traction-system'; break;
    case 'sys-002': routeName = 'guidance-system'; break;
    case 'sys-003': routeName = 'electrical-system'; break;
    case 'sys-004': routeName = 'door-system'; break;
    default: routeName = 'traction-system';
  }
  router.push({ name: routeName });
};

// 处理WebSocket消息的回调函数
const handleElevatorDataUpdate = (data) => {
  // 只更新用于可视化的数据
  visualizerData.value = data;
};

// 组件挂载后
onMounted(() => {
  // 启动前端自己的数据模拟
  simulationInterval = startSimulation();
  // 连接WebSocket以获取后端可视化数据
  elevatorSocketService.connect(elevatorData.value.id, handleElevatorDataUpdate);
});

// 清理函数
onBeforeUnmount(() => {
  // 停止前端模拟
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  // 断开WebSocket连接
  elevatorSocketService.disconnect();
});

// 处理新通知组件的回调
const handleCenterNotificationClose = () => {
  showCenterNotification.value = false;
};

// 处理系统详情查看
const handleCenterSystemDetails = (systemId) => {
  navigateToSystemDetail(systemId);
  showCenterNotification.value = false;
};

// 处理维修完成回调
const handleCenterRepairComplete = () => {
  resumeElevator();
  showCenterNotification.value = false;
};
</script>

<template>
  <div class="dashboard">
    <HeaderPanel class="header" :elevatorId="elevatorData.id" />
    
    <div class="sidebar panel">
      <div class="panel-header">
        <h2 class="panel-title tech-text">控制面板</h2>
        <div class="tech-decoration"></div>
      </div>
      <ControlPanel :elevatorData="elevatorData" />
    </div>
    
    <div class="main panel">
      <div class="panel-header">
        <div class="tech-decoration"></div>
      </div>
      <ElevatorVisualizer 
        :animationData="dataForVisualizer" 
        :is-360-mode-active="is360ModeActive"
        @toggle-360-mode="toggle360Mode"
        @system-click="navigateToSystemDetail"
      />
    </div>
    
    <div class="abnormal-data panel">
      <div class="panel-header">
        <h2 class="panel-title tech-text">异常数据记录</h2>
        <div class="tech-decoration"></div>
      </div>
      <AbnormalDataLog />
    </div>
    
    <div class="footer panel">
      <FooterPanel @generate-abnormal-data="generateAbnormalData" :analysisStep="analysisStep" />
    </div>
    
    <AICenterNotification
      :analysisResult="centerAIResult"
      :visible="showCenterNotification"
      :aiRecommendation="aiRecommendation"
      :isProcessing="isProcessingAI"
      @close="handleCenterNotificationClose"
      @view-details="handleCenterSystemDetails"
      @repair-complete="handleCenterRepairComplete"
    />
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
}
</style>

<style scoped>
.dashboard {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(450px, 2fr) minmax(300px, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main abnormal-data"
    "footer footer footer";
  gap: 1.5vh;
  box-sizing: border-box;
  padding: 1vh;
  min-height: 100vh;
}

.header {
  grid-area: header;
  z-index: 1;
  padding: 1vh;
  min-height: 85px;
  width: 100%;
  box-sizing: border-box;
}

.sidebar {
  grid-area: sidebar;
  min-width: 300px;
  overflow-y: auto;
  z-index: 1;
  padding: 1vh;
  box-sizing: border-box;
  height: auto;
  min-height: 600px;
}

.main {
  grid-area: main;
  z-index: 1;
  overflow: auto;
  min-width: 450px;
  padding: 1vh;
  box-sizing: border-box;
  min-height: 600px;
  height: auto;
  display: flex;
  flex-direction: column;
}

.abnormal-data {
  grid-area: abnormal-data;
  overflow-y: auto;
  z-index: 1;
  min-width: 300px;
  padding: 1vh;
  box-sizing: border-box;
  min-height: 600px;
  height: auto;
}

.footer {
  grid-area: footer;
  z-index: 1;
  min-height: 70px;
  width: 100%;
  padding: 1vh;
  box-sizing: border-box;
  margin-top: 1vh;
}

.footer.panel {
  border: none;
  box-shadow: none;
}

.panel {
  background: transparent;
  border: 1px solid rgba(64, 128, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 100, 255, 0.15),
              inset 0 0 30px rgba(0, 60, 120, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0;
  padding: 1.5vh;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid rgba(64, 128, 255, 0.2);
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

.tech-text {
  font-family: 'Orbitron', sans-serif;
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

/* 响应式布局优化 */
@media (max-width: 1600px) {
  .dashboard {
    grid-template-columns: 300px 1fr 300px;
    grid-template-rows: auto 1fr auto;
  }
  
  .sidebar, .main, .abnormal-data {
    min-height: 550px;
  }
}

@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "abnormal-data"
      "footer";
  }
  
  .sidebar, .main, .abnormal-data {
    min-width: 100%;
    min-height: 450px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(64, 128, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 128, 255, 0.5);
}
</style>