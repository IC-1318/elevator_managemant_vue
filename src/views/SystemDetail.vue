<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import HeaderPanel from '../components/HeaderPanel.vue';

const route = useRoute();
const systemId = computed(() => route.params.id);

// 系统详细数据
const systemData = ref(null);

// 获取系统数据
const fetchSystemData = () => {
  // 模拟从父组件获取数据
  const systems = {
    'sys-001': {
      name: '曳引系统',
      icon: '⚙️',
      description: '负责电梯轿厢的上下运动，是电梯的核心动力系统。',
      model: '型号：XFYT-2000',
      manufacturer: '制造商：西子电梯',
      installDate: '安装日期：2023-01-15',
      maintenanceCycle: '维护周期：3个月',
      parameters: [
        { name: '电机转速', value: 1420, unit: 'rpm', normal: '1380-1450' },
        { name: '电流', value: 18.5, unit: 'A', normal: '15-20' },
        { name: '电压', value: 380, unit: 'V', normal: '360-400' },
        { name: '制动力矩', value: 320, unit: 'N·m', normal: '300-350' },
        { name: '轴承温度', value: 45, unit: '°C', normal: '35-55' },
        { name: '振动值', value: 2.5, unit: 'mm/s', normal: '0-3' }
      ],
      alarmThresholds: {
        temperature: { warning: 50, critical: 60 },
        current: { warning: 19, critical: 21 },
        vibration: { warning: 2.8, critical: 3.5 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-09-15', type: '季度保养', findings: '更换轴承润滑油', technician: '李工' },
        { date: '2023-06-15', type: '半年检查', findings: '调整制动器间隙', technician: '王工' }
      ]
    },
    'sys-002': {
      name: '导向系统',
      icon: '🔄',
      description: '确保电梯轿厢在运行过程中的平稳性和导向性。',
      model: '型号：XFDX-1000',
      manufacturer: '制造商：西子电梯',
      installDate: '安装日期：2023-01-15',
      maintenanceCycle: '维护周期：6个月',
      parameters: [
        { name: '导轨磨损', value: 0.2, unit: 'mm', normal: '0-0.5' },
        { name: '导靴间隙', value: 1.5, unit: 'mm', normal: '1-2' },
        { name: '润滑状态', value: 85, unit: '%', normal: '80-100' },
        { name: '振动值', value: 0.8, unit: 'mm/s', normal: '0-1' },
        { name: '导轨垂直度', value: 0.15, unit: '°', normal: '0-0.2' },
        { name: '导靴压力', value: 280, unit: 'N', normal: '250-300' }
      ],
      alarmThresholds: {
        wear: { warning: 0.4, critical: 0.5 },
        gap: { warning: 1.8, critical: 2 },
        lubrication: { warning: 85, critical: 80 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-06-15', type: '半年保养', findings: '更换导靴', technician: '李工' },
        { date: '2022-12-15', type: '年度检查', findings: '导轨校准', technician: '王工' }
      ]
    },
    'sys-003': {
      name: '轿厢系统',
      icon: '🔲',
      description: '为乘客提供安全舒适的运载空间，包括轿厢框架、装潢和安全装置。',
      model: '型号：XFJX-3000',
      manufacturer: '制造商：西子电梯',
      installDate: '安装日期：2023-01-15',
      maintenanceCycle: '维护周期：3个月',
      parameters: [
        { name: '平衡系数', value: 0.95, unit: '', normal: '0.9-1.0' },
        { name: '悬挂比', value: 2, unit: ':1', normal: '2:1' },
        { name: '钢缆张力', value: 2800, unit: 'N', normal: '2600-3000' },
        { name: '轿厢水平度', value: 0.5, unit: '°', normal: '0-1' },
        { name: '减震器状态', value: 90, unit: '%', normal: '85-100' },
        { name: '安全钳响应', value: 0.8, unit: 's', normal: '0.5-1' }
      ],
      alarmThresholds: {
        tension: { warning: 2700, critical: 2600 },
        level: { warning: 0.8, critical: 1 },
        damper: { warning: 85, critical: 80 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-09-15', type: '季度保养', findings: '更换轿厢照明', technician: '李工' },
        { date: '2023-06-15', type: '半年检查', findings: '安全钳测试', technician: '王工' }
      ]
    },
    'sys-004': {
      name: '门系统',
      icon: '🚪',
      description: '控制轿厢门和层门的开关，确保乘客安全进出。',
      model: '型号：XFMK-1000',
      manufacturer: '制造商：西子电梯',
      installDate: '安装日期：2023-01-15',
      maintenanceCycle: '维护周期：2个月',
      parameters: [
        { name: '开门时间', value: 3.2, unit: 's', normal: '3-4' },
        { name: '关门时间', value: 3.5, unit: 's', normal: '3-4' },
        { name: '门机电流', value: 2.4, unit: 'A', normal: '2-3' },
        { name: '门锁状态', value: 100, unit: '%', normal: '100' },
        { name: '光幕响应', value: 0.15, unit: 's', normal: '0.1-0.2' },
        { name: '门导轨磨损', value: 0.3, unit: 'mm', normal: '0-0.5' }
      ],
      alarmThresholds: {
        openTime: { warning: 3.8, critical: 4 },
        closeTime: { warning: 3.8, critical: 4 },
        current: { warning: 2.8, critical: 3 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-10-15', type: '双月保养', findings: '调整门机皮带', technician: '李工' },
        { date: '2023-08-15', type: '双月保养', findings: '更换光幕', technician: '王工' }
      ]
    }
  };

  systemData.value = systems[systemId.value];
};

onMounted(() => {
  fetchSystemData();
});
</script>

<template>
  <div class="system-detail" v-if="systemData">
    <HeaderPanel :elevatorId="systemId" />
    
    <header class="detail-header">
      <div class="system-title">
        <span class="system-icon">{{ systemData.icon }}</span>
        <h1>{{ systemData.name }}详情</h1>
      </div>
      <div class="system-info">
        <p>{{ systemData.description }}</p>
        <div class="info-grid">
          <div class="info-item">{{ systemData.model }}</div>
          <div class="info-item">{{ systemData.manufacturer }}</div>
          <div class="info-item">{{ systemData.installDate }}</div>
          <div class="info-item">{{ systemData.maintenanceCycle }}</div>
        </div>
      </div>
    </header>

    <div class="detail-content">
      <section class="model-section panel">
        <h2 class="section-title">3D模型展示</h2>
        <div class="model-placeholder">
          <!-- 这里将来放置Three.js模型 -->
          <div class="placeholder-text">3D模型加载中...</div>
        </div>
      </section>

      <section class="parameters-section panel">
        <h2 class="section-title">运行参数</h2>
        <div class="parameters-grid">
          <div 
            v-for="param in systemData.parameters" 
            :key="param.name"
            class="parameter-card"
          >
            <div class="parameter-header">
              <span class="parameter-name">{{ param.name }}</span>
              <span class="parameter-value">{{ param.value }}{{ param.unit }}</span>
            </div>
            <div class="parameter-normal">正常范围：{{ param.normal }}</div>
            <div class="parameter-bar">
              <div 
                class="bar-fill"
                :style="{
                  width: `${(param.value / parseFloat(param.normal.split('-')[1] || param.normal)) * 100}%`
                }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section class="maintenance-section panel">
        <h2 class="section-title">维护记录</h2>
        <div class="maintenance-timeline">
          <div 
            v-for="record in systemData.maintenanceRecords" 
            :key="record.date"
            class="timeline-item"
          >
            <div class="timeline-date">{{ record.date }}</div>
            <div class="timeline-content">
              <div class="maintenance-type">{{ record.type }}</div>
              <div class="maintenance-findings">发现：{{ record.findings }}</div>
              <div class="maintenance-technician">维护人员：{{ record.technician }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.system-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: #1a1a1a;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
}

.detail-header {
  margin-bottom: 20px;
}

.system-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.system-icon {
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 10px;
}

.system-title h1 {
  margin: 0;
  font-size: 2rem;
  color: #fff;
}

.system-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
}

.system-info p {
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.8);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.7);
}

.detail-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #fff;
  font-size: 1.2rem;
}

.model-section {
  grid-row: span 2;
}

.model-placeholder {
  aspect-ratio: 16/9;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.5);
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.parameter-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
}

.parameter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.parameter-name {
  color: rgba(255, 255, 255, 0.8);
}

.parameter-value {
  color: #4CAF50;
  font-weight: bold;
}

.parameter-normal {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.parameter-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #4CAF50;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.maintenance-timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.timeline-date {
  color: #4CAF50;
  font-weight: bold;
  min-width: 100px;
}

.timeline-content {
  flex: 1;
}

.maintenance-type {
  color: #fff;
  margin-bottom: 5px;
}

.maintenance-findings,
.maintenance-technician {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

@media (max-width: 1366px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .model-section {
    grid-row: auto;
  }
}
</style>