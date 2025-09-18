// 垃圾识别服务
const fs = require('fs').promises;
const path = require('path');
const wasteCategoryModel = require('../models/wasteCategory');
const recognitionRecordModel = require('../models/recognitionRecord');
const { uploadFile } = require('../utils/fileUpload');
const { getLocalizedString } = require('../middlewares/i18n');

/**
 * 垃圾识别服务
 * 提供垃圾图像识别、类别判断、处理建议等功能
 */
class WasteRecognitionService {
  constructor() {
    // 模拟的垃圾识别数据库，实际项目中可能连接到AI模型或更复杂的数据库
    this.wasteDatabase = {
      // 可回收物
      'plastic_bottle': {
        name: { zh: '塑料瓶', en: 'Plastic Bottle' },
        category: 'recyclable',
        description: {
          zh: '塑料瓶属于可回收物，请投入蓝色垃圾桶。',
          en: 'Plastic bottles are recyclable, please put them in the blue trash can.'
        },
        suggestion: {
          zh: '建议先冲洗干净，取下瓶盖，压扁后投放。',
          en: 'It is recommended to rinse, remove the cap, flatten before disposal.'
        }
      },
      'paper_box': {
        name: { zh: '纸箱', en: 'Paper Box' },
        category: 'recyclable',
        description: {
          zh: '纸箱属于可回收物，请投入蓝色垃圾桶。',
          en: 'Paper boxes are recyclable, please put them in the blue trash can.'
        },
        suggestion: {
          zh: '建议拆解平整后投放，避免占用过多空间。',
          en: 'It is recommended to disassemble and flatten before disposal to save space.'
        }
      },
      'aluminum_can': {
        name: { zh: '铝罐', en: 'Aluminum Can' },
        category: 'recyclable',
        description: {
          zh: '铝罐属于可回收物，请投入蓝色垃圾桶。',
          en: 'Aluminum cans are recyclable, please put them in the blue trash can.'
        },
        suggestion: {
          zh: '建议冲洗干净，压扁后投放。',
          en: 'It is recommended to rinse and flatten before disposal.'
        }
      },
      // 厨余垃圾
      'fruit_peel': {
        name: { zh: '果皮', en: 'Fruit Peel' },
        category: 'kitchen',
        description: {
          zh: '果皮属于厨余垃圾，请投入绿色垃圾桶。',
          en: 'Fruit peels are kitchen waste, please put them in the green trash can.'
        },
        suggestion: {
          zh: '建议沥干水分后投放，有助于后续处理。',
          en: 'It is recommended to drain water before disposal to facilitate subsequent processing.'
        }
      },
      'vegetable_scraps': {
        name: { zh: '蔬菜残渣', en: 'Vegetable Scraps' },
        category: 'kitchen',
        description: {
          zh: '蔬菜残渣属于厨余垃圾，请投入绿色垃圾桶。',
          en: 'Vegetable scraps are kitchen waste, please put them in the green trash can.'
        },
        suggestion: {
          zh: '建议沥干水分后投放，有助于后续处理。',
          en: 'It is recommended to drain water before disposal to facilitate subsequent processing.'
        }
      },
      // 有害垃圾
      'battery': {
        name: { zh: '电池', en: 'Battery' },
        category: 'hazardous',
        description: {
          zh: '电池属于有害垃圾，请投入红色垃圾桶或专门的电池回收箱。',
          en: 'Batteries are hazardous waste, please put them in the red trash can or special battery recycling bin.'
        },
        suggestion: {
          zh: '请勿随意丢弃，可能会对环境造成严重污染。',
          en: 'Do not discard at will, it may cause serious environmental pollution.'
        }
      },
      'light_bulb': {
        name: { zh: '灯泡', en: 'Light Bulb' },
        category: 'hazardous',
        description: {
          zh: '灯泡属于有害垃圾，请投入红色垃圾桶或专门的回收点。',
          en: 'Light bulbs are hazardous waste, please put them in the red trash can or special recycling point.'
        },
        suggestion: {
          zh: '请注意轻拿轻放，避免破碎。',
          en: 'Please handle with care to avoid breakage.'
        }
      },
      // 其他垃圾
      'tissue': {
        name: { zh: '纸巾', en: 'Tissue' },
        category: 'other',
        description: {
          zh: '纸巾属于其他垃圾，请投入灰色垃圾桶。',
          en: 'Tissues are other waste, please put them in the gray trash can.'
        },
        suggestion: {
          zh: '纸巾难以回收利用，建议作为其他垃圾处理。',
          en: 'Tissues are difficult to recycle, it is recommended to treat them as other waste.'
        }
      },
      'ceramic': {
        name: { zh: '陶瓷碎片', en: 'Ceramic Fragments' },
        category: 'other',
        description: {
          zh: '陶瓷碎片属于其他垃圾，请投入灰色垃圾桶。',
          en: 'Ceramic fragments are other waste, please put them in the gray trash can.'
        },
        suggestion: {
          zh: '请注意包装好，避免划伤他人。',
          en: 'Please wrap well to avoid scratching others.'
        }
      }
    };
  }

  /**
   * 识别垃圾类型（模拟AI识别）
   * 在实际项目中，这里会调用真实的AI模型进行图像识别
   * @param {Buffer} imageBuffer - 图像数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeWasteType(imageBuffer) {
    try {
      // 模拟AI识别过程，实际项目中应替换为真实的AI模型调用
      // 这里为了演示，随机返回一个垃圾类型
      const wasteTypes = Object.keys(this.wasteDatabase);
      const randomIndex = Math.floor(Math.random() * wasteTypes.length);
      const wasteTypeId = wasteTypes[randomIndex];
      
      // 模拟识别置信度（80%-99%之间）
      const confidence = 80 + Math.random() * 19;
      
      return {
        wasteTypeId,
        confidence: Math.round(confidence * 100) / 100 // 保留两位小数
      };
    } catch (error) {
      console.error('垃圾识别失败:', error);
      throw new Error('识别过程中发生错误');
    }
  }

  /**
   * 获取垃圾信息
   * @param {string} wasteTypeId - 垃圾类型ID
   * @param {string} lang - 语言代码
   * @returns {Object|null} 垃圾信息
   */
  getWasteInfo(wasteTypeId, lang = 'zh') {
    const wasteInfo = this.wasteDatabase[wasteTypeId];
    if (!wasteInfo) {
      return null;
    }

    const categoryInfo = wasteCategoryModel.getLocalizedCategory(wasteInfo.category, lang);
    
    return {
      id: wasteTypeId,
      name: wasteInfo.name[lang] || wasteInfo.name.zh,
      category: wasteInfo.category,
      categoryName: categoryInfo?.name,
      categoryIcon: categoryInfo?.icon,
      categoryColor: categoryInfo?.color,
      description: wasteInfo.description[lang] || wasteInfo.description.zh,
      suggestion: wasteInfo.suggestion[lang] || wasteInfo.suggestion.zh
    };
  }

  /**
   * 处理垃圾识别请求
   * @param {Object} requestData - 请求数据
   * @param {Buffer} requestData.imageBuffer - 图像数据
   * @param {string} [requestData.imageName] - 图像名称
   * @param {string} [requestData.userId] - 用户ID（可选）
   * @param {string} [requestData.lang] - 语言代码
   * @returns {Promise<Object>} 完整的识别结果
   */
  async processRecognitionRequest(requestData) {
    try {
      const { imageBuffer, imageName, userId, lang = 'zh' } = requestData;
      
      // 1. 上传图片
      const imageUrl = await uploadFile(imageBuffer, imageName);
      
      // 2. 识别垃圾类型
      const recognitionResult = await this.recognizeWasteType(imageBuffer);
      
      // 3. 获取垃圾详细信息
      const wasteInfo = this.getWasteInfo(recognitionResult.wasteTypeId, lang);
      
      if (!wasteInfo) {
        throw new Error('无法识别的垃圾类型');
      }
      
      // 4. 构建完整结果
      const fullResult = {
        ...recognitionResult,
        ...wasteInfo,
        imageUrl,
        timestamp: new Date()
      };
      
      // 5. 如果有用户ID，保存识别记录
      if (userId) {
        await recognitionRecordModel.createRecord({
          userId,
          imageUrl,
          wasteType: wasteInfo.name,
          category: wasteInfo.category,
          confidence: recognitionResult.confidence,
          description: wasteInfo.description,
          suggestion: wasteInfo.suggestion
        });
      }
      
      return fullResult;
    } catch (error) {
      console.error('处理垃圾识别请求失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的垃圾识别历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {string} [options.lang] - 语言代码
   * @returns {Promise<Object>} 分页的历史记录
   */
  async getUserRecognitionHistory(userId, options = {}) {
    try {
      const { lang = 'zh', page = 1, pageSize = 10, sortBy = 'recognized_at', sortOrder = 'DESC' } = options;
      
      const offset = (page - 1) * pageSize;
      
      // 获取记录列表
      const records = await recognitionRecordModel.getUserRecords(userId, {
        limit: pageSize,
        offset,
        sortBy,
        sortOrder
      });
      
      // 获取记录总数
      const totalCount = await recognitionRecordModel.getUserRecordsCount(userId);
      
      // 本地化记录信息
      const localizedRecords = records.map(record => {
        const categoryInfo = wasteCategoryModel.getLocalizedCategory(record.category, lang);
        return {
          ...record,
          categoryName: categoryInfo?.name,
          categoryIcon: categoryInfo?.icon,
          categoryColor: categoryInfo?.color
        };
      });
      
      return {
        records: localizedRecords,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error) {
      console.error('获取用户识别历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的垃圾类别统计
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {number} [options.days=30] - 统计天数
   * @param {string} [options.lang] - 语言代码
   * @returns {Promise<Object>} 类别统计数据
   */
  async getUserCategoryStatistics(userId, options = {}) {
    try {
      const { days = 30, lang = 'zh' } = options;
      
      const stats = await recognitionRecordModel.getUserCategoryStats(userId, days);
      
      // 本地化统计信息
      const localizedStats = {};
      for (const [categoryId, count] of Object.entries(stats)) {
        const categoryInfo = wasteCategoryModel.getLocalizedCategory(categoryId, lang);
        if (categoryInfo) {
          localizedStats[categoryId] = {
            count,
            name: categoryInfo.name,
            icon: categoryInfo.icon,
            color: categoryInfo.color
          };
        }
      }
      
      return localizedStats;
    } catch (error) {
      console.error('获取用户类别统计失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户的识别记录
   * @param {string} userId - 用户ID
   * @param {string|Array<string>} recordIds - 记录ID或ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUserRecognitionRecords(userId, recordIds) {
    try {
      let deletedCount = 0;
      
      if (Array.isArray(recordIds)) {
        // 批量删除
        deletedCount = await recognitionRecordModel.deleteRecords(recordIds, userId);
      } else {
        // 单个删除
        const success = await recognitionRecordModel.deleteRecord(recordIds, userId);
        deletedCount = success ? 1 : 0;
      }
      
      return {
        success: deletedCount > 0,
        deletedCount
      };
    } catch (error) {
      console.error('删除用户识别记录失败:', error);
      throw error;
    }
  }

  /**
   * 搜索垃圾信息
   * @param {string} keyword - 搜索关键词
   * @param {string} [lang='zh'] - 语言代码
   * @returns {Promise<Array>} 搜索结果
   */
  async searchWasteInfo(keyword, lang = 'zh') {
    try {
      const results = [];
      
      if (!keyword || keyword.trim() === '') {
        return results;
      }
      
      const searchLower = keyword.toLowerCase().trim();
      
      // 在垃圾数据库中搜索
      for (const [wasteTypeId, wasteInfo] of Object.entries(this.wasteDatabase)) {
        const nameLower = wasteInfo.name[lang]?.toLowerCase() || '';
        const descriptionLower = wasteInfo.description[lang]?.toLowerCase() || '';
        
        // 检查关键词是否在名称或描述中
        if (nameLower.includes(searchLower) || descriptionLower.includes(searchLower)) {
          results.push(this.getWasteInfo(wasteTypeId, lang));
        }
      }
      
      return results;
    } catch (error) {
      console.error('搜索垃圾信息失败:', error);
      throw error;
    }
  }
}

module.exports = new WasteRecognitionService();