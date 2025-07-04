<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import ParameterChart from '../components/ParameterChart.vue';
import MaintenanceChart from '../components/MaintenanceChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';

const systemId = 'sys-001';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;

// 为不同的参数组分配不同的图表类型
const getChartTypeForGroup = (group) => {
  // 曳引系统特定的图表类型
  const systemSpecificCharts = {
    '曳引机': 'gauge',
    '曳引钢丝绳': 'bar',
    '制动器': 'radar'
  };
  
  // 如果有特定配置，使用它，否则使用默认的bar类型
  return systemSpecificCharts[group] || 'bar';
};

// 获取系统数据
const fetchSystemData = () => {
  // 曳引系统数据
  systemData.value = {
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
    ],
    historicalData: {
      temperature: [62, 63, 65.5, 64, 66, 65, 65.5],
      vibration: [1.5, 1.6, 1.7, 1.8, 1.7, 1.8, 1.8],
      current: [18.1, 18.3, 18.2, 18.5, 18.4, 18.5, 18.5]
    },
    timeLabels: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '今日']
  };
};

// 更新系统数据
const updateSystemData = () => {
  if (!systemData.value) return;
  
  // 更新参数值
  systemData.value.parameters.forEach(param => {
    if (param.name === '电机温度') {
      param.value = (60 + Math.random() * 15).toFixed(1) * 1;
    } else if (param.name === '轴承温度') {
      param.value = (70 + Math.random() * 20).toFixed(1) * 1;
    } else if (param.name === '振动速度') {
      param.value = (1.5 + Math.random() * 1.5).toFixed(1) * 1;
    } else if (param.name === '电流') {
      const baseValue = 18.5;
      const variation = Math.random() * 4 - 2; // -2到2的变化
      param.value = (baseValue + variation).toFixed(1) * 1;
    } else if (param.name === '钢丝绳磨损') {
      param.value = (5 + Math.random() * 7).toFixed(1) * 1;
    } else if (param.name === '断丝数') {
      param.value = Math.floor(1 + Math.random() * 8);
    } else if (param.name === '制动间隙') {
      param.value = (0.5 + Math.random() * 1.0).toFixed(1) * 1;
    } else if (param.name === '制动力矩') {
      param.value = Math.floor(300 + Math.random() * 60);
    }
  });
  
  // 更新历史数据，移除最早的数据点，添加新的数据点
  const newTemp = systemData.value.parameters.find(p => p.name === '电机温度').value;
  const newVib = systemData.value.parameters.find(p => p.name === '振动速度').value;
  const newCurrent = systemData.value.parameters.find(p => p.name === '电流').value;
  
  systemData.value.historicalData.temperature.shift();
  systemData.value.historicalData.temperature.push(newTemp);
  
  systemData.value.historicalData.vibration.shift();
  systemData.value.historicalData.vibration.push(newVib);
  
  systemData.value.historicalData.current.shift();
  systemData.value.historicalData.current.push(newCurrent);
  
  // 更新时间标签
  const today = new Date();
  const dateStr = (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                  today.getDate().toString().padStart(2, '0');
  
  systemData.value.timeLabels = [
    ...systemData.value.timeLabels.slice(1, 6),
    '今日'
  ];
};

// 获取关键参数用于系统概览
const getKeyParameters = () => {
  if (!systemData.value) return [];
  
  const motorTemp = systemData.value.parameters.find(p => p.name === '电机温度').value;
  const vibration = systemData.value.parameters.find(p => p.name === '振动速度').value;
  const ropeWear = systemData.value.parameters.find(p => p.name === '钢丝绳磨损').value;
  
  return [
    {
      displayName: '电机温度',
      icon: '🌡️',
      value: motorTemp,
      min: 0,
      max: 120,
      unit: '°C',
      warningThreshold: 75,
      criticalThreshold: 95,
      isHigherBetter: false
    },
    {
      displayName: '振动速度',
      icon: '📳',
      value: vibration,
      min: 0,
      max: 6,
      unit: 'mm/s',
      warningThreshold: 2.8,
      criticalThreshold: 4.5,
      isHigherBetter: false
    },
    {
      displayName: '钢丝绳磨损',
      icon: '🔗',
      value: ropeWear,
      min: 0,
      max: 15,
      unit: '%',
      warningThreshold: 8,
      criticalThreshold: 10,
      isHigherBetter: false
    }
  ];
};

// 获取参数状态颜色
const getStatusColor = (param) => {
  // 根据参数名称确定状态
  if (param.name === '电机温度') {
    return param.value <= 80 ? '#4CAF50' : param.value <= 95 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '轴承温度') {
    return param.value <= 95 ? '#4CAF50' : '#F44336';
  }
  
  if (param.name === '振动速度') {
    return param.value <= 2.8 ? '#4CAF50' : param.value <= 4.5 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '电流') {
    return Math.abs(param.value - 18.5) <= 1.85 ? '#4CAF50' : Math.abs(param.value - 18.5) <= 2.775 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '钢丝绳磨损') {
    return param.value <= 10 ? '#4CAF50' : '#F44336';
  }
  
  // 默认颜色
  return '#4CAF50';
};

// 计算关键指标环形图配置
const keyIndicatorsChartOption = computed(() => {
  const keyParams = getKeyParameters();
  if (keyParams.length === 0) return {};
  
  // 计算每个指标的百分比值
  const getPercentValue = (param) => {
    return Math.round(((param.value - param.min) / (param.max - param.min)) * 100);
  };
  
  // 创建环形图系列
  const series = keyParams.map((param, index) => {
    const percentValue = getPercentValue(param);
    // 使用自定义颜色函数
    const color = getParamColor(param.displayName);
    
    // 增大环形图的间距，避免重叠
    const radiusStart = 70 - index * 25;
    const radiusEnd = 90 - index * 25;
    
    return {
      name: param.displayName,
      type: 'pie',
      radius: [`${radiusStart}%`, `${radiusEnd}%`],
      avoidLabelOverlap: true,
      startAngle: 90,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: `{b}: {c} ${param.unit}`
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: percentValue,
          name: param.displayName,
          itemStyle: {
            color: color
          }
        },
        {
          value: 100 - percentValue,
          name: '',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          tooltip: {
            show: false
          }
        }
      ]
    };
  });
  
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%',
      backgroundColor: 'rgba(40, 40, 40, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#fff'
      }
    },
    // 移除内置图例
    series: series
  };
});

// 获取参数对应颜色
const getParamColor = (name) => {
  if (name === '电机温度') return '#5470c6';
  if (name === '振动速度') return '#91cc75';
  if (name === '钢丝绳磨损') return '#fac858';
  return '#5470c6';
};

// 分析历史数据趋势
const getTrendData = () => {
  if (!systemData.value || !systemData.value.historicalData) return null;
  
  return {
    timeLabels: systemData.value.timeLabels,
    data: systemData.value.historicalData
  };
};

onMounted(() => {
  fetchSystemData();
  
  // 设置定时更新数据，每3秒更新一次
  dataUpdateInterval = setInterval(() => {
    updateSystemData();
  }, 3000);
});

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
    dataUpdateInterval = null;
  }
});
</script>

<template>
  <div class="system-view">
    <div v-if="systemData" class="system-content">
      <header class="system-header panel">
        <div class="system-info">
          <div class="system-title-wrapper">
            <h1 class="system-title">{{ systemData.name }}</h1>
            <div class="system-icon">{{ systemData.icon }}</div>
          </div>
          <p class="system-description">{{ systemData.description }}</p>
          <div class="system-meta">
            <div class="meta-item">{{ systemData.model }}</div>
            <div class="meta-item">{{ systemData.manufacturer }}</div>
            <div class="meta-item">{{ systemData.installDate }}</div>
          </div>
        </div>
      </header>

      <!-- 关键指标和历史趋势结合面板 -->
      <div class="indicators-trends-panel panel">
        <div class="panel-columns">
          <!-- 关键指标部分 -->
          <div class="left-panel">
            <h2 class="section-title">关键指标</h2>
            <!-- 自定义图例 -->
            <div class="indicators-legend">
              <div class="legend-item" v-for="(param, index) in getKeyParameters()" :key="index">
                <span class="legend-color" :style="{backgroundColor: getParamColor(param.displayName)}"></span>
                <span>{{ param.displayName }}: {{ param.value }}{{ param.unit }}</span>
              </div>
            </div>
            <div class="key-indicators-chart">
              <v-chart class="chart" :option="keyIndicatorsChartOption" autoresize />
            </div>
          </div>
          
          <!-- 历史趋势部分 -->
          <div class="right-panel">
            <h2 class="section-title">历史趋势</h2>
            <div class="trend-chart-container">
              <ParameterChart 
                v-if="getTrendData()"
                chartType="line"
                :timeLabels="getTrendData().timeLabels"
                :trendData="getTrendData().data"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 曳引机参数 - 在一个框内水平排列 -->
      <div class="traction-parameters panel">
        <h2 class="section-title">曳引机参数</h2>
        <div class="parameter-row">
          <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '曳引机')" 
               :key="index" 
               class="parameter-item">
            <div class="param-title">{{ param.name }}</div>
            <div class="param-value" :style="{color: getStatusColor(param)}">{{ param.value }}{{ param.unit }}</div>
            <div class="param-gauge">
              <ParameterChart 
                chartType="gauge"
                paramGroup="曳引机" 
                :parameters="[param]" 
              />
            </div>
            <div class="param-range">正常范围: {{ param.normal }}</div>
          </div>
        </div>
      </div>
      
      <!-- 其他参数模块 -->
      <div class="other-parameters-grid">
        <!-- 曳引钢丝绳参数模块 -->
        <div class="panel parameter-module">
          <div class="module-header">
            <h2 class="section-title">钢丝绳参数</h2>
            <div class="module-icon">🔗</div>
          </div>
          <div class="parameter-content">
            <ParameterChart 
              chartType="bar"
              paramGroup="曳引钢丝绳" 
              :parameters="systemData.parameters.filter(p => p.group === '曳引钢丝绳')" 
            />
          </div>
        </div>
        
        <!-- 制动器参数模块 -->
        <div class="panel parameter-module">
          <div class="module-header">
            <h2 class="section-title">制动器参数</h2>
            <div class="module-icon">🛑</div>
          </div>
          <div class="parameter-content">
            <ParameterChart 
              chartType="radar"
              paramGroup="制动器" 
              :parameters="systemData.parameters.filter(p => p.group === '制动器')" 
            />
          </div>
        </div>
      </div>
      
      <!-- 维护记录放在最下面 -->
      <div class="maintenance-section panel">
        <h2 class="section-title">维护记录</h2>
        <div class="maintenance-chart-container">
          <MaintenanceChart :records="systemData.maintenanceRecords" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-view {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  color: #e2e8f0;
}

.system-content {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

/* 3D模型区域样式 */
.model-3d-container {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(23, 36, 65, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-left: 4px solid #3498db;
}

.model-3d-placeholder {
  height: 300px;
  width: 100%;
  background: rgba(30, 45, 75, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-loading {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}

.detail-header {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(to right, rgba(23, 36, 65, 0.8), rgba(28, 43, 72, 0.6));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 20px 30px;
  border-left: 4px solid #3498db;
}

.system-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.system-icon {
  font-size: 2.5rem;
  background: rgba(52, 152, 219, 0.2);
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.system-title h1 {
  margin: 0;
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.system-info {
  padding: 0;
}

.system-info p {
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1.05rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  background: rgba(255, 255, 255, 0.08);
  padding: 12px 15px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 关键指标和历史趋势合并面板 */
.indicators-trends-panel {
  margin-bottom: 20px;
  padding: 20px;
}

.panel-columns {
  display: flex;
  gap: 30px;
}

.left-panel, .right-panel {
  flex: 1;
}

/* 曳引机参数样式 - 在一个框内的水平排列 */
.traction-parameters {
  margin-bottom: 20px;
  padding: 25px;
}

.parameter-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.parameter-gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.param-title {
  font-size: 1.2rem;
  color: #fff;
  margin: 0 0 10px 0;
  text-align: center;
}

.param-value {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.param-gauge {
  width: 100%;
  height: 320px;
}

.param-range {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-top: 10px;
}

/* 其他参数模块网格 */
.other-parameters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.panel {
  background: rgba(23, 36, 65, 0.6);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.panel:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #3498db, #1abc9c);
}

.section-title {
  margin: 0 0 20px 0;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: #3498db;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.module-icon {
  font-size: 2rem;
  background: rgba(52, 152, 219, 0.15);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.trend-chart-container {
  height: 400px;
  width: 100%;
  position: relative;
}

/* 维护记录放在底部，宽度100% */
.maintenance-section {
  margin-top: 20px;
  width: 100%;
}

.maintenance-chart-container {
  height: 350px;
  width: 100%;
  position: relative;
}

.key-indicators-chart {
  width: 100%;
  height: 400px;
  position: relative;
  padding-top: 30px; /* 为图例提供额外空间 */
}

.chart {
  width: 100%;
  height: 100%;
}

/* 增加关键指标参数样式 */
.indicators-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: nowrap;
  gap: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.legend-color {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border-radius: 2px;
}

/* 针对不同屏幕大小的响应式调整 */
@media (max-width: 1600px) {
  .parameter-row {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .other-parameters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .panel-columns {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 1400px) {
  .panel-columns {
    flex-direction: column;
  }
  
  .key-indicators-chart {
    height: 350px;
  }
  
  .trend-chart-container {
    height: 350px;
  }
}

@media (max-width: 1200px) {
  .parameter-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .other-parameters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .system-content {
    padding: 15px;
  }
  
  .parameter-row {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    padding: 15px;
  }
  
  .system-title h1 {
    font-size: 1.5rem;
  }
  
  .system-icon {
    font-size: 2rem;
    padding: 8px;
  }
  
  .key-indicators-chart {
    height: 300px;
  }
  
  .trend-chart-container {
    height: 300px;
  }
  
  .param-gauge {
    height: 180px;
  }
}
</style> 