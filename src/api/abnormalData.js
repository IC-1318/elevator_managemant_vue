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
    return axios.post(`${API_BASE_URL}/data-etable/send-data-to-ai`, data);
  }
}; 