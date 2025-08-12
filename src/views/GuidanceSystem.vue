<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import ParameterChart from '../components/ParameterChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import GuidanceModelViewer from '../components/GuidanceModelViewer.vue';

// 注册必需的组件
use([CanvasRenderer, GaugeChart, GridComponent, TooltipComponent, TitleComponent]);

const systemId = 'sys-002';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;
// 存储所有仪表盘图表实例
const gaugeCharts = ref([]);

// 模拟数据，用于驱动3D模型动画
const simulationData = ref({
  elevatorPosition: 0, // 电梯位置 (楼层)
  elevatorSpeed: 0, // 电梯速度 (m/s)
  vibration: 0, // 振动值 (0-10)
  temperature: 25, // 温度 (°C)
  guideShoeWear: 1.2, // 导靴磨损量 (mm)
  railAlignment: 0.3 // 导轨对齐度偏差 (mm)
});

// 为不同的参数组分配不同的图表类型
const getChartTypeForGroup = (group) => {
  // 导向系统特定的图表类型
  const systemSpecificCharts = {
    '导轨': 'radar',
    '导靴': 'gauge'
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

// 创建仪表盘图表
const createGaugeCharts = () => {
  if (!systemData.value) return;
  
  // 清除之前的图表实例
  gaugeCharts.value.forEach(chart => {
    chart.dispose();
  });
  gaugeCharts.value = [];
  
  // 获取导靴参数
  const guidanceParams = systemData.value.parameters.filter(p => p.group === '导靴');
  
  // 获取所有仪表盘DOM元素
  const gaugeEls = document.querySelectorAll('.param-gauge');
  if (!gaugeEls || gaugeEls.length === 0) return;
  
  // 为每个参数创建仪表盘
  guidanceParams.forEach((param, index) => {
    // 获取DOM元素
    const el = gaugeEls[index];
    if (!el) return;
    
    // 获取参数范围值
    let min = 0;
    let max = 100;
    let warning = 75;
    let danger = 90;
    
    if (param.name === '导靴磨损量') {
      min = 0; 
      max = 4;
      warning = 2;
      danger = 3;
    } else if (param.name === '振动值') {
      min = 0;
      max = 6;
      warning = 2.8;
      danger = 4.5;
    }
    
    // 创建图表实例
    const chart = echarts.init(el);
    
    // 仪表盘配置
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: `{b}: {c}${param.unit}`,
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff'
        }
      },
      series: [
        {
          name: param.name,
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '75%',
          min,
          max,
          startAngle: 205,
          endAngle: -25,
          splitNumber: 5,
          itemStyle: {
            color: '#58D9F9'
          },
          progress: {
            show: true,
            width: 10,
            itemStyle: {
              shadowBlur: 0
            }
          },
          pointer: {
            show: true,
            width: 3,
            length: '60%',
            itemStyle: {
              color: '#58D9F9'
            }
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [warning / max, '#5CCEA8'],
                [danger / max, '#E2A037'],
                [1, '#E25837']
              ],
              shadowBlur: 0
            }
          },
          axisTick: {
            distance: -24,
            length: 3,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -26,
            length: 6,
            lineStyle: {
              color: '#fff',
              width: 1.5
            }
          },
          axisLabel: {
            distance: -14,
            color: '#fff',
            fontSize: 10
          },
          title: {
            show: true,
            offsetCenter: [0, '65%'],
            fontSize: 10,
            color: '#58D9F9',
            fontWeight: 'bold',
            formatter: param.name
          },
          detail: {
            valueAnimation: true,
            fontSize: 16,
            fontWeight: 'bolder',
            offsetCenter: [0, '25%'],
            formatter: `{value}${param.unit}`,
            color: '#58D9F9',
            backgroundColor: 'transparent'
          },
          data: [
            {
              value: param.value,
              name: param.name
            }
          ]
        }
      ]
    };
    
    // 设置图表选项
    chart.setOption(option);
    
    // 保存图表实例
    gaugeCharts.value.push(chart);
  });
};

// 更新仪表盘数据
const updateGaugeCharts = () => {
  if (gaugeCharts.value.length === 0) return;
  
  // 获取导靴参数
  const guidanceParams = systemData.value.parameters.filter(p => p.group === '导靴');
  
  // 更新每个仪表盘的数据
  guidanceParams.forEach((param, index) => {
    if (index < gaugeCharts.value.length) {
      const chart = gaugeCharts.value[index];
      chart.setOption({
        series: [
          {
            data: [
              {
                value: param.value,
                name: param.name
              }
            ]
          }
        ]
      });
    }
  });
};

// 更新系统数据
const updateSystemData = () => {
  if (!systemData.value) return;
  
  // 更新参数值
  systemData.value.parameters.forEach(param => {
    if (param.name === '导轨垂直度偏差') {
      param.value = (0.25 + Math.random() * 0.3).toFixed(2) * 1;
      simulationData.value.railAlignment = param.value;
    } else if (param.name === '接头间隙') {
      param.value = (0.35 + Math.random() * 0.2).toFixed(2) * 1;
    } else if (param.name === '导靴磨损量') {
      param.value = (1.0 + Math.random() * 1.5).toFixed(1) * 1;
      simulationData.value.guideShoeWear = param.value;
    } else if (param.name === '振动值') {
      param.value = (0.6 + Math.random() * 1.0).toFixed(1) * 1;
      simulationData.value.vibration = param.value;
    }
  });
  
  // 模拟电梯运行状态
  // 电梯位置在0-10楼之间变化
  simulationData.value.elevatorPosition = Math.sin(Date.now() / 5000) * 5 + 5;
  
  // 电梯速度根据位置变化计算
  const positionChange = Math.cos(Date.now() / 5000) * 5;
  simulationData.value.elevatorSpeed = Math.abs(positionChange / 5);
  
  // 温度模拟（25-35度之间变化）
  simulationData.value.temperature = 25 + Math.sin(Date.now() / 10000) * 5 + Math.random() * 2;
  
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
  
  // 更新仪表盘
  updateGaugeCharts();
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
    
    // 调整环形图半径，以适应容器
    const radiusStart = 50 - index * 16;
    const radiusEnd = 65 - index * 16;
    
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
          fontSize: 14,
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
  
  // 创建仪表盘图表
  setTimeout(() => {
    createGaugeCharts();
  }, 100);
  
  // 设置定时更新数据，每3秒更新一次
  dataUpdateInterval = setInterval(() => {
    updateSystemData();
  }, 3000);
});

// 窗口大小变化时重新调整图表
window.addEventListener('resize', () => {
  gaugeCharts.value.forEach(chart => {
    chart.resize();
  });
});

// 组件卸载前清除定时器和事件监听
onBeforeUnmount(() => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
    dataUpdateInterval = null;
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', () => {});
  
  // 销毁所有图表实例
  gaugeCharts.value.forEach(chart => {
    chart.dispose();
  });
  gaugeCharts.value = [];
});
</script>

<template>
  <div class="system-view">
    <TechGridBackground />
    <!-- 返回按钮 -->
    <div class="back-button" @click="$router.go(-1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
    </div>
    <div v-if="systemData" class="system-content">
      <!-- 悬浮标题 -->
      <div class="floating-header">
        <div class="panel-header">
          <h1 class="system-title tech-text">{{ systemData.name }}</h1>
          <div class="tech-decoration"></div>
        </div>
      </div>

      <!-- 三列布局：左侧参数 - 中间3D模型 - 右侧图表 -->
      <div class="main-content">
        <!-- 左侧参数列 -->
        <div class="left-column">
          <!-- 导靴参数 -->
          <div class="guidance-parameters panel">
            <div class="parameter-grid">
              <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '导靴')" 
                   :key="index" 
                   class="parameter-item">
                <div class="param-gauge"></div>
              </div>
            </div>
          </div>
          
          <!-- 导轨参数模块 -->
          <div class="panel parameter-module">
            <div class="parameter-content">
              <ParameterChart 
                chartType="radar"
                paramGroup="导轨" 
                :parameters="systemData.parameters.filter(p => p.group === '导轨')" 
              />
            </div>
          </div>
        </div>

        <!-- 中间3D模型列 -->
        <div class="center-column">
          <div class="model-3d-container">
            <GuidanceModelViewer 
              :autoRotate="true"
              :elevatorPosition="simulationData.elevatorPosition"
              :elevatorSpeed="simulationData.elevatorSpeed"
              :vibration="simulationData.vibration"
              :temperature="simulationData.temperature"
              :guideShoeWear="simulationData.guideShoeWear"
              :railAlignment="simulationData.railAlignment"
            />
          </div>
        </div>

        <!-- 右侧图表列 -->
        <div class="right-column">
          <!-- 关键指标部分 -->
          <div class="panel">
            <div class="key-indicators-chart">
              <v-chart class="chart" :option="keyIndicatorsChartOption" autoresize />
            </div>
            <div class="indicators-legend">
              <div class="legend-item" v-for="(param, index) in getKeyParameters()" :key="index">
                <span class="legend-color" :style="{backgroundColor: getParamColor(param.displayName)}"></span>
                <span>{{ param.displayName }}: {{ param.value }}{{ param.unit }}</span>
              </div>
            </div>
          </div>
          
          <!-- 历史趋势部分 -->
          <div class="panel">
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
  width: 100%;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .back-button {
    left: 15px;
    top: 15px;
  }
}

.back-button {
  position: absolute;
  left: 25px;
  top: 20px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.3);
  border: 2px solid rgba(33, 150, 243, 0.5);
  color: #4dabf5;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.4);
  z-index: 1000;
}

.back-button:hover {
  color: var(--text-color);
  background: rgba(33, 150, 243, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 5px 18px rgba(33, 150, 243, 0.6);
}

.back-button svg {
  margin-right: 5px;
  stroke: #4dabf5;
}

.system-content {
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* 悬浮标题样式 */
.floating-header {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  text-align: center;
  margin: 0;
  padding: 0;
  height: auto;
  line-height: 1;
  background: transparent;
  border-radius: 8px;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.panel-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
  border-bottom: none;
  background: transparent;
  border-radius: 8px;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  position: relative;
}

.system-title {
  margin: 0;
  font-size: 1.6rem;
  color: #4dabf5;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(77, 171, 245, 0.5);
  display: inline-block;
}

.tech-text {
  font-family: 'Orbitron', sans-serif;
}

.tech-decoration {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tech-decoration::before,
.tech-decoration::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
  border-radius: 1px;
}

.tech-decoration::before {
  left: -70px;
}

.tech-decoration::after {
  right: -70px;
  background: linear-gradient(270deg, rgba(77, 171, 245, 0.8), rgba(77, 171, 245, 0.2));
}

/* 三列布局 - 调整列宽比例 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; /* 恢复原来的布局比例 */
  grid-template-rows: auto;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 80px;
  width: 100%;
  min-height: 85vh;
}

/* 移除旧的标题样式 */
.simplified-header {
  display: none;
}

/* 左列样式 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 10px 20px 10px;
  height: 100%;
}

/* 中间列样式 */
.center-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.model-3d-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右列样式 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding-right: 10px;
}

.right-column .panel {
  padding: 8px;
}

.right-column .panel:last-child {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 参数样式 */
.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 15px;
  row-gap: 20px;
  margin-bottom: 15px;
  height: 100%;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0;
  margin-bottom: -25px;
  width: 100%;
}

.param-gauge {
  width: 100%;
  height: 180px;
  margin-top: -30px;
}

.param-range {
  display: none;
}

/* 面板样式 */
.panel {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  width: 100%;
  flex: 1;
}

.panel:before {
  display: none;
}

.section-title {
  display: none;
}

/* 模块样式 */
.module-header {
  display: none;
}

.module-icon {
  display: none;
}

/* 图表容器 */
.trend-chart-container {
  flex-grow: 1;
  width: 100%;
  position: relative;
}

.key-indicators-chart {
  height: 260px;
  width: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 图例样式 */
.indicators-legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 5px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 0.8rem;
}

.legend-color {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 2px;
}

/* 参数内容高度限制 */
.parameter-content {
  padding: 10px 0;
  overflow: hidden;
  height: 240px;
}

/* 特别为导靴参数面板添加的样式 */
.guidance-parameters {
  padding: 30px 10px;
  margin-bottom: 15px;
  width: 100%;
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

.panel.parameter-module {
  padding: 25px 15px;
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .main-content {
    grid-template-columns: 1fr 1.3fr 1fr;
    gap: 6px;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    row-gap: 15px;
  }
  
  .parameter-item {
    margin-bottom: 0;
  }
  
  .left-column, .right-column {
    gap: 6px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    width: 100%;
  }
  
  .model-3d-container {
    min-height: 400px;
  }
  
  .simplified-header {
    padding: 5px 0;
  }
  
  .system-content {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .system-content {
    padding: 5px;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr;
  }
}
</style>