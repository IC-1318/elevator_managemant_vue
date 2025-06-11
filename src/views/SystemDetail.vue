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
        // 曳引机
        { name: '电机温度', value: 65.5, unit: '°C', normal: '≤80°C', critical: '>95°C', group: '曳引机' },
        { name: '轴承温度', value: 75.2, unit: '°C', normal: '≤95°C', critical: '>95°C', group: '曳引机' },
        { name: '振动速度', value: 1.8, unit: 'mm/s', normal: '≤2.8 mm/s', critical: '>4.5 mm/s', group: '曳引机' },
        { name: '电流', value: 18.5, unit: 'A', normal: '额定值±10%', critical: '>15%波动', group: '曳引机' },
        // 曳引钢丝绳
        { name: '钢丝绳磨损', value: 5.2, unit: '%', normal: '≤10%', critical: '>10%', group: '曳引钢丝绳' },
        { name: '断丝数', value: 2, unit: '根/股', normal: '≤5根/股', critical: '>8根/股', group: '曳引钢丝绳' },
        // 制动器
        { name: '制动间隙', value: 0.8, unit: 'mm', normal: '0.5-1.0 mm', critical: '>1.5 mm', group: '制动器' },
        { name: '制动力矩', value: 320, unit: 'N·m', normal: '≥1.5倍额定载荷', critical: '<1.5倍额定载荷', group: '制动器' }
      ],
      alarmThresholds: {
        temperature: { warning: 75, critical: 95 },
        current: { warning: 19, critical: 21 },
        vibration: { warning: 2.8, critical: 4.5 }
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
        // 导轨
        { name: '导轨垂直度偏差', value: 0.3, unit: 'mm/m', normal: '≤0.5 mm/m', critical: '>1 mm/m', group: '导轨' },
        { name: '接头间隙', value: 0.4, unit: 'mm', normal: '≤0.5 mm', critical: '>0.5 mm或接头错位', group: '导轨' },
        // 导靴
        { name: '导靴磨损量', value: 1.2, unit: 'mm', normal: '≤2 mm', critical: '>3 mm或异响', group: '导靴' },
        { name: '振动值', value: 0.8, unit: 'mm/s', normal: '≤2.8 mm/s', critical: '>4.5 mm/s', group: '导靴' }
      ],
      alarmThresholds: {
        wear: { warning: 1.8, critical: 3.0 },
        gap: { warning: 0.45, critical: 0.5 },
        verticality: { warning: 0.45, critical: 1.0 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-06-15', type: '半年保养', findings: '更换导靴', technician: '李工' },
        { date: '2022-12-15', type: '年度检查', findings: '导轨校准', technician: '王工' }
      ]
    },
    'sys-003': {
      name: '电气控制系统',
      icon: '⚡',
      description: '负责电梯的电气控制、信号处理和安全监测，是电梯智能运行的核心。',
      model: '型号：XFKZ-3000',
      manufacturer: '制造商：西子电梯',
      installDate: '安装日期：2023-01-15',
      maintenanceCycle: '维护周期：3个月',
      parameters: [
        // 电压波动
        { name: '电压波动', value: 5.2, unit: '%', normal: '±10%内', critical: '超过±15%', group: '电压波动' },
        { name: '电流负载', value: 85, unit: '%', normal: '≤额定值', critical: '额定值+20%', group: '电压波动' },
        // 触点电压降
        { name: '触点电压降', value: 45, unit: 'mV', normal: '≤50 mV', critical: '>100 mV', group: '触点电压降' },
        { name: '触点位置偏差', value: 3, unit: 'mm', normal: '±5 mm', critical: '>15 mm', group: '触点电压降' },
        // 控制响应时间
        { name: '控制响应时间', value: 0.4, unit: 's', normal: '≤0.5秒', critical: '>1秒', group: '控制响应时间' },
        { name: '二次响应时间', value: 0.7, unit: 's', normal: '0.5~1秒', critical: '>1秒', group: '控制响应时间' },
        // 电源开关
        { name: '电源开关状态', value: '正常', unit: '', normal: '控制箱', critical: '电源开关异常', group: '电源开关' },
        { name: '电源稳定性', value: 98, unit: '%', normal: '≥95%', critical: '<90%', group: '电源开关' }
      ],
      alarmThresholds: {
        voltage: { warning: 8, critical: 15 },
        current: { warning: 95, critical: 120 },
        contactVoltage: { warning: 80, critical: 100 },
        responseTime: { warning: 0.8, critical: 1.0 }
      },
      maintenanceRecords: [
        { date: '2023-12-15', type: '常规检查', findings: '正常', technician: '张工' },
        { date: '2023-09-15', type: '季度保养', findings: '更换控制板电容', technician: '李工' },
        { date: '2023-06-15', type: '半年检查', findings: '校准电压传感器', technician: '王工' }
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
        // 门铁装置
        { name: '触点电阻', value: 0.3, unit: 'Ω', normal: '≤0.5 Ω', critical: '>1 Ω', group: '门铁装置' },
        { name: '机械闭合深度', value: 8.5, unit: 'mm', normal: '≥7 mm', critical: '<5 mm', group: '门铁装置' },
        // 开关门
        { name: '开关门时间', value: 2.5, unit: 's', normal: '2-3 s', critical: '>5 s或卡阻', group: '开关门' },
        { name: '门机电流', value: 2.4, unit: 'A', normal: '额定值±10%', critical: '>15%波动', group: '开关门' }
      ],
      alarmThresholds: {
        resistance: { warning: 0.45, critical: 1.0 },
        depth: { warning: 7.5, critical: 5.0 },
        time: { warning: 3.0, critical: 5.0 }
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
        
        <!-- 按组显示参数 -->
        <div v-for="group in [...new Set(systemData.parameters.map(p => p.group))]" :key="group" class="parameter-group">
          <h3 class="group-title">{{ group }}</h3>
          <div class="parameters-grid">
            <div 
              v-for="param in systemData.parameters.filter(p => p.group === group)" 
              :key="param.name"
              class="parameter-card"
            >
              <div class="parameter-header">
                <span class="parameter-name">{{ param.name }}</span>
                <span 
                  class="parameter-value" 
                  :class="{
                    'value-normal': isInNormalRange(param),
                    'value-warning': isWarning(param),
                    'value-critical': isCritical(param)
                  }"
                >
                  {{ param.value }}{{ param.unit }}
                </span>
              </div>
              <div class="parameter-ranges">
                <div class="range-item">
                  <span class="range-label">正常范围:</span>
                  <span class="range-value normal-range">{{ param.normal }}</span>
                </div>
                <div class="range-item">
                  <span class="range-label">故障范围:</span>
                  <span class="range-value critical-range">{{ param.critical }}</span>
                </div>
              </div>
              <div class="parameter-bar">
                <div 
                  class="bar-fill"
                  :class="{
                    'bar-normal': isInNormalRange(param),
                    'bar-warning': isWarning(param),
                    'bar-critical': isCritical(param)
                  }"
                  :style="getBarStyle(param)"
                ></div>
              </div>
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

<script>
// 辅助函数
function isInNormalRange(param) {
  // 实现正常范围检测逻辑
  if (param.name === '电机温度') return param.value <= 80;
  if (param.name === '轴承温度') return param.value <= 95;
  if (param.name === '振动速度') return param.value <= 2.8;
  if (param.name === '电流') return Math.abs(param.value - 18.5) <= 1.85;
  if (param.name === '钢丝绳磨损') return param.value <= 10;
  if (param.name === '断丝数') return param.value <= 5;
  if (param.name === '制动间隙') return param.value >= 0.5 && param.value <= 1.0;
  if (param.name === '制动力矩') return param.value >= 300; // 假设1.5倍额定载荷为300 N·m
  if (param.name === '导轨垂直度偏差') return param.value <= 0.5;
  if (param.name === '接头间隙') return param.value <= 0.5;
  if (param.name === '导靴磨损量') return param.value <= 2;
  if (param.name === '触点电阻') return param.value <= 0.5;
  if (param.name === '机械闭合深度') return param.value >= 7;
  if (param.name === '开关门时间') return param.value >= 2 && param.value <= 3;
  if (param.name === '电压波动') return Math.abs(param.value) <= 10;
  if (param.name === '电流负载') return param.value <= 100;
  if (param.name === '触点电压降') return param.value <= 50;
  if (param.name === '触点位置偏差') return Math.abs(param.value) <= 5;
  if (param.name === '控制响应时间') return param.value <= 0.5;
  if (param.name === '二次响应时间') return param.value >= 0.5 && param.value <= 1.0;
  if (param.name === '电源开关状态') return param.value === '正常';
  if (param.name === '电源稳定性') return param.value >= 95;
  return true;
}

function isWarning(param) {
  // 实现警告范围检测逻辑
  if (param.name === '电机温度') return param.value > 75 && param.value <= 95;
  if (param.name === '轴承温度') return param.value > 85 && param.value <= 95;
  if (param.name === '振动速度') return param.value > 2.8 && param.value <= 4.5;
  if (param.name === '电流') return Math.abs(param.value - 18.5) > 1.85 && Math.abs(param.value - 18.5) <= 2.775;
  if (param.name === '钢丝绳磨损') return param.value > 8 && param.value <= 10;
  if (param.name === '断丝数') return param.value > 5 && param.value <= 8;
  if (param.name === '制动间隙') return param.value > 1.0 && param.value <= 1.5;
  if (param.name === '制动力矩') return param.value < 300 && param.value >= 250;
  if (param.name === '导轨垂直度偏差') return param.value > 0.5 && param.value <= 1;
  if (param.name === '接头间隙') return param.value > 0.45 && param.value <= 0.5;
  if (param.name === '导靴磨损量') return param.value > 2 && param.value <= 3;
  if (param.name === '触点电阻') return param.value > 0.5 && param.value <= 1;
  if (param.name === '机械闭合深度') return param.value < 7 && param.value >= 5;
  if (param.name === '开关门时间') return param.value > 3 && param.value <= 5;
  if (param.name === '电压波动') return Math.abs(param.value) > 10 && Math.abs(param.value) <= 15;
  if (param.name === '电流负载') return param.value > 100 && param.value <= 120;
  if (param.name === '触点电压降') return param.value > 50 && param.value <= 100;
  if (param.name === '触点位置偏差') return Math.abs(param.value) > 5 && Math.abs(param.value) <= 15;
  if (param.name === '控制响应时间') return param.value > 0.5 && param.value <= 1.0;
  if (param.name === '二次响应时间') return param.value > 0.8 && param.value <= 1.0;
  if (param.name === '电源开关状态') return false; // 电源开关状态没有警告状态，只有正常和故障
  if (param.name === '电源稳定性') return param.value < 95 && param.value >= 90;
  return false;
}

function isCritical(param) {
  // 实现故障范围检测逻辑
  if (param.name === '电机温度') return param.value > 95;
  if (param.name === '轴承温度') return param.value > 95;
  if (param.name === '振动速度') return param.value > 4.5;
  if (param.name === '电流') return Math.abs(param.value - 18.5) > 2.775;
  if (param.name === '钢丝绳磨损') return param.value > 10;
  if (param.name === '断丝数') return param.value > 8;
  if (param.name === '制动间隙') return param.value > 1.5;
  if (param.name === '制动力矩') return param.value < 250;
  if (param.name === '导轨垂直度偏差') return param.value > 1;
  if (param.name === '接头间隙') return param.value > 0.5;
  if (param.name === '导靴磨损量') return param.value > 3;
  if (param.name === '触点电阻') return param.value > 1;
  if (param.name === '机械闭合深度') return param.value < 5;
  if (param.name === '开关门时间') return param.value > 5;
  if (param.name === '电压波动') return Math.abs(param.value) > 15;
  if (param.name === '电流负载') return param.value > 120;
  if (param.name === '触点电压降') return param.value > 100;
  if (param.name === '触点位置偏差') return Math.abs(param.value) > 15;
  if (param.name === '控制响应时间') return param.value > 1.0;
  if (param.name === '二次响应时间') return param.value > 1.0;
  if (param.name === '电源开关状态') return param.value === '异常';
  if (param.name === '电源稳定性') return param.value < 90;
  return false;
}

function getBarStyle(param) {
  // 设置进度条样式逻辑
  let percentage = 0;
  
  // 根据不同参数类型计算百分比
  if (param.name === '电机温度' || param.name === '轴承温度') {
    percentage = (param.value / 120) * 100; // 假设最大值为120度
  } else if (param.name === '振动速度') {
    percentage = (param.value / 6) * 100; // 假设最大值为6 mm/s
  } else if (param.name === '电流') {
    percentage = (param.value / 30) * 100; // 假设最大值为30A
  } else if (param.name === '钢丝绳磨损') {
    percentage = (param.value / 15) * 100; // 假设最大值为15%
  } else if (param.name === '断丝数') {
    percentage = (param.value / 10) * 100; // 假设最大值为10根/股
  } else if (param.name === '制动间隙') {
    percentage = (param.value / 2) * 100; // 假设最大值为2mm
  } else if (param.name === '制动力矩') {
    percentage = (param.value / 400) * 100; // 假设最大值为400 N·m
  } else if (param.name === '导轨垂直度偏差') {
    percentage = (param.value / 1.5) * 100; // 假设最大值为1.5 mm/m
  } else if (param.name === '接头间隙') {
    percentage = (param.value / 1) * 100; // 假设最大值为1mm
  } else if (param.name === '导靴磨损量') {
    percentage = (param.value / 4) * 100; // 假设最大值为4mm
  } else if (param.name === '触点电阻') {
    percentage = (param.value / 1.5) * 100; // 假设最大值为1.5Ω
  } else if (param.name === '机械闭合深度') {
    // 逆向计算，值越高越好
    percentage = 100 - ((param.value - 3) / (10 - 3)) * 100; // 假设范围3-10mm
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    return { width: `${percentage}%` };
  } else if (param.name === '开关门时间') {
    percentage = (param.value / 6) * 100; // 假设最大值为6秒
  } else if (param.name === '电压波动') {
    // 特殊处理，因为电压波动可以是正值或负值
    const absValue = Math.abs(param.value);
    percentage = (absValue / 20) * 100; // 假设最大值为±20%
  } else if (param.name === '电流负载') {
    percentage = (param.value / 150) * 100; // 假设最大值为150%
  } else if (param.name === '触点电压降') {
    percentage = (param.value / 150) * 100; // 假设最大值为150mV
  } else if (param.name === '触点位置偏差') {
    percentage = (Math.abs(param.value) / 20) * 100; // 假设最大值为20mm
  } else if (param.name === '控制响应时间' || param.name === '二次响应时间') {
    percentage = (param.value / 1.5) * 100; // 假设最大值为1.5秒
  } else if (param.name === '电源开关状态') {
    percentage = param.value === '正常' ? 10 : 90; // 状态型指标，只显示少量或大量
  } else if (param.name === '电源稳定性') {
    percentage = 100 - param.value; // 逆向计算，值越高越好
  } else {
    percentage = 50; // 默认50%
  }
  
  return { width: `${Math.min(percentage, 100)}%` };
}
</script>

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

.parameter-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 1.1rem;
  color: #4dabf5;
  margin: 0 0 15px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(77, 171, 245, 0.3);
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
  font-weight: 500;
}

.parameter-value {
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
}

.value-normal {
  color: #4CAF50;
}

.value-warning {
  color: #FFC107;
}

.value-critical {
  color: #F44336;
}

.parameter-ranges {
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.range-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.range-label {
  color: rgba(255, 255, 255, 0.6);
}

.normal-range {
  color: #4CAF50;
}

.critical-range {
  color: #F44336;
}

.parameter-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.bar-normal {
  background: #4CAF50;
}

.bar-warning {
  background: #FFC107;
}

.bar-critical {
  background: #F44336;
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