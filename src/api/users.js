import axios from 'axios';
import config from './config';

const API_BASE_URL = config.API_BASE_URL;

/**
 * 用户相关API
 */
export default {
  /**
   * 添加维修人员
   * @param {Object} user - 用户对象
   * @param {string} user.userName - 用户名称
   * @param {string} user.userPhone - 用户手机号
   * @param {string} user.position - 用户职位
   * @param {string|number} user.id - 用户ID
   * @returns {Promise<Object>} 返回添加结果
   */
  addUser(user) {
    return axios.post(`${API_BASE_URL}/users/add-user`, user);
  },

  /**
   * 删除人员
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} 返回删除结果
   */
  deleteUser(id) {
    return axios.post(`${API_BASE_URL}/users/delete-user`, id);
  }
}; 