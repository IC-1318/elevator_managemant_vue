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
   * @param {string|number} data.eData - 异常数据值
   * @param {string} [data.aiResult] - AI分析结果
   * @param {number} [data.aiCode] - AI分析结果代码(0表示警告，1表示故障)
   * @returns {Promise<Object>} 返回添加结果，包含mtDataId字段
   */
  addAbnormalData(data) {
    // 确保所有必填字段都有值
    const requestData = {
      systemName: data.systemName || '未知系统',
      systemSqName: data.systemSqName || '未知组件',
      eName: data.eName || '未知异常',
      eData: data.eData || '0'
    };
    
    // 如果有AI分析结果，添加到请求中
    if (data.aiResult) {
      requestData.aiResult = data.aiResult;
    }
    
    if (data.aiCode !== undefined) {
      requestData.aiCode = data.aiCode;
    }
    
    console.log('发送异常数据到后端:', requestData);
    return axios.post(`${API_BASE_URL}/data-etable/gain-data`, requestData);
  },

  /**
   * 分页查询异常数据
   * @param {Object} params - 查询参数
   * @param {number} params.current - 当前页码
   * @param {number} params.size - 每页数据条数
   * @param {number} [params.id] - 异常数据ID
   * @param {number} [params.mtDataId] - 异常数据ID（用于任务分配）
   * @param {string} [params.systemName] - 系统名称
   * @param {string} [params.systemSqName] - 子系统名称
   * @returns {Promise<Object>} 返回查询结果
   */
  getAbnormalData(params) {
    return axios.get(`${API_BASE_URL}/data-etable/selectData`, { params });
  },

  /**
   * 根据mtDataId获取单个异常数据
   * @param {number} mtDataId - 异常数据ID
   * @returns {Promise<Object>} 返回异常数据详情
   */
  getAbnormalDataById(mtDataId) {
    return axios.get(`${API_BASE_URL}/data-etable/selectData`, {
      params: {
        current: 1,
        size: 1,
        mtDataId: mtDataId
      }
    });
  },

  /**
   * 发送数据给AI分析
   * @param {Object} data - 异常数据对象
   * @returns {Promise<Object>} 返回AI分析结果
   */
  sendDataToAI(data) {
    // 确保所有必要字段都已设置
    const requestData = { ...data };
    if (!requestData.systemName) {
      console.warn('AI请求中系统名称为空，设置默认值');
      requestData.systemName = '曳引系统';
    }
    
    if (!requestData.systemSqName) {
      console.warn('AI请求中子系统名称为空，设置默认值');
      requestData.systemSqName = '未知组件';
    }
    
    console.log('发送AI分析请求:', requestData);
    return axios.post(`${API_BASE_URL}/data-etable/gain-data`, requestData);
  },

  /**
   * 获取模拟的AI分析结果
   */
  getSimulatedAIResult() {
    // Implementation of getSimulatedAIResult method
  }
};