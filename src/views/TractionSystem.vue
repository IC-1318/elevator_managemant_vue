<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import ParameterChart from '../components/ParameterChart.vue';
import SystemDashboard from '../components/SystemDashboard.vue';
import * as echarts from 'echarts/core';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import TractionModelViewer from '../components/TractionModelViewer.vue';

// 注册必需的组件
use([CanvasRenderer, GaugeChart, GridComponent, TooltipComponent, TitleComponent]);

const systemId = 'sys-001';

// 系统详细数据
const systemData = ref(null);
// 定时器引用
let dataUpdateInterval = null;
// 存储所有仪表盘图表实例
const gaugeCharts = ref([]);

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

// 创建仪表盘图表
const createGaugeCharts = () => {
  if (!systemData.value) return;
  
  // 清除之前的图表实例
  gaugeCharts.value.forEach(chart => {
    chart.dispose();
  });
  gaugeCharts.value = [];
  
  // 获取曳引机参数
  const tractionParams = systemData.value.parameters.filter(p => p.group === '曳引机');
  
  // 获取所有仪表盘DOM元素
  const gaugeEls = document.querySelectorAll('.param-gauge');
  if (!gaugeEls || gaugeEls.length === 0) return;
  
  // 为每个参数创建仪表盘
  tractionParams.forEach((param, index) => {
    // 获取DOM元素
    const el = gaugeEls[index];
    if (!el) return;
    
    // 获取参数范围值
    let min = 0;
    let max = 100;
    let warning = 75;
    let danger = 90;
    
    if (param.name === '电机温度') {
      min = 0; 
      max = 120;
      warning = 75;
      danger = 95;
    } else if (param.name === '轴承温度') {
      min = 0;
      max = 120;
      warning = 85;
      danger = 95;
    } else if (param.name === '振动速度') {
      min = 0;
      max = 6;
      warning = 2.8;
      danger = 4.5;
    } else if (param.name === '电流') {
      min = 10;
      max = 25;
      warning = 19;
      danger = 21;
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
          radius: '75%', // 从80%继续减少到75%
          min,
          max,
          startAngle: 205,
          endAngle: -25,
          splitNumber: 5, // 从6减小到5，减少分段数
          itemStyle: {
            color: '#58D9F9'
          },
          progress: {
            show: true,
            width: 10, // 从12减小到10
            itemStyle: {
              shadowBlur: 0
            }
          },
          pointer: {
            show: true,
            width: 3, // 从4减小到3
            length: '60%', // 从65%减小到60%
            itemStyle: {
              color: '#58D9F9'
            }
          },
          axisLine: {
            lineStyle: {
              width: 12, // 从14减小到12，使轴线更细
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
            length: 3, // 从4减小到3
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -26,
            length: 6, // 从8减小到6
            lineStyle: {
              color: '#fff',
              width: 1.5 // 从2减小到1.5
            }
          },
          axisLabel: {
            distance: -14,
            color: '#fff',
            fontSize: 10 // 从12减小到10
          },
          title: {
            show: true,
            offsetCenter: [0, '65%'], // 从75%调整到65%，向上移动标题
            fontSize: 10, // 从12减小到10
            color: '#58D9F9',
            fontWeight: 'bold',
            formatter: param.name
          },
          detail: {
            valueAnimation: true,
            fontSize: 16, // 从18减小到16
            fontWeight: 'bolder',
            offsetCenter: [0, '25%'], // 从30%调整到25%，向上移动数值
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
  
  // 获取曳引机参数
  const tractionParams = systemData.value.parameters.filter(p => p.group === '曳引机');
  
  // 更新每个仪表盘的数据
  tractionParams.forEach((param, index) => {
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
  
  // 更新仪表盘
  updateGaugeCharts();
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
    <div v-if="systemData" class="system-content">
      <!-- 悬浮标题 -->
      <div class="floating-header">
        <h1 class="system-title">{{ systemData.name }}</h1>
      </div>

      <!-- 三列布局：左侧参数 - 中间3D模型 - 右侧图表 -->
      <div class="main-content">
        <!-- 左侧参数列 -->
        <div class="left-column">
          <!-- 曳引机参数 -->
          <div class="traction-parameters panel">
            <div class="parameter-grid">
              <div v-for="(param, index) in systemData.parameters.filter(p => p.group === '曳引机')" 
                   :key="index" 
                   class="parameter-item">
                <div class="param-gauge"></div>
              </div>
            </div>
          </div>
          
          <!-- 钢丝绳参数模块 -->
          <div class="panel parameter-module">
            <div class="parameter-content">
              <ParameterChart 
                chartType="bar"
                paramGroup="曳引钢丝绳" 
                :parameters="systemData.parameters.filter(p => p.group === '曳引钢丝绳')" 
              />
            </div>
          </div>
        </div>

        <!-- 中间3D模型列 -->
        <div class="center-column">
          <div class="model-3d-container">
            <TractionModelViewer />
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

.system-content {
  padding: 0; /* 移除水平内边距，解决右侧偏移问题 */
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* 悬浮标题样式 */
.floating-header {
  position: fixed;
  top: 10px;
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

.system-title {
  margin: 0;
  padding: 8px 20px;
  font-size: 1.6rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: inline-block;
}

/* 三列布局 - 调整列宽比例 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; /* 修改比例，增加中间列的宽度 */
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 30px;
  width: 100%;
}

/* 移除旧的标题样式 */
.simplified-header {
  display: none;
}

/* 左列样式 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 从20px减小到10px，减少上下间距 */
  padding-left: 10px;
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
  gap: 10px; /* 从15px减小到10px，与左侧保持一致 */
  width: 100%;
  padding-right: 10px; /* 从5px增加到10px，与左侧保持一致 */
}

.right-column .panel {
  padding: 8px; /* 略微减小内边距 */
}

.right-column .panel:last-child {
  flex-grow: 1; /* 让最后一个面板（历史趋势）填满剩余空间 */
  display: flex;
  flex-direction: column;
}

/* 参数样式 */
.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 15px; 
  row-gap: 0px; /* 从5px减小到0px，完全移除行间距 */
  margin-bottom: 0px; /* 从5px减小到0px */
}

.parameter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0;
  margin-bottom: -25px; /* 从-10px减少到-25px，进一步压缩垂直空间 */
  width: 100%; /* 确保参数项占满列宽 */
}

.param-gauge {
  width: 100%;
  height: 95px; /* 从105px减小到95px */
  margin-top: -50px; /* 从-40px进一步减少到-50px，大幅减少参数名称与仪表盘的距离 */
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
  flex-grow: 1; /* 让图表容器填满其父面板的空间 */
  width: 100%;
  position: relative;
}

.key-indicators-chart {
  height: 220px; /* 设置一个固定的基础高度 */
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
  height: 100px; /* 从80px增加到100px，增加钢丝绳参数图表高度 */
  overflow: hidden;
}

/* 特别为曳引机参数面板添加的样式 */
.traction-parameters {
  padding: 2px;
  margin-bottom: 2px;
  width: 100%;
  height: auto;
  min-height: 180px; /* 从220px减少到180px，进一步缩小整体高度 */
}

.panel.parameter-module {
  padding: 8px; /* 略微减小内边距 */
}

/* 调整模块图标大小 */
.module-icon {
  font-size: 1.2rem;
  width: 30px;
  height: 30px;
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .main-content {
    grid-template-columns: 1fr 1.3fr 1fr; /* 保持一致的比例 */
    gap: 6px;
  }
  
  .parameter-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px; /* 从5px增加到15px */
    row-gap: 15px; /* 从-30px修改为15px */
  }
  
  .parameter-item {
    margin-bottom: 0; /* 从-40px修改为0 */
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