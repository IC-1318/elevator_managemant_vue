import axios from 'axios';
import config from './config';

const API_BASE_URL = config.API_BASE_URL;

/**
 * 异常数据相关API
 */
export default {
  /**
   * 添加异常数据
   * @param {Object} data - 异常数据对象
   * @param {string} data.systemName - 系统名称
   * @param {string} data.systemSqName - 子系统名称
   * @param {string} data.eName - 异常名称
   * @param {number} data.eData - 异常数据值
   * @returns {Promise<Object>} 返回添加结果
   */
  addAbnormalData(data) {
    return axios.post(`${API_BASE_URL}/data-etable/gain-data`, data);
  },

  /**
   * 分页查询异常数据
   * @param {Object} params - 查询参数
   * @param {number} params.current - 当前页码
   * @param {number} params.size - 每页数据条数
   * @param {number} [params.id] - 异常数据ID
   * @param {string} [params.systemName] - 系统名称
   * @param {string} [params.systemSqName] - 子系统名称
   * @returns {Promise<Object>} 返回查询结果
   */
  getAbnormalData(params) {
    return axios.get(`${API_BASE_URL}/data-etable/selectData`, { params });
  },

  /**
   * 发送数据给AI分析
   * @param {Object} data - 异常数据对象
   * @returns {Promise<Object>} 返回AI分析结果
   */
  sendDataToAI(data) {
    // 添加请求ID和时间戳，确保每次请求都是唯一的
    const requestData = {
      ...data,
      requestId: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    
    // 确保所有必要字段都已设置
    if (!requestData.systemName) {
      console.warn('AI请求中系统名称为空，设置默认值');
      requestData.systemName = '曳引系统';
    }
    
    if (!requestData.systemSqName) {
      console.warn('AI请求中子系统名称为空，设置默认值');
      requestData.systemSqName = '未知组件';
    }
    
    // 确保id和createTime字段明确设置为null，让后端生成
    requestData.id = null;
    requestData.createTime = null;
    
    console.log('发送AI分析请求:', requestData);
    return axios.post(`${API_BASE_URL}/data-etable/send-data-to-ai`, requestData);
  },
  
  /**
   * 接收AI分析判断结果
   * @returns {Promise<Object>} 返回AI分析结果
   * @description code=0表示警告，code=1表示严重故障
   */
  receiveAIAnalysis() {
    // 该方法不再使用模拟数据，只在实际有异常数据时才会被调用
    console.error('receiveAIAnalysis方法已废弃，不应被直接调用');
    return Promise.reject('该方法已废弃');
  }
}; 