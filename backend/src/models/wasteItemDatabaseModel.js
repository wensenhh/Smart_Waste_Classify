// 垃圾项数据库模型
const db = require('../utils/db');
const wasteCategoryDatabaseModel = require('./wasteCategoryDatabaseModel');

/**
 * 垃圾项数据库模型
 * 用于从数据库中读取垃圾项信息
 */
class WasteItemDatabaseModel {
  constructor() {
    this.tableName = 'waste_items';
  }

    /**
   * 获取所有垃圾项
   * @returns {Promise<Array>} 所有垃圾项数据
   */
  async getAllWasteItems() {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url
        FROM ${this.tableName}
        ORDER BY category_id ASC, name ASC
      `;
      const results = await db.query(query);
      return results;
    } catch (error) {
      console.error('获取所有垃圾项失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取垃圾项
   * @param {string} wasteItemId - 垃圾项ID
   * @returns {Promise<Object|null>} 垃圾项数据或null
   */
  async getWasteItemById(wasteItemId) {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url
        FROM ${this.tableName}
        WHERE id = ?
      `;
      const params = [wasteItemId];
      const results = await db.query(query, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('根据ID获取垃圾项失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定垃圾类别下的所有垃圾项
   * @param {string} categoryId - 垃圾类别ID
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Promise<Array>} 该类别下的所有垃圾项
   */
  async getWasteItemsByCategory(categoryId, lang = 'zh') {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url
        FROM ${this.tableName}
        WHERE category_id = ?
        ORDER BY name ASC
      `;
      const params = [categoryId];
      const results = await db.query(query, params);
      
      // 返回处理后的结果
      return results.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        suggestion: item.suggestion,
        subCategory: item.sub_category,
        imageUrl: item.image_url
      }));
    } catch (error) {
      console.error('获取特定类别下的垃圾项失败:', error);
      throw error;
    }
  }

  /**
   * 获取本地化的垃圾项详情
   * @param {string} wasteItemId - 垃圾项ID
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Promise<Object|null>} 本地化的垃圾项详情或null
   */
  async getLocalizedWasteItem(wasteItemId, lang = 'zh') {
    try {
      const wasteItem = await this.getWasteItemById(wasteItemId);
      if (!wasteItem) return null;
      
      // 获取类别的本地化信息
      const category = await wasteCategoryDatabaseModel.getCategoryById(wasteItem.category_id);
      
      return {
        id: wasteItem.id,
        name: wasteItem.name,
        category: wasteItem.category_id,
        categoryName: category?.name,
        categoryIcon: category?.icon_url,
        categoryColor: category?.color,
        description: wasteItem.description,
        suggestion: wasteItem.suggestion,
        subCategory: wasteItem.sub_category,
        imageUrl: wasteItem.image_url
      };
    } catch (error) {
      console.error('获取本地化垃圾项详情失败:', error);
      throw error;
    }
  }

  /**
   * 搜索垃圾项
   * @param {string} keyword - 搜索关键词
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Promise<Array>} 搜索结果
   */
  async searchWasteItems(keyword, lang = 'zh') {
    try {
      if (!keyword || keyword.trim() === '') {
        return [];
      }
      
      const searchLower = keyword.toLowerCase().trim();
      
      const query = `
        SELECT id, name, description, category_id, sub_category, suggestion, image_url
        FROM ${this.tableName}
        WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
        ORDER BY name ASC
      `;
      const params = [`%${searchLower}%`, `%${searchLower}%`];
      const results = await db.query(query, params);
      
      return results;
    } catch (error) {
      console.error('搜索垃圾项失败:', error);
      throw error;
    }
  }
}

module.exports = new WasteItemDatabaseModel();

// 同时导出类本身，以便其他模块可以扩展或直接使用它
module.exports.WasteItemDatabaseModel = WasteItemDatabaseModel;