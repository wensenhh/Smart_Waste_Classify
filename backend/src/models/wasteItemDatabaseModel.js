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
  /**
   * 获取所有垃圾项
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Array>} 所有垃圾项数据
   */
  async getAllWasteItems(lang = 'zh') {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url, lang
        FROM ${this.tableName}
        WHERE lang = ?
        ORDER BY category_id ASC, name ASC
      `;
      const params = [lang];
      const results = await db.query(query, params);
      return results;
    } catch (error) {
      // 如果因为lang字段不存在而失败，使用兼容模式查询所有记录
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('lang')) {
        console.warn('lang字段不存在，使用兼容模式查询所有记录');
        const query = `
          SELECT id, name, category_id, sub_category, description, suggestion, image_url
          FROM ${this.tableName}
          ORDER BY category_id ASC, name ASC
        `;
        const results = await db.query(query);
        // 为每条记录添加默认的lang字段
        return results.map(item => ({ ...item, lang: 'zh' }));
      }
      console.error('获取所有垃圾项失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取垃圾项
   * @param {string} wasteItemId - 垃圾项ID
   * @returns {Promise<Object|null>} 垃圾项数据或null
   */
  /**
   * 根据ID获取垃圾项
   * @param {string} wasteItemId - 垃圾项ID
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Object|null>} 垃圾项数据或null
   */
  async getWasteItemById(wasteItemId, lang = 'zh') {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url, lang
        FROM ${this.tableName}
        WHERE id = ? AND lang = ?
      `;
      const params = [wasteItemId, lang];
      const results = await db.query(query, params);
      
      if (results.length > 0) {
        return results[0];
      }
      
      // 如果没有找到对应语言的记录，尝试查找任何语言的记录（兼容模式）
      const fallbackQuery = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url
        FROM ${this.tableName}
        WHERE id = ?
      `;
      const fallbackResults = await db.query(fallbackQuery, [wasteItemId]);
      
      if (fallbackResults.length > 0) {
        // 为记录添加默认的lang字段
        return { ...fallbackResults[0], lang: 'zh' };
      }
      
      return null;
    } catch (error) {
      // 如果因为lang字段不存在而失败，使用兼容模式查询
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('lang')) {
        console.warn('lang字段不存在，使用兼容模式查询');
        const query = `
          SELECT id, name, category_id, sub_category, description, suggestion, image_url
          FROM ${this.tableName}
          WHERE id = ?
        `;
        const params = [wasteItemId];
        const results = await db.query(query, params);
        
        if (results.length > 0) {
          // 为记录添加默认的lang字段
          return { ...results[0], lang: 'zh' };
        }
        
        return null;
      }
      
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
  /**
   * 获取特定垃圾类别下的所有垃圾项
   * @param {string} categoryId - 垃圾类别ID
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Array>} 该类别下的所有垃圾项
   */
  async getWasteItemsByCategory(categoryId, lang = 'zh') {
    try {
      const query = `
        SELECT id, name, category_id, sub_category, description, suggestion, image_url, lang
        FROM ${this.tableName}
        WHERE category_id = ? AND lang = ?
        ORDER BY name ASC
      `;
      const params = [categoryId, lang];
      const results = await db.query(query, params);
      
      // 返回处理后的结果
      return results.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        suggestion: item.suggestion,
        subCategory: item.sub_category,
        imageUrl: item.image_url,
        lang: item.lang
      }));
    } catch (error) {
      // 如果因为lang字段不存在而失败，使用兼容模式查询
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('lang')) {
        console.warn('lang字段不存在，使用兼容模式查询');
        const query = `
          SELECT id, name, category_id, sub_category, description, suggestion, image_url
          FROM ${this.tableName}
          WHERE category_id = ?
          ORDER BY name ASC
        `;
        const params = [categoryId];
        const results = await db.query(query, params);
        
        // 返回处理后的结果，为每条记录添加默认的lang字段
        return results.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          suggestion: item.suggestion,
          subCategory: item.sub_category,
          imageUrl: item.image_url,
          lang: 'zh'
        }));
      }
      
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
  /**
   * 获取本地化的垃圾项详情
   * @param {string} wasteItemId - 垃圾项ID
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Object|null>} 本地化的垃圾项详情或null
   */
  async getLocalizedWasteItem(wasteItemId, lang = 'zh') {
    try {
      // 调用已经更新的getWasteItemById方法，传入lang参数
      const wasteItem = await this.getWasteItemById(wasteItemId, lang);
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
        imageUrl: wasteItem.image_url,
        lang: wasteItem.lang || lang // 确保返回lang字段
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
  /**
   * 搜索垃圾项
   * @param {string} keyword - 搜索关键词
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Array>} 搜索结果
   */
  async searchWasteItems(keyword, lang = 'zh') {
    try {
      if (!keyword || keyword.trim() === '') {
        return [];
      }
      
      const searchLower = keyword.toLowerCase().trim();
      
      const query = `
        SELECT id, name, description, category_id, sub_category, suggestion, image_url, lang
        FROM ${this.tableName}
        WHERE (LOWER(name) LIKE ? OR LOWER(description) LIKE ?) AND lang = ?
        ORDER BY name ASC
      `;
      const params = [`%${searchLower}%`, `%${searchLower}%`, lang];
      const results = await db.query(query, params);
      
      return results;
    } catch (error) {
      // 如果因为lang字段不存在而失败，使用兼容模式查询
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('lang')) {
        console.warn('lang字段不存在，使用兼容模式搜索');
        const searchLower = keyword.toLowerCase().trim();
        
        const query = `
          SELECT id, name, description, category_id, sub_category, suggestion, image_url
          FROM ${this.tableName}
          WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
          ORDER BY name ASC
        `;
        const params = [`%${searchLower}%`, `%${searchLower}%`];
        const results = await db.query(query, params);
        
        // 为每条记录添加默认的lang字段
        return results.map(item => ({ ...item, lang: 'zh' }));
      }
      
      console.error('搜索垃圾项失败:', error);
      throw error;
    }
  }
}

module.exports = new WasteItemDatabaseModel();

// 同时导出类本身，以便其他模块可以扩展或直接使用它
module.exports.WasteItemDatabaseModel = WasteItemDatabaseModel;