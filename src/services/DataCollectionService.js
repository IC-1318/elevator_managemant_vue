import axios from 'axios';
import { abnormalDataApi } from '../api';

/**
 * 数据采集服务
 * 负责收集电梯系统数据，检测异常，并将异常数据发送给后端
 */
class DataCollectionService {
  /**
   * 初始化数据采集服务
   * @param {Object} options - 配置选项
   * @param {number} options.collectionInterval - 数据采集间隔(毫秒)
   * @param {number} options.batchSize - 异常数据批量发送大小
   */
  constructor(options = {}) {
    this.collectionInterval = options.collectionInterval || 5000; // 默认5秒采集一次
    this.batchSize = options.batchSize || 10; // 默认批量发送10条异常数据
    this.isCollecting = false;
    this.collectionTimer = null;
    this.anomalyQueue = [];
    this.lastSentTimestamp = Date.now();
    this.elevatorId = null;
  }

  /**
   * 设置电梯ID
   * @param {string} elevatorId - 电梯唯一标识
   */
  setElevatorId(elevatorId) {
    this.elevatorId = elevatorId;
  }

  /**
   * 开始数据采集
   * @param {Object} elevatorData - 电梯数据对象
   * @param {Function} onAnomalyDetected - 异常检测回调函数
   * @returns {boolean} 是否成功启动采集
   */
  startCollection(elevatorData, onAnomalyDetected) {
    if (this.isCollecting || !this.elevatorId) {
      console.warn('数据采集已在进行或电梯ID未设置');
      return false;
    }

    this.isCollecting = true;
    this.elevatorData = elevatorData;
    this.onAnomalyDetected = onAnomalyDetected;

    // 启动定时采集
    this.collectionTimer = setInterval(() => {
      this.collectAndProcessData();
    }, this.collectionInterval);

    console.log(`电梯 ${this.elevatorId} 数据采集已启动，间隔: ${this.collectionInterval}ms`);
    return true;
  }

  /**
   * 停止数据采集
   */
  stopCollection() {
    if (!this.isCollecting) {
      return;
    }

    clearInterval(this.collectionTimer);
    this.isCollecting = false;
    this.collectionTimer = null;

    // 发送剩余的异常数据
    if (this.anomalyQueue.length > 0) {
      this.sendAnomalyData();
    }

    console.log(`电梯 ${this.elevatorId} 数据采集已停止`);
  }

  /**
   * 采集并处理数据
   * @private
   */
  collectAndProcessData() {
    if (!this.elevatorData || !this.elevatorData.value) {
      console.warn('电梯数据对象无效');
      return;
    }

    const currentData = this.elevatorData.value;
    const timestamp = Date.now();
    const anomalies = this.detectAnomalies(currentData, timestamp);

    // 如果检测到异常
    if (anomalies.length > 0) {
      // 添加到队列
      this.anomalyQueue.push(...anomalies);
      
      // 触发回调
      if (this.onAnomalyDetected && typeof this.onAnomalyDetected === 'function') {
        this.onAnomalyDetected(anomalies);
      }

      // 检查是否需要发送数据
      if (this.anomalyQueue.length >= this.batchSize || 
          (timestamp - this.lastSentTimestamp) > 60000) { // 每分钟至少发送一次
        this.sendAnomalyData();
      }
    }
  }

  /**
   * 检测异常数据
   * @param {Object} data - 电梯数据
   * @param {number} timestamp - 时间戳
   * @returns {Array} 异常数据数组
   * @private
   */
  detectAnomalies(data, timestamp) {
    const anomalies = [];

    // 检查各系统参数
    if (data.systems && Array.isArray(data.systems)) {
      data.systems.forEach(system => {
        if (system.status === '故障') {
          // 系统级别异常
          anomalies.push({
            elevatorId: this.elevatorId,
            timestamp,
            systemId: system.id,
            systemName: system.name,
            type: 'system',
            status: system.status,
            faultCode: system.faultCode,
            temperature: system.temperature,
            parameters: JSON.stringify(system.parameters)
          });
        }

        // 参数级别异常
        if (system.parameters && Array.isArray(system.parameters)) {
          system.parameters.forEach(param => {
            // 根据不同参数类型判断是否异常
            let isAnomaly = false;
            let anomalyLevel = '';

            switch (param.name) {
              // 曳引系统参数
              case '电机温度':
                if (param.value > 80) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 95 ? 'critical' : 'warning';
                }
                break;
              case '轴承温度':
                if (param.value > 85) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 95 ? 'critical' : 'warning';
                }
                break;
              case '振动速度':
                if (param.value > 2.8) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 4.5 ? 'critical' : 'warning';
                }
                break;
              case '电流':
                if (Math.abs(param.value - 18.5) > 1.85) {
                  isAnomaly = true;
                  anomalyLevel = Math.abs(param.value - 18.5) > 2.775 ? 'critical' : 'warning';
                }
                break;
              case '钢丝绳磨损':
                if (param.value > 8) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 10 ? 'critical' : 'warning';
                }
                break;
              case '断丝数':
                if (param.value > 5) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 8 ? 'critical' : 'warning';
                }
                break;
              case '制动间隙':
                if (param.value < 0.5 || param.value > 1.0) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 1.5 ? 'critical' : 'warning';
                }
                break;
              
              // 导向系统参数
              case '导轨垂直度偏差':
                if (param.value > 0.5) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 1.0 ? 'critical' : 'warning';
                }
                break;
              case '接头间隙':
                if (param.value > 0.45) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 0.5 ? 'critical' : 'warning';
                }
                break;
              case '导靴磨损量':
                if (param.value > 2) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 3 ? 'critical' : 'warning';
                }
                break;
              
              // 电气控制系统参数
              case '电压波动':
                if (Math.abs(param.value) > 10) {
                  isAnomaly = true;
                  anomalyLevel = Math.abs(param.value) > 15 ? 'critical' : 'warning';
                }
                break;
              case '电流负载':
                if (param.value > 100) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 120 ? 'critical' : 'warning';
                }
                break;
              case '触点电压降':
                if (param.value > 50) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 100 ? 'critical' : 'warning';
                }
                break;
              case '控制响应时间':
                if (param.value > 0.5) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 1.0 ? 'critical' : 'warning';
                }
                break;
              
              // 门系统参数
              case '触点电阻':
                if (param.value > 0.5) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 1.0 ? 'critical' : 'warning';
                }
                break;
              case '机械闭合深度':
                if (param.value < 7) {
                  isAnomaly = true;
                  anomalyLevel = param.value < 5 ? 'critical' : 'warning';
                }
                break;
              case '开关门时间':
                if (param.value < 2 || param.value > 3) {
                  isAnomaly = true;
                  anomalyLevel = param.value > 5 ? 'critical' : 'warning';
                }
                break;
              
              default:
                // 对于其他参数，使用通用判断逻辑
                if (param.normal && typeof param.value === 'number') {
                  // 如果有正常范围定义，检查是否在范围内
                  const normalRange = param.normal.toString();
                  if (normalRange.includes('-')) {
                    const [min, max] = normalRange.split('-').map(v => parseFloat(v));
                    if (param.value < min || param.value > max) {
                      isAnomaly = true;
                      anomalyLevel = 'warning';
                    }
                  } else if (normalRange.includes('≤')) {
                    const max = parseFloat(normalRange.replace('≤', ''));
                    if (param.value > max) {
                      isAnomaly = true;
                      anomalyLevel = 'warning';
                    }
                  } else if (normalRange.includes('≥')) {
                    const min = parseFloat(normalRange.replace('≥', ''));
                    if (param.value < min) {
                      isAnomaly = true;
                      anomalyLevel = 'warning';
                    }
                  }
                }
            }

            if (isAnomaly) {
              anomalies.push({
                elevatorId: this.elevatorId,
                timestamp,
                systemId: system.id,
                systemName: system.name,
                type: 'parameter',
                paramName: param.name,
                paramValue: param.value,
                paramUnit: param.unit,
                normalRange: param.normal,
                anomalyLevel
              });
            }
          });
        }
      });
    }

    return anomalies;
  }

  /**
   * 发送异常数据到后端
   * @private
   */
  async sendAnomalyData() {
    if (this.anomalyQueue.length === 0) {
      return;
    }

    try {
      const dataToSend = [...this.anomalyQueue];
      this.anomalyQueue = []; // 清空队列
      this.lastSentTimestamp = Date.now();

      console.log('准备发送异常数据:', dataToSend);
      
      try {
        // 将异常数据格式化为后端API接受的格式
        for (const anomaly of dataToSend) {
          // 根据不同系统类型构造异常数据对象
          const abnormalData = {
            systemName: anomaly.systemName,
            systemSqName: anomaly.type === 'parameter' ? anomaly.paramName : anomaly.faultCode || '未知',
            eName: this.elevatorId || '电梯',
            eData: anomaly.type === 'parameter' ? anomaly.paramValue : anomaly.faultCode || 0
          };
          
          // 调用API发送异常数据
          const response = await abnormalDataApi.addAbnormalData(abnormalData);
          console.log(`成功发送异常数据:`, response.data);
        }
      } catch (apiError) {
        console.error('API调用失败，但不影响应用继续运行:', apiError);
        // 模拟成功响应，不将数据放回队列，避免队列无限增长
        console.log('API调用失败，丢弃异常数据');
      }
    } catch (error) {
      console.error('发送异常数据过程中发生严重错误:', error);
      // 发生意外错误时，不再将数据放回队列
    }
  }

  /**
   * 获取AI分析结果
   * @param {string} systemId - 系统ID（可选，不传则获取所有系统）
   * @returns {Promise<Object>} AI分析结果
   */
  async getAIAnalysis(systemName = null) {
    try {
      console.log('尝试获取AI分析结果:', systemName);
      
      try {
        // 构造一个模拟的异常数据用于AI分析
        const mockData = {
          systemName: systemName || '曳引系统',
          systemSqName: '曳引电动机',
          eName: this.elevatorId || '电梯',
          eData: 153
        };
        
        // 调用API发送数据进行AI分析
        const response = await abnormalDataApi.sendDataToAI(mockData);
        return {
          id: 'ai-analysis-' + Date.now(),
          timestamp: Date.now(),
          systemName: mockData.systemName,
          severity: 'warning',
          systemInfo: {
            name: mockData.systemName,
            status: '异常'
          },
          summary: response.data.message,
          details: [response.data.message],
          recommendations: ['请根据AI分析结果进行相应处理']
        };
      } catch (apiError) {
        console.error('获取AI分析结果API调用失败:', apiError);
        // 返回模拟数据，避免前端出错
        return {
          id: 'mock-ai-analysis',
          timestamp: Date.now(),
          systemName: systemName || '曳引系统',
          severity: 'warning',
          systemInfo: {
            name: '模拟系统',
            status: '正常'
          },
          summary: '这是一个模拟的AI分析结果，因为API调用失败。',
          details: ['API调用失败，无法获取真实分析数据。'],
          recommendations: ['检查后端API是否正常运行。']
        };
      }
    } catch (error) {
      console.error('获取AI分析结果过程中发生严重错误:', error);
      throw error;
    }
  }
}

export default DataCollectionService; 