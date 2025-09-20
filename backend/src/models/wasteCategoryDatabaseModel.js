// 垃圾类别数据库模型
const db = require('../utils/db');

/**
 * 垃圾类别数据库模型
 * 用于从数据库中读取垃圾类别信息
 */
class WasteCategoryDatabaseModel {
  constructor() {
    this.tableName = 'waste_categories';
  }

  /**
   * 获取所有垃圾类别
   * @returns {Promise<Array>} 所有垃圾类别数据
   */
  async getAllCategories() {
    try {
      const query = `
        SELECT id, name, color, description, icon_url
        FROM ${this.tableName}
        ORDER BY id ASC
      `;
      const results = await db.query(query);
      return results;
    } catch (error) {
      console.error('获取所有垃圾类别失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @returns {Promise<Object|null>} 垃圾类别数据或null
   */
  async getCategoryById(categoryId) {
    try {
      const query = `
        SELECT id, name, color, description, icon_url
        FROM ${this.tableName}
        WHERE id = ?
      `;
      const params = [categoryId];
      const results = await db.query(query, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('根据ID获取垃圾类别失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否为有效垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @returns {Promise<boolean>} 是否为有效类别
   */
  async isValidCategory(categoryId) {
    try {
      const category = await this.getCategoryById(categoryId);
      return !!category;
    } catch (error) {
      console.error('检查垃圾类别有效性失败:', error);
      throw error;
    }
  }

  /**
   * 获取本地化的垃圾类别数据
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Promise<Object>} 本地化的垃圾类别数据
   */
  async getLocalizedCategories(lang = 'zh') {
    try {
      const categories = await this.getAllCategories();
      const localized = {};
      
      for (const category of categories) {
        localized[category.id] = {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon_url
        };
      }
      
      return localized;
    } catch (error) {
      console.error('获取本地化垃圾类别失败:', error);
      throw error;
    }
  }

  /**
   * 获取本地化的单个垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Promise<Object|null>} 本地化的垃圾类别数据或null
   */
  async getLocalizedCategory(categoryId, lang = 'zh') {
    try {
      const category = await this.getCategoryById(categoryId);
      if (!category) return null;
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon_url
      };
    } catch (error) {
      console.error('获取本地化单个垃圾类别失败:', error);
      throw error;
    }
  }
}

// 导出类的实例作为默认导出
module.exports = new WasteCategoryDatabaseModel();

// 同时导出类本身，以便其他模块可以扩展或直接使用它
module.exports.WasteCategoryDatabaseModel = WasteCategoryDatabaseModel;