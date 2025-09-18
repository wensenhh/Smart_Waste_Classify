// 垃圾识别控制器
const wasteRecognitionService = require('../services/wasteRecognitionService');
const recognitionRecordModel = require('../models/recognitionRecord');
const wasteCategoryModel = require('../models/wasteCategory');
const { deleteFile } = require('../utils/fileUpload');
const { getLocalizedString } = require('../middlewares/i18n');

/**
 * 垃圾识别控制器
 * 处理垃圾识别相关的API请求
 */
class RecognitionController {
  /**
   * 识别垃圾
   * @param {Object} ctx - Koa上下文对象
   */
  async recognizeWaste(ctx) {
    try {
      // 从请求中获取图像文件
      const file = ctx.request.file;
      if (!file) {
        ctx.throw(400, getLocalizedString(ctx, 'recognition.imageRequired'));
      }

      // 获取语言和用户ID
      const lang = ctx.query.lang || 'zh';
      const userId = ctx.state.user?.id || null;

      // 处理垃圾识别请求
      const result = await wasteRecognitionService.processRecognitionRequest({
        imageBuffer: file.buffer,
        imageName: file.originalname,
        userId,
        lang
      });

      // 返回识别结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result,
        message: getLocalizedString(ctx, 'recognition.success')
      };
    } catch (error) {
      console.error('垃圾识别失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.error'));
    }
  }

  /**
   * 搜索垃圾信息
   * @param {Object} ctx - Koa上下文对象
   */
  async searchWaste(ctx) {
    try {
      const { keyword } = ctx.query;
      const lang = ctx.query.lang || 'zh';

      if (!keyword || keyword.trim() === '') {
        ctx.throw(400, getLocalizedString(ctx, 'recognition.keywordRequired'));
      }

      // 搜索垃圾信息
      const results = await wasteRecognitionService.searchWasteInfo(keyword, lang);

      // 返回搜索结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: results,
        total: results.length,
        message: getLocalizedString(ctx, 'recognition.searchSuccess')
      };
    } catch (error) {
      console.error('搜索垃圾信息失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.searchError'));
    }
  }

  /**
   * 获取所有垃圾类别
   * @param {Object} ctx - Koa上下文对象
   */
  async getCategories(ctx) {
    try {
      const lang = ctx.query.lang || 'zh';
      
      // 获取本地化的垃圾类别
      const categories = wasteCategoryModel.getLocalizedCategories(lang);

      // 返回垃圾类别列表
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: categories,
        message: getLocalizedString(ctx, 'recognition.categoriesFetched')
      };
    } catch (error) {
      console.error('获取垃圾类别失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.categoriesError'));
    }
  }

  /**
   * 获取单个垃圾类别详情
   * @param {Object} ctx - Koa上下文对象
   */
  async getCategoryDetail(ctx) {
    try {
      const { categoryId } = ctx.params;
      const lang = ctx.query.lang || 'zh';

      // 获取本地化的垃圾类别
      const category = wasteCategoryModel.getLocalizedCategory(categoryId, lang);

      if (!category) {
        ctx.throw(404, getLocalizedString(ctx, 'recognition.categoryNotFound'));
      }

      // 返回垃圾类别详情
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: category,
        message: getLocalizedString(ctx, 'recognition.categoryFetched')
      };
    } catch (error) {
      console.error('获取垃圾类别详情失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.categoryError'));
    }
  }

  /**
   * 获取用户的垃圾识别历史
   * @param {Object} ctx - Koa上下文对象
   */
  async getUserRecognitionHistory(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, sortBy = 'recognized_at', sortOrder = 'DESC' } = ctx.query;
      const lang = ctx.query.lang || 'zh';

      // 获取用户识别历史
      const result = await wasteRecognitionService.getUserRecognitionHistory(userId, {
        lang,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sortBy,
        sortOrder
      });

      // 返回识别历史
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result.records,
        pagination: result.pagination,
        message: getLocalizedString(ctx, 'recognition.historyFetched')
      };
    } catch (error) {
      console.error('获取用户识别历史失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.historyError'));
    }
  }

  /**
   * 获取单个识别记录详情
   * @param {Object} ctx - Koa上下文对象
   */
  async getRecognitionRecord(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { recordId } = ctx.params;
      const lang = ctx.query.lang || 'zh';

      // 获取记录详情
      const record = await recognitionRecordModel.getRecordById(recordId, userId);

      if (!record) {
        ctx.throw(404, getLocalizedString(ctx, 'recognition.recordNotFound'));
      }

      // 本地化记录信息
      const categoryInfo = wasteCategoryModel.getLocalizedCategory(record.category, lang);
      const localizedRecord = {
        ...record,
        categoryName: categoryInfo?.name,
        categoryIcon: categoryInfo?.icon,
        categoryColor: categoryInfo?.color
      };

      // 返回记录详情
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: localizedRecord,
        message: getLocalizedString(ctx, 'recognition.recordFetched')
      };
    } catch (error) {
      console.error('获取识别记录详情失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.recordError'));
    }
  }

  /**
   * 删除单个识别记录
   * @param {Object} ctx - Koa上下文对象
   */
  async deleteRecognitionRecord(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { recordId } = ctx.params;

      // 获取记录信息以获取图片URL
      const record = await recognitionRecordModel.getRecordById(recordId, userId);
      if (!record) {
        ctx.throw(404, getLocalizedString(ctx, 'recognition.recordNotFound'));
      }

      // 删除识别记录
      const deleteResult = await wasteRecognitionService.deleteUserRecognitionRecords(userId, recordId);

      if (!deleteResult.success) {
        ctx.throw(400, getLocalizedString(ctx, 'recognition.deleteFailed'));
      }

      // 可选：删除相关图片
      if (record.imageUrl) {
        try {
          await deleteFile(record.imageUrl);
        } catch (error) {
          console.warn('删除图片文件失败，但记录已删除:', error);
        }
      }

      // 返回删除结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: getLocalizedString(ctx, 'recognition.deleteSuccess')
      };
    } catch (error) {
      console.error('删除识别记录失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.deleteError'));
    }
  }

  /**
   * 批量删除识别记录
   * @param {Object} ctx - Koa上下文对象
   */
  async batchDeleteRecognitionRecords(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { recordIds } = ctx.request.body;

      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        ctx.throw(400, getLocalizedString(ctx, 'recognition.invalidRecordIds'));
      }

      // 获取所有要删除的记录以获取图片URL
      const records = [];
      for (const recordId of recordIds) {
        const record = await recognitionRecordModel.getRecordById(recordId, userId);
        if (record) {
          records.push(record);
        }
      }

      // 批量删除识别记录
      const deleteResult = await wasteRecognitionService.deleteUserRecognitionRecords(userId, recordIds);

      // 可选：删除相关图片
      for (const record of records) {
        if (record.imageUrl) {
          try {
            await deleteFile(record.imageUrl);
          } catch (error) {
            console.warn('删除图片文件失败:', error);
          }
        }
      }

      // 返回删除结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        deletedCount: deleteResult.deletedCount,
        message: getLocalizedString(ctx, 'recognition.batchDeleteSuccess')
      };
    } catch (error) {
      console.error('批量删除识别记录失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.batchDeleteError'));
    }
  }

  /**
   * 获取用户垃圾类别统计
   * @param {Object} ctx - Koa上下文对象
   */
  async getUserCategoryStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { days = 30 } = ctx.query;
      const lang = ctx.query.lang || 'zh';

      // 获取用户垃圾类别统计
      const stats = await wasteRecognitionService.getUserCategoryStatistics(userId, {
        days: parseInt(days),
        lang
      });

      // 返回统计结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: stats,
        message: getLocalizedString(ctx, 'recognition.statsFetched')
      };
    } catch (error) {
      console.error('获取用户垃圾类别统计失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.statsError'));
    }
  }

  /**
   * 获取所有用户的识别记录（管理员）
   * @param {Object} ctx - Koa上下文对象
   */
  async getAllRecognitionRecords(ctx) {
    try {
      // 只有管理员可以访问此接口
      if (!ctx.state.user.isAdmin) {
        ctx.throw(403, getLocalizedString(ctx, 'security.notAuthorized'));
      }

      const { userId, startDate, endDate, category, page = 1, pageSize = 20 } = ctx.query;
      
      // 构建查询参数
      const queryParams = {};
      if (userId) queryParams.userId = userId;
      if (category) queryParams.category = category;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      
      // 实际项目中应实现此功能
      // 这里仅返回模拟数据
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: 0
        },
        message: getLocalizedString(ctx, 'recognition.adminRecordsFetched')
      };
    } catch (error) {
      console.error('获取所有用户识别记录失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.adminRecordsError'));
    }
  }

  /**
   * 删除用户的所有识别记录（管理员）
   * @param {Object} ctx - Koa上下文对象
   */
  async deleteUserAllRecords(ctx) {
    try {
      // 只有管理员可以访问此接口
      if (!ctx.state.user.isAdmin) {
        ctx.throw(403, getLocalizedString(ctx, 'security.notAuthorized'));
      }

      const { userId } = ctx.params;
      
      // 实际项目中应实现此功能
      // 这里仅返回模拟数据
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: getLocalizedString(ctx, 'recognition.adminDeleteSuccess')
      };
    } catch (error) {
      console.error('删除用户所有识别记录失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.adminDeleteError'));
    }
  }

  /**
   * 获取系统识别统计（管理员）
   * @param {Object} ctx - Koa上下文对象
   */
  async getSystemRecognitionStats(ctx) {
    try {
      // 只有管理员可以访问此接口
      if (!ctx.state.user.isAdmin) {
        ctx.throw(403, getLocalizedString(ctx, 'security.notAuthorized'));
      }

      const { startDate, endDate } = ctx.query;
      
      // 实际项目中应实现此功能
      // 这里仅返回模拟数据
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          totalRecognitions: 0,
          dailyAverage: 0,
          categoryDistribution: {},
          peakHours: []
        },
        message: getLocalizedString(ctx, 'recognition.systemStatsFetched')
      };
    } catch (error) {
      console.error('获取系统识别统计失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.systemStatsError'));
    }
  }
}

module.exports = new RecognitionController();