<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import HeaderPanel from '../components/HeaderPanel.vue';
import ParameterChart from '../components/ParameterChart.vue';
import MaintenanceChart from '../components/MaintenanceChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';

const systemId = 'sys-003';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;

// 为不同的参数组分配不同的图表类型
const getChartTypeForGroup = (group) => {
  // 电气控制系统特定的图表类型
  const systemSpecificCharts = {
    '电压波动': 'line',
    '触点电压降': 'radar',
    '控制响应时间': 'gauge',
    '电源开关': 'pie'
  };
  
  // 如果有特定配置，使用它，否则使用默认的bar类型
  return systemSpecificCharts[group] || 'bar';
};

// 获取系统数据
const fetchSystemData = () => {
  // 电气控制系统数据
  systemData.value = {
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
    ],
    historicalData: {
      voltage: [4.8, 5.0, 5.5, 5.3, 5.0, 5.2, 5.2],
      current: [82, 83, 84, 85, 85, 84, 85],
      response: [0.38, 0.39, 0.40, 0.42, 0.41, 0.40, 0.40]
    },
    timeLabels: ['11-01', '11-02', '11-03', '11-04', '11-05', '11-06', '今日']
  };
};

// 更新系统数据
const updateSystemData = () => {
  if (!systemData.value) return;
  
  // 更新参数值
  systemData.value.parameters.forEach(param => {
    if (param.name === '电压波动') {
      param.value = (Math.random() * 12 - 2).toFixed(1) * 1; // -2%到10%的波动
    } else if (param.name === '电流负载') {
      param.value = Math.floor(80 + Math.random() * 25); // 80%到105%的负载
    } else if (param.name === '触点电压降') {
      param.value = Math.floor(30 + Math.random() * 40); // 30mV到70mV的电压降
    } else if (param.name === '触点位置偏差') {
      param.value = (Math.random() * 10 - 5).toFixed(1) * 1; // -5mm到5mm的偏差
    } else if (param.name === '控制响应时间') {
      param.value = (0.3 + Math.random() * 0.4).toFixed(2) * 1; // 0.3s到0.7s的响应时间
    } else if (param.name === '二次响应时间') {
      param.value = (0.6 + Math.random() * 0.5).toFixed(2) * 1; // 0.6s到1.1s的响应时间
    } else if (param.name === '电源开关状态') {
      // 95%概率保持正常，5%概率出现故障
      param.value = Math.random() > 0.95 ? '异常' : '正常';
    } else if (param.name === '电源稳定性') {
      param.value = Math.floor(93 + Math.random() * 7); // 93%到100%的稳定性
    }
  });
  
  // 更新历史数据，移除最早的数据点，添加新的数据点
  const newVoltage = systemData.value.parameters.find(p => p.name === '电压波动').value;
  const newCurrent = systemData.value.parameters.find(p => p.name === '电流负载').value;
  const newResponse = systemData.value.parameters.find(p => p.name === '控制响应时间').value;
  
  systemData.value.historicalData.voltage.shift();
  systemData.value.historicalData.voltage.push(newVoltage);
  
  systemData.value.historicalData.current.shift();
  systemData.value.historicalData.current.push(newCurrent);
  
  systemData.value.historicalData.response.shift();
  systemData.value.historicalData.response.push(newResponse);
  
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
  
  const voltage = systemData.value.parameters.find(p => p.name === '电压波动').value;
  const current = systemData.value.parameters.find(p => p.name === '电流负载').value;
  const response = systemData.value.parameters.find(p => p.name === '控制响应时间').value;
  
  return [
    {
      displayName: '电压波动',
      icon: '⚡',
      value: voltage,
      min: 0,
      max: 20,
      unit: '%',
      warningThreshold: 10,
      criticalThreshold: 15,
      isHigherBetter: false
    },
    {
      displayName: '电流负载',
      icon: '🔌',
      value: current,
      min: 0,
      max: 150,
      unit: '%',
      warningThreshold: 95,
      criticalThreshold: 120,
      isHigherBetter: false
    },
    {
      displayName: '响应时间',
      icon: '⏱️',
      value: response,
      min: 0,
      max: 2,
      unit: 's',
      warningThreshold: 0.8,
      criticalThreshold: 1.0,
      isHigherBetter: false
    }
  ];
};

// 获取参数状态颜色
const getStatusColor = (param) => {
  if (param.name === '电压波动') {
    return Math.abs(param.value) <= 10 ? '#4CAF50' : Math.abs(param.value) <= 15 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '电流负载') {
    return param.value <= 95 ? '#4CAF50' : param.value <= 120 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '控制响应时间') {
    return param.value <= 0.8 ? '#4CAF50' : param.value <= 1.0 ? '#FFC107' : '#F44336';
  }
  
  if (param.name === '二次响应时间') {
    return param.value <= 1.0 ? '#4CAF50' : '#F44336';
  }
  
  // 默认颜色
  return '#4CAF50';
};

// 获取参数对应颜色
const getParamColor = (name) => {
  if (name === '电压波动') return '#5470c6';
  if (name === '电流负载') return '#91cc75';
  if (name === '响应时间') return '#fac858';
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
  <div class="system-detail" v-if="systemData">
    <HeaderPanel :elevatorId="systemId" />
    
    <div class="system-content">
      <!-- 3D模型区域 - 预留位置 -->
      <div class="model-3d-container panel">
        <h2 class="section-title">3D模型视图</h2>
        <div class="model-3d-placeholder">
          <div class="model-loading">3D模型加载中...</div>
        </div>
      </div>
      
      <header class="detail-header panel">
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
      
      <!-- 电气控制参数 - 在一个框内水平排列 -->
      <div class="control-parameters panel">
        <h2 class="section-title">电气控制参数</h2>
        <div class="parameter-row">
          <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '控制响应时间')" 
               :key="index" 
               class="parameter-gauge-item">
            <h3 class="param-title">{{ param.name }}</h3>
            <div class="param-value" :style="{color: getStatusColor(param)}">{{ param.value }}{{ param.unit }}</div>
            <div class="param-gauge">
              <ParameterChart 
                chartType="gauge"
                paramGroup="控制响应时间" 
                :parameters="[param]" 
              />
            </div>
            <div class="param-range">正常范围: {{ param.normal }}</div>
          </div>
        </div>
      </div>
      
      <!-- 其他参数模块 -->
      <div class="other-parameters-grid">
        <!-- 电压波动参数模块 -->
        <div class="panel parameter-module">
          <div class="module-header">
            <h2 class="section-title">电压波动参数</h2>
            <div class="module-icon">⚡</div>
          </div>
          <div class="parameter-content">
            <ParameterChart 
              chartType="line"
              paramGroup="电压波动" 
              :parameters="systemData.parameters.filter(p => p.group === '电压波动')" 
            />
          </div>
        </div>
        
        <!-- 触点电压降模块 -->
        <div class="panel parameter-module">
          <div class="module-header">
            <h2 class="section-title">触点电压参数</h2>
            <div class="module-icon">🔌</div>
          </div>
          <div class="parameter-content">
            <ParameterChart 
              chartType="radar"
              paramGroup="触点电压降" 
              :parameters="systemData.parameters.filter(p => p.group === '触点电压降')" 
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
.system-detail {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: #0c1220;
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

/* 电气控制参数样式 - 在一个框内的水平排列 */
.control-parameters {
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