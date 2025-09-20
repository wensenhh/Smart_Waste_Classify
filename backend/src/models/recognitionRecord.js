// 垃圾识别记录模型
const db = require('../utils/db');
const crypto = require('crypto'); // 使用Node.js内置模块生成UUID

/**
 * 垃圾识别记录模型
 * 用于处理用户垃圾识别历史记录的数据库操作
 */
class RecognitionRecord {
  constructor() {
    this.tableName = 'recognition_records';
  }

  /**
   * 创建新的识别记录
   * @param {Object} recordData - 识别记录数据
   * @param {string} recordData.userId - 用户ID
   * @param {string} recordData.imageUrl - 识别图片URL
   * @param {string} recordData.wasteType - 垃圾类型
   * @param {string} recordData.category - 垃圾类别
   * @param {number} recordData.confidence - 识别置信度
   * @param {string} [recordData.description] - 描述
   * @param {string} [recordData.suggestion] - 处理建议
   * @param {string} [recordData.wasteName] - 垃圾名称
   * @param {string} [recordData.classificationReason] - 分类依据
   * @param {string} [recordData.disposalMethod] - 处理方式
   * @param {string} [recordData.aiModel] - AI模型
   * @param {string} [recordData.environmentalTip] - 环保提示
   * @returns {Promise<Object>} 创建的记录
   */
  async createRecord(recordData) {
    try {
      // 解构参数并提供默认值，确保不会有undefined值
      const {
        userId = null,
        imageUrl = null,
        wasteType = '未知',
        category = '未知',
        confidence = 0,
        description = '无',
        suggestion = '无',
        wasteName = '未知',
        classificationReason = '无',
        disposalMethod = 'unknown',
        aiModel = 'unknown',
        environmentalTip = '无'
      } = recordData || {};

      // 生成UUID作为记录ID
      const recordId = crypto.randomUUID();

      // 使用JavaScript生成的当前实际时间
      const now = new Date();
      // 格式化为YYYY-MM-DD HH:MM:SS格式以匹配数据库datetime类型
      const currentTime = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');
      
      const query = `
        INSERT INTO ${this.tableName} (
          id,
          user_id,
          image_url,
          confidence,
          waste_name,
          classification_reason,
          disposal_method,
          ai_model,
          environmental_tip,
          recognized_at,
          recognition_type,
          city,
          waste_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // 再次检查关键参数，确保它们不为undefined
      const safeUserId = userId !== undefined ? userId : null;
      const safeImageUrl = imageUrl !== undefined ? imageUrl : null;

      const params = [
        recordId,
        safeUserId,
        safeImageUrl,
        confidence,
        wasteName,
        classificationReason,
        disposalMethod,
        aiModel,
        environmentalTip,
        currentTime, // 使用JavaScript生成的当前时间
        'image_recognition', // 默认识别类型
        'unknown', // 默认城市
        wasteType // 垃圾类型
      ];

      const result = await db.query(query, params);
      return {
        id: result.insertId,
        userId,
        imageUrl,
        wasteType,
        category,
        confidence,
        description,
        suggestion,
        wasteName,
        classificationReason,
        disposalMethod,
        aiModel,
        environmentalTip,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('创建识别记录失败:', error);
      // 添加更详细的错误信息，帮助调试
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        console.error(`外键约束错误：用户ID 不存在于users表中`);
      }
      throw error;
    }
  }

  /**
   * 获取用户的识别历史记录
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {number} [options.limit=10] - 记录数量
   * @param {number} [options.offset=0] - 偏移量
   * @param {string} [options.sortBy='recognized_at'] - 排序字段
   * @param {string} [options.sortOrder='DESC'] - 排序顺序
   * @returns {Promise<Array>} 识别历史记录列表
   */
  /**
   * 获取用户的识别记录
   * @param {string} userId - 用户ID
   * @param {object} options - 选项参数
   * @param {number} options.limit - 限制数量
   * @param {number} options.offset - 偏移量
   * @param {string} options.sortBy - 排序字段
   * @param {string} options.sortOrder - 排序顺序
   * @returns {Promise<Array>} 识别记录列表
   */
  async getUserRecords(userId, options = {}) {
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }
      
      const { limit = 10, offset = 0, sortBy = 'recognized_at', sortOrder = 'DESC' } = options;
      
      // 确保limit和offset是数字类型
      const numericLimit = parseInt(limit, 10) || 10;
      const numericOffset = parseInt(offset, 10) || 0;
      
      // 查询语句，将LIMIT和OFFSET直接拼接到SQL中以避免参数顺序问题
      const query = `
        SELECT 
          rr.id, 
          rr.user_id, 
          rr.image_url, 
          COALESCE(rr.waste_name, wi.name) AS waste_name, 
          rr.confidence, 
          rr.recognized_at, 
          COALESCE(wc.name, '未知') AS category_name,
          wc.id AS category_id
        FROM ${this.tableName} rr
        LEFT JOIN waste_items wi ON rr.waste_item_id = wi.id
        LEFT JOIN waste_categories wc ON wi.category_id = wc.id
        WHERE rr.user_id = ?
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT ${numericLimit} OFFSET ${numericOffset}
      `;
      
      // 执行查询，只传递userId参数
      const results = await db.query(query, [userId]);
      
      // 格式化返回数据，确保包含所需的字段
      return results.map(record => ({
        id: record.id,
        userId: record.user_id,
        imageUrl: record.image_url,
        name: record.waste_name || '未知垃圾', // 垃圾名称（优先使用直接存储的，否则从关联表获取）
        confidence: record.confidence || 0, // 识别置信度
        timestamp: record.recognized_at ? new Date(record.recognized_at).toISOString() : null, // 格式化识别时间为ISO 8601
        category: record.category_name || '未知', // 垃圾类别名称
        categoryId: record.category_id, // 垃圾类别ID
        // 保留向后兼容的字段名
        wasteType: record.waste_name || '未知垃圾',
        recognizedAt: record.recognized_at ? new Date(record.recognized_at).toISOString() : null // 格式化识别时间为ISO 8601
      }));
    } catch (error) {
      console.error('获取用户识别记录失败:', error);
      console.error('错误详情:', error.sqlMessage || error.message);
      console.error('错误代码:', error.code);
      console.error('SQL语句:', error.sql);
      throw error;
    }
  }

  /**
   * 获取用户识别记录总数
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 记录总数
   */
  async getUserRecordsCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) AS count FROM ${this.tableName}
        WHERE user_id = ?
      `;
      const params = [userId];
      const results = await db.query(query, params);
      
      return results[0].count;
    } catch (error) {
      console.error('获取用户识别记录总数失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个识别记录详情
   * @param {string} recordId - 记录ID
   * @param {string} userId - 用户ID
   * @returns {Promise<Object|null>} 识别记录详情或null
   */
  async getRecordById(recordId, userId) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE id = ? AND user_id = ?
      `;
      const params = [recordId, userId];
      const results = await db.query(query, params);
      
      if (results.length === 0) {
        return null;
      }
      
      const record = results[0];
      return {
        id: record.id,
        userId: record.user_id,
        imageUrl: record.image_url,
        wasteType: record.waste_type,
        category: record.category,
        confidence: record.confidence,
        description: record.description,
        suggestion: record.suggestion,
        createdAt: new Date(record.created_at)
      };
    } catch (error) {
      console.error('获取识别记录详情失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户的识别记录
   * @param {string} recordId - 记录ID
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteRecord(recordId, userId) {
    try {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE id = ? AND user_id = ?
      `;
      const params = [recordId, userId];
      const result = await db.query(query, params);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除识别记录失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除用户的识别记录
   * @param {Array<string>} recordIds - 记录ID数组
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 删除的记录数量
   */
  async deleteRecords(recordIds, userId) {
    try {
      if (!recordIds || recordIds.length === 0) {
        return 0;
      }
      
      // 构建IN子句
      const placeholders = recordIds.map(() => '?').join(',');
      const query = `
        DELETE FROM ${this.tableName}
        WHERE id IN (${placeholders}) AND user_id = ?
      `;
      
      // 合并参数
      const params = [...recordIds, userId];
      const result = await db.query(query, params);
      
      return result.affectedRows;
    } catch (error) {
      console.error('批量删除识别记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的垃圾类别统计信息
   * @param {string} userId - 用户ID
   * @param {number} [days=30] - 统计天数
   * @returns {Promise<Object>} 类别统计数据
   */
  async getUserCategoryStats(userId, days = 30) {
    try {
      const query = `
        SELECT category, COUNT(*) AS count
        FROM ${this.tableName}
        WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY category
        ORDER BY count DESC
      `;
      const params = [userId, days];
      const results = await db.query(query, params);
      
      const stats = {};
      results.forEach(row => {
        stats[row.category] = row.count;
      });
      
      return stats;
    } catch (error) {
      console.error('获取用户类别统计失败:', error);
      throw error;
    }
  }
}

module.exports = new RecognitionRecord();