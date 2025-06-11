<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import ElevatorVisualizer from '../components/ElevatorVisualizer.vue';
import ControlPanel from '../components/ControlPanel.vue';
import HeaderPanel from '../components/HeaderPanel.vue';
import FooterPanel from '../components/FooterPanel.vue';
import SystemMonitor from '../components/SystemMonitor.vue';
import AIAnalysisNotification from '../components/AIAnalysisNotification.vue';
import DataCollectionService from '../services/DataCollectionService';

const router = useRouter();

// 电梯状态数据
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
  alerts: [],
  floorCount: 20,
  // 四大系统监控数据
  systems: [
    {
      id: 'sys-001',
      name: '曳引系统',
      icon: '⚙️',
      status: '正常',
      runningHours: 5231,
      temperature: 65.5,
      faultCode: '无',
      parameters: [
        { name: '电机温度', value: 65.5, unit: '°C', normal: '≤80°C' },
        { name: '轴承温度', value: 75.2, unit: '°C', normal: '≤95°C' },
        { name: '振动速度', value: 1.8, unit: 'mm/s', normal: '≤2.8 mm/s' },
        { name: '电流', value: 18.5, unit: 'A', normal: '额定值±10%' },
        { name: '钢丝绳磨损', value: 5.2, unit: '%', normal: '≤10%' },
        { name: '断丝数', value: 2, unit: '根/股', normal: '≤5根/股' },
        { name: '制动间隙', value: 0.8, unit: 'mm', normal: '0.5-1.0 mm' }
      ]
    },
    {
      id: 'sys-002',
      name: '导向系统',
      icon: '🔄',
      status: '正常',
      runningHours: 5231,
      temperature: 38.2,
      faultCode: '无',
      parameters: [
        { name: '导轨垂直度偏差', value: 0.3, unit: 'mm/m', normal: '≤0.5 mm/m' },
        { name: '接头间隙', value: 0.4, unit: 'mm', normal: '≤0.5 mm' },
        { name: '导靴磨损量', value: 1.2, unit: 'mm', normal: '≤2 mm' },
        { name: '振动值', value: 0.8, unit: 'mm/s', normal: '≤2.8 mm/s' }
      ]
    },
    {
      id: 'sys-003',
      name: '电气控制系统',
      icon: '⚡',
      status: '正常',
      runningHours: 5231,
      temperature: 38.5,
      faultCode: '无',
      parameters: [
        { name: '电压波动', value: 5.2, unit: '%', normal: '±10%内' },
        { name: '电流负载', value: 85, unit: '%', normal: '≤额定值' },
        { name: '触点电压降', value: 45, unit: 'mV', normal: '≤50 mV' },
        { name: '控制响应时间', value: 0.4, unit: 's', normal: '≤0.5秒' },
        { name: '电源开关状态', value: '正常', unit: '', normal: '控制箱' }
      ]
    },
    {
      id: 'sys-004',
      name: '门系统',
      icon: '🚪',
      status: '正常',
      runningHours: 5231,
      temperature: 32.1,
      faultCode: '无',
      parameters: [
        { name: '触点电阻', value: 0.3, unit: 'Ω', normal: '≤0.5 Ω' },
        { name: '机械闭合深度', value: 8.5, unit: 'mm', normal: '≥7 mm' },
        { name: '开关门时间', value: 2.5, unit: 's', normal: '2-3 s' },
        { name: '门机电流', value: 2.4, unit: 'A', normal: '额定值±10%' }
      ]
    }
  ]
});

// AI分析结果
const aiAnalysisResult = ref(null);
const showAINotification = ref(false);

// 定时器变量
let aiAnalysisInterval = null;

// 数据采集服务实例
const dataCollectionService = new DataCollectionService({
  collectionInterval: 5000, // 5秒采集一次数据
  batchSize: 5 // 每5条异常数据批量发送
});

// 跳转到系统详情页
const navigateToSystemDetail = (systemId) => {
  router.push(`/system/${systemId}`);
};

// 处理异常检测回调
const handleAnomalyDetected = (anomalies) => {
  console.log('检测到异常数据:', anomalies);
  // 可以在这里添加本地通知或其他处理
};

// 获取AI分析结果
const fetchAIAnalysis = async () => {
  try {
    // 模拟从后端获取AI分析结果
    // 实际项目中应该调用dataCollectionService.getAIAnalysis()
    const mockAIResult = {
      id: 'ai-analysis-001',
      timestamp: Date.now(),
      systemId: 'sys-001', // 对应系统ID
      severity: Math.random() > 0.5 ? 'warning' : 'critical', // 随机严重程度
      systemInfo: {
        name: '曳引系统',
        status: Math.random() > 0.3 ? '正常' : '故障'
      },
      summary: '检测到曳引机轴承温度异常波动，可能存在润滑不足或轴承磨损问题。',
      details: [
        '轴承温度在过去30分钟内波动范围超过15°C',
        '振动值呈现逐步上升趋势',
        '电机电流波动超出正常范围'
      ],
      recommendations: [
        '建议检查轴承润滑情况',
        '检测轴承是否存在异常磨损',
        '安排技术人员进行现场检查'
      ]
    };

    // 更新AI分析结果并显示通知
    aiAnalysisResult.value = mockAIResult;
    showAINotification.value = true;
  } catch (error) {
    console.error('获取AI分析结果失败:', error);
  }
};

// 处理通知关闭
const handleNotificationClose = () => {
  showAINotification.value = false;
};

// 处理查看系统详情
const handleViewSystemDetails = (systemId) => {
  navigateToSystemDetail(systemId);
};

// 模拟电梯运行
onMounted(() => {
  // 设置电梯ID
  dataCollectionService.setElevatorId(elevatorData.value.id);
  
  // 启动数据采集
  dataCollectionService.startCollection(elevatorData, handleAnomalyDetected);
  
  // 原有的模拟代码
  setInterval(() => {
    // 模拟电梯运行逻辑
    if (elevatorData.value.currentFloor < elevatorData.value.targetFloor) {
      elevatorData.value.currentFloor += 1;
      elevatorData.value.direction = '上行';
    } else if (elevatorData.value.currentFloor > elevatorData.value.targetFloor) {
      elevatorData.value.currentFloor -= 1;
      elevatorData.value.direction = '下行';
    } else {
      // 到达目标楼层，随机设置新的目标楼层
      const newTarget = Math.floor(Math.random() * elevatorData.value.floorCount) + 1;
      elevatorData.value.targetFloor = newTarget;
      
      // 模拟开关门
      elevatorData.value.doorStatus = '打开';
      setTimeout(() => {
        elevatorData.value.doorStatus = '关闭';
      }, 2000);
    }
    
    // 随机更新一些数据以模拟实时变化
    elevatorData.value.temperature = (24 + Math.random()).toFixed(1);
    elevatorData.value.loadWeight = Math.floor(300 + Math.random() * 400);
    elevatorData.value.energyConsumption = (45 + Math.random() * 2).toFixed(1);
    
    // 模拟四大系统数据更新
    elevatorData.value.systems.forEach(system => {
      // 更新系统温度
      if (system.id === 'sys-001') {
        // 曳引系统温度更新
        system.temperature = (60 + Math.random() * 15).toFixed(1);
        
        // 更新参数
        system.parameters.forEach(param => {
          if (param.name === '电机温度') {
            param.value = system.temperature;
            // 检查是否超出正常范围
            if (param.value > 80) {
              system.status = '故障';
              system.faultCode = 'E001-电机过热';
            }
          } else if (param.name === '轴承温度') {
            param.value = (system.temperature * 1.15).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 95) {
              system.status = '故障';
              system.faultCode = 'E002-轴承过热';
            }
          } else if (param.name === '振动速度') {
            param.value = (1.5 + Math.random() * 1.5).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 2.8) {
              system.status = '故障';
              system.faultCode = 'E003-振动异常';
            }
          } else if (param.name === '电流') {
            const baseValue = 18.5;
            const variation = Math.random() * 4 - 2; // -2到2的变化
            param.value = (baseValue + variation).toFixed(1);
            // 检查是否超出正常范围
            if (Math.abs(variation) > 1.85) { // 超过10%
              system.status = '故障';
              system.faultCode = 'E004-电流波动过大';
            }
          } else if (param.name === '钢丝绳磨损') {
            param.value = (5 + Math.random() * 7).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 10) {
              system.status = '故障';
              system.faultCode = 'E005-钢丝绳磨损严重';
            }
          } else if (param.name === '断丝数') {
            param.value = Math.floor(1 + Math.random() * 8);
            // 检查是否超出正常范围
            if (param.value > 5) {
              system.status = '故障';
              system.faultCode = 'E006-钢丝绳断丝过多';
            }
          } else if (param.name === '制动间隙') {
            param.value = (0.5 + Math.random() * 1.0).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 1.0) {
              system.status = '故障';
              system.faultCode = 'E007-制动间隙过大';
            }
          }
        });
      } else if (system.id === 'sys-002') {
        // 导向系统温度更新
        system.temperature = (35 + Math.random() * 8).toFixed(1);
        
        // 更新参数
        system.parameters.forEach(param => {
          if (param.name === '导轨垂直度偏差') {
            param.value = (0.2 + Math.random() * 0.5).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 0.5) {
              system.status = '故障';
              system.faultCode = 'G001-导轨垂直度异常';
            }
          } else if (param.name === '接头间隙') {
            param.value = (0.3 + Math.random() * 0.4).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 0.5) {
              system.status = '故障';
              system.faultCode = 'G002-导轨接头间隙过大';
            }
          } else if (param.name === '导靴磨损量') {
            param.value = (1.0 + Math.random() * 2.5).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 2.0) {
              system.status = '故障';
              system.faultCode = 'G003-导靴磨损超标';
            }
          } else if (param.name === '振动值') {
            param.value = (0.5 + Math.random() * 1.0).toFixed(1);
          }
        });
      } else if (system.id === 'sys-003') {
        // 电气控制系统温度更新
        system.temperature = (35 + Math.random() * 10).toFixed(1);
        
        // 更新参数
        system.parameters.forEach(param => {
          if (param.name === '电压波动') {
            param.value = (Math.random() * 18 - 2).toFixed(1); // -2%到16%的波动
            // 检查是否超出正常范围
            if (Math.abs(param.value) > 10) {
              system.status = '故障';
              system.faultCode = 'E101-电压波动过大';
            }
          } else if (param.name === '电流负载') {
            param.value = (80 + Math.random() * 30).toFixed(0); // 80%到110%的负载
            // 检查是否超出正常范围
            if (param.value > 100) {
              system.status = '故障';
              system.faultCode = 'E102-电流过载';
            }
          } else if (param.name === '触点电压降') {
            param.value = (30 + Math.random() * 90).toFixed(0); // 30mV到120mV的电压降
            // 检查是否超出正常范围
            if (param.value > 100) {
              system.status = '故障';
              system.faultCode = 'E103-触点电压降过高';
            }
          } else if (param.name === '控制响应时间') {
            param.value = (0.2 + Math.random() * 1.0).toFixed(1); // 0.2s到1.2s的响应时间
            // 检查是否超出正常范围
            if (param.value > 1.0) {
              system.status = '故障';
              system.faultCode = 'E104-控制响应超时';
            }
          } else if (param.name === '电源开关状态') {
            // 95%概率保持正常，5%概率出现故障
            if (Math.random() > 0.95) {
              param.value = '异常';
              system.status = '故障';
              system.faultCode = 'E105-电源开关异常';
            } else {
              param.value = '正常';
            }
          }
        });
      } else if (system.id === 'sys-004') {
        // 门系统温度更新
        system.temperature = (30 + Math.random() * 6).toFixed(1);
        
        // 更新参数
        system.parameters.forEach(param => {
          if (param.name === '触点电阻') {
            param.value = (0.2 + Math.random() * 0.5).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 0.5) {
              system.status = '故障';
              system.faultCode = 'D001-触点电阻过大';
            }
          } else if (param.name === '机械闭合深度') {
            param.value = (6.5 + Math.random() * 3.0).toFixed(1);
            // 检查是否超出正常范围
            if (param.value < 7.0) {
              system.status = '故障';
              system.faultCode = 'D002-门铁闭合不足';
            }
          } else if (param.name === '开关门时间') {
            param.value = (2.0 + Math.random() * 3.5).toFixed(1);
            // 检查是否超出正常范围
            if (param.value > 3.0) {
              system.status = '故障';
              system.faultCode = 'D003-开关门时间过长';
            }
          } else if (param.name === '门机电流') {
            const baseValue = 2.4;
            const variation = Math.random() * 0.8 - 0.4; // -0.4到0.4的变化
            param.value = (baseValue + variation).toFixed(1);
          }
        });
      }
      
      // 随机恢复故障
      if (system.status === '故障' && Math.random() < 0.1) {
        // 10%的概率修复故障
        system.status = '正常';
        system.faultCode = '无';
      }
    });
  }, 3000);
  
  // 模拟每30秒获取一次AI分析结果
  aiAnalysisInterval = setInterval(() => {
    if (Math.random() > 0.7) { // 30%的概率触发AI分析
      fetchAIAnalysis();
    }
  }, 30000);
});

// 清理函数
onBeforeUnmount(() => {
  // 停止数据采集
  dataCollectionService.stopCollection();
  
  // 清除定时器
  if (aiAnalysisInterval) {
    clearInterval(aiAnalysisInterval);
    aiAnalysisInterval = null;
  }
});
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
        <h2 class="panel-title tech-text">电梯可视化</h2>
        <div class="status-badge" :class="elevatorData.status === '运行中' ? 'status-running' : 'status-stopped'">
          {{ elevatorData.status }}
        </div>
        <div class="tech-decoration"></div>
      </div>
      <ElevatorVisualizer :elevatorData="elevatorData" />
    </div>
    
    <div class="systems-monitor panel">
      <div class="panel-header">
        <h2 class="panel-title tech-text">系统监控</h2>
        <div class="tech-decoration"></div>
      </div>
      <div class="systems-grid">
        <div 
          v-for="system in elevatorData.systems" 
          :key="system.id"
          class="system-card"
          :class="{'system-error': system.status === '故障'}"
          @click="navigateToSystemDetail(system.id)"
        >
          <div class="system-icon" :class="{'pulse': system.status === '故障'}">{{ system.icon }}</div>
          <div class="system-info">
            <h3>{{ system.name }}</h3>
            <div class="status-indicator" :class="system.status === '正常' ? 'status-normal' : 'status-error'">
              <div class="status-dot"></div>
              <span class="status-text">{{ system.status }}</span>
            </div>
            <div v-if="system.faultCode !== '无'" class="fault-code">
              {{ system.faultCode }}
            </div>
          </div>
          <div class="hover-info">
            <div class="hover-param">
              <span class="param-icon">🌡️</span>
              <span class="param-value">{{ system.temperature }}°C</span>
            </div>
            <div class="hover-param">
              <span class="param-icon">⏱️</span>
              <span class="param-value">{{ system.runningHours }}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer panel">
      <FooterPanel />
    </div>
    
    <!-- AI分析通知组件 -->
    <AIAnalysisNotification
      v-if="aiAnalysisResult"
      :analysisResult="aiAnalysisResult"
      :visible="showAINotification"
      @close="handleNotificationClose"
      @view-details="handleViewSystemDetails"
    />
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  height: 100vh;
  padding: 1vh;
  display: grid;
  grid-template-columns: minmax(350px, 1.2fr) minmax(500px, 2.5fr) minmax(400px, 1.5fr);
  grid-template-rows: auto 1fr 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main systems-monitor"
    "sidebar main systems-monitor"
    "footer footer footer";
  gap: 1.5vh;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
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
  min-width: 350px;
  overflow-y: auto;
  z-index: 1;
  padding: 1vh;
  box-sizing: border-box;
}

.main {
  grid-area: main;
  z-index: 1;
  overflow: auto;
  min-width: 500px;
  padding: 1vh;
  box-sizing: border-box;
}

.systems-monitor {
  grid-area: systems-monitor;
  overflow-y: auto;
  z-index: 1;
  min-width: 400px;
  padding: 1vh;
  box-sizing: border-box;
}

.footer {
  grid-area: footer;
  z-index: 1;
  min-height: 70px;
  width: 100%;
  padding: 1vh;
  box-sizing: border-box;
}

.panel {
  background: rgba(16, 24, 48, 0.9);
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
  font-weight: 600;
  color: #4dabf5;
  margin: 0;
  text-shadow: 0 0 15px rgba(77, 171, 245, 0.3);
}

.status-badge {
  padding: 0.4vh 1vh;
  border-radius: 2vh;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.status-running {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.5);
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.3);
}

.status-stopped {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.5);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.5vh;
  padding: 0.5vh;
  width: 100%;
  box-sizing: border-box;
}

.system-card {
  background: rgba(7, 19, 39, 0.7);
  border: 1px solid rgba(64, 128, 255, 0.2);
  border-radius: 10px;
  padding: 1.5vh;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 180px;
  width: 100%;
  box-sizing: border-box;
}

.system-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(64, 128, 255, 0.2);
  border-color: rgba(64, 128, 255, 0.4);
}

.system-card.system-error {
  border-color: rgba(231, 76, 60, 0.4);
  background: rgba(231, 76, 60, 0.1);
}

.system-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1vh;
}

.system-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5vh;
}

.system-info h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #4dabf5;
  margin-bottom: 1vh;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1vh;
  margin-bottom: 1vh;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-normal .status-dot {
  background-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.status-error .status-dot {
  background-color: #e74c3c;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.status-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.fault-code {
  font-size: 0.8rem;
  color: #e74c3c;
  padding: 0.3vh 0.6vh;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 0.4vh;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.hover-info {
  display: flex;
  justify-content: space-between;
  padding-top: 0.5vh;
  border-top: 1px solid rgba(64, 128, 255, 0.1);
}

.hover-param {
  display: flex;
  align-items: center;
  gap: 0.3vh;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.param-icon {
  font-size: 1rem;
}

.param-value {
  font-family: 'Orbitron', sans-serif;
}

@keyframes scanline {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(231, 76, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}

/* 响应式布局优化 */
@media (max-width: 1920px) {
  .dashboard {
    grid-template-columns: minmax(350px, 1.2fr) minmax(500px, 2.2fr) minmax(400px, 1.3fr);
    gap: 1.5vh;
  }
  
  .systems-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 1600px) {
  .dashboard {
    grid-template-columns: 350px 1fr;
    grid-template-rows: auto 1fr 1fr auto auto;
    grid-template-areas:
      "header header"
      "sidebar main"
      "sidebar main"
      "systems-monitor systems-monitor"
      "footer footer";
  }
  
  .systems-monitor {
    min-height: 400px;
  }
  
  .systems-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

@media (max-width: 1366px) {
  .dashboard {
    padding: 1vh;
    gap: 1vh;
  }
  
  .panel {
    padding: 1.5vh;
  }
  
  .systems-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1vh;
  }
  
  .system-card {
    min-height: 160px;
    padding: 1.5vh;
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