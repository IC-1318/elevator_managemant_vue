<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ElevatorVisualizer from '../components/ElevatorVisualizer.vue';
import ControlPanel from '../components/ControlPanel.vue';
import HeaderPanel from '../components/HeaderPanel.vue';
import FooterPanel from '../components/FooterPanel.vue';
import SystemMonitor from '../components/SystemMonitor.vue';

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
      temperature: 42.5,
      faultCode: '无',
      parameters: [
        { name: '电机转速', value: 1420, unit: 'rpm' },
        { name: '电流', value: 18.5, unit: 'A' },
        { name: '电压', value: 380, unit: 'V' },
        { name: '制动力矩', value: 320, unit: 'N·m' }
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
        { name: '导轨磨损', value: 0.2, unit: 'mm' },
        { name: '导靴间隙', value: 1.5, unit: 'mm' },
        { name: '润滑状态', value: 85, unit: '%' },
        { name: '振动值', value: 0.8, unit: 'mm/s' }
      ]
    },
    {
      id: 'sys-003',
      name: '轿厢系统',
      icon: '🔲',
      status: '正常',
      runningHours: 5231,
      temperature: 26.8,
      faultCode: '无',
      parameters: [
        { name: '平衡系数', value: 0.95, unit: '' },
        { name: '悬挂比', value: 2, unit: ':1' },
        { name: '钢缆张力', value: 2800, unit: 'N' },
        { name: '轿厢水平度', value: 0.5, unit: '°' }
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
        { name: '开门时间', value: 3.2, unit: 's' },
        { name: '关门时间', value: 3.5, unit: 's' },
        { name: '门机电流', value: 2.4, unit: 'A' },
        { name: '门锁状态', value: 100, unit: '%' }
      ]
    }
  ]
});

// 跳转到系统详情页
const navigateToSystemDetail = (systemId) => {
  router.push(`/system/${systemId}`);
};

// 模拟电梯运行
onMounted(() => {
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
      const baseTemp = system.id === 'sys-001' ? 42 : system.id === 'sys-002' ? 38 : system.id === 'sys-003' ? 26 : 32;
      system.temperature = (baseTemp + Math.random() * 3).toFixed(1);
      
      // 随机模拟系统故障（5%的概率）
      if (Math.random() < 0.05) {
        const faultTypes = {
          'sys-001': ['E001-电机过热', 'E002-制动器异常', 'E003-轴承磨损'],
          'sys-002': ['G001-导轨偏移', 'G002-导靴磨损严重', 'G003-润滑不足'],
          'sys-003': ['C001-钢缆张力异常', 'C002-平衡系数偏差', 'C003-轿厢水平度超标'],
          'sys-004': ['D001-门机电流过大', 'D002-开门时间异常', 'D003-门锁故障']
        };
        
        const faults = faultTypes[system.id];
        const randomFault = faults[Math.floor(Math.random() * faults.length)];
        
        // 设置故障状态
        system.status = '故障';
        system.faultCode = randomFault;
      } else if (system.status === '故障' && Math.random() < 0.2) {
        // 20%的概率修复故障
        system.status = '正常';
        system.faultCode = '无';
      }
      
      // 更新系统参数
      system.parameters.forEach(param => {
        // 根据不同参数类型设置不同的波动范围
        let variation = 0.05; // 默认5%的波动
        
        // 如果系统有故障，增加参数波动
        if (system.status === '故障') {
          variation = 0.15; // 故障时15%的波动
        }
        
        // 计算新值（在原值基础上随机波动）
        const baseValue = parseFloat(param.value);
        const change = baseValue * (Math.random() * variation * 2 - variation);
        param.value = (baseValue + change).toFixed(param.unit === 'rpm' || param.unit === 'N' ? 0 : 1);
      });
    });
  }, 3000);
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