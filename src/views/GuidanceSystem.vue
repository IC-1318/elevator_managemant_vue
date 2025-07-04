<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import ParameterChart from '../components/ParameterChart.vue';
import MaintenanceChart from '../components/MaintenanceChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';

const systemId = 'sys-002';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;

// 为不同的参数组分配不同的图表类型
const getChartTypeForGroup = (group) => {
  // 导向系统特定的图表类型
  const systemSpecificCharts = {
    '导轨': 'pie',
    '导靴': 'bar'
  };
  
  // 如果有特定配置，使用它，否则使用默认的bar类型
  return systemSpecificCharts[group] || 'bar';
};

// 获取系统数据
const fetchSystemData = () => {
  // 导向系统数据
  systemData.value = {
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
    ],
    historicalData: {
      verticality: [0.28, 0.29, 0.30, 0.30, 0.31, 0.30, 0.30],
      wear: [1.0, 1.0, 1.1, 1.2, 1.2, 1.2, 1.2],
      gap: [0.35, 0.38, 0.40, 0.38, 0.39, 0.40, 0.40]
    },
    timeLabels: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '今日']
  };
};

// 更新系统数据
const updateSystemData = () => {
  if (!systemData.value) return;
  
  // 更新参数值
  systemData.value.parameters.forEach(param => {
    if (param.name === '导轨垂直度偏差') {
      param.value = (0.25 + Math.random() * 0.3).toFixed(2) * 1;
    } else if (param.name === '接头间隙') {
      param.value = (0.35 + Math.random() * 0.2).toFixed(2) * 1;
    } else if (param.name === '导靴磨损量') {
      param.value = (1.0 + Math.random() * 1.5).toFixed(1) * 1;
    } else if (param.name === '振动值') {
      param.value = (0.6 + Math.random() * 1.0).toFixed(1) * 1;
    }
  });
  
  // 更新历史数据，移除最早的数据点，添加新的数据点
  const newVerticality = systemData.value.parameters.find(p => p.name === '导轨垂直度偏差').value;
  const newWear = systemData.value.parameters.find(p => p.name === '导靴磨损量').value;
  const newGap = systemData.value.parameters.find(p => p.name === '接头间隙').value;
  
  systemData.value.historicalData.verticality.shift();
  systemData.value.historicalData.verticality.push(newVerticality);
  
  systemData.value.historicalData.wear.shift();
  systemData.value.historicalData.wear.push(newWear);
  
  systemData.value.historicalData.gap.shift();
  systemData.value.historicalData.gap.push(newGap);
  
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
  
  const verticality = systemData.value.parameters.find(p => p.name === '导轨垂直度偏差').value;
  const wear = systemData.value.parameters.find(p => p.name === '导靴磨损量').value;
  
  return [
    {
      displayName: '导轨垂直度',
      icon: '📏',
      value: verticality,
      min: 0,
      max: 1.5,
      unit: 'mm/m',
      warningThreshold: 0.45,
      criticalThreshold: 1.0,
      isHigherBetter: false
    },
    {
      displayName: '导靴磨损量',
      icon: '👟',
      value: wear,
      min: 0,
      max: 4,
      unit: 'mm',
      warningThreshold: 2,
      criticalThreshold: 3,
      isHigherBetter: false
    }
  ];
};

// 获取参数状态颜色
const getStatusColor = (param) => {
  if (param.name === '导轨垂直度偏差') {
    return param.value <= 0.45 ? '#4CAF50' : param.value <= 1.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '接头间隙') {
    return param.value <= 0.45 ? '#4CAF50' : param.value <= 0.5 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '导靴磨损量') {
    return param.value <= 2.0 ? '#4CAF50' : param.value <= 3.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '振动值') {
    return param.value <= 2.8 ? '#4CAF50' : param.value <= 4.5 ? '#FFC107' : '#F44336';
  }
  
  // 默认颜色
  return '#4CAF50';
};

// 获取参数对应颜色
const getParamColor = (name) => {
  if (name === '导轨垂直度') return '#5470c6';
  if (name === '导靴磨损量') return '#91cc75';
  return '#5470c6';
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
            <div class="meta-item">{{ systemData.maintenanceCycle }}</div>
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
      
      <!-- 导向系统主要参数 - 在一个框内水平排列 -->
      <div class="guidance-parameters panel">
        <h2 class="section-title">导向系统主要参数</h2>
        <div class="parameter-row">
          <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '导靴')" 
               :key="index" 
               class="parameter-gauge-item">
            <h3 class="param-title">{{ param.name }}</h3>
            <div class="param-value" :style="{color: getStatusColor(param)}">{{ param.value }}{{ param.unit }}</div>
            <div class="param-gauge">
              <ParameterChart 
                chartType="gauge"
                paramGroup="导靴" 
                :parameters="[param]" 
              />
            </div>
            <div class="param-range">正常范围: {{ param.normal }}</div>
          </div>
        </div>
      </div>
      
      <!-- 其他参数模块 -->
      <div class="other-parameters-grid">
        <!-- 导轨参数模块 -->
        <div class="panel parameter-module">
          <div class="module-header">
            <h2 class="section-title">导轨参数</h2>
            <div class="module-icon">📏</div>
          </div>
          <div class="parameter-content">
            <ParameterChart 
              chartType="pie"
              paramGroup="导轨" 
              :parameters="systemData.parameters.filter(p => p.group === '导轨')" 
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

/* 导向系统参数样式 - 在一个框内的水平排列 */
.guidance-parameters {
  margin-bottom: 20px;
  padding: 25px;
}

.parameter-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
    grid-template-columns: repeat(2, 1fr);
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
    grid-template-columns: repeat(1, 1fr);
  }
  
  .other-parameters-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 