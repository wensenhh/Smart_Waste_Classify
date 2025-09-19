// 垃圾识别控制器
const wasteRecognitionService = require('../services/wasteRecognitionService');
const recognitionRecordModel = require('../models/recognitionRecord');
const wasteCategoryModel = require('../models/wasteCategory');
const { deleteFile } = require('../utils/fileUpload');
const { getLocalizedString } = require('../middlewares/i18n');
const axios = require('axios');
const FormData = require('form-data'); // 用于处理文件上传

/**
 * 垃圾识别控制器
 * 处理垃圾识别相关的API请求
 */
class RecognitionController {
  /**
   * 上传垃圾图片并调用外部接口识别
   * @param {Object} ctx - Koa上下文对象
   */
  async upload(ctx) {
    try {
      console.log('收到文件上传请求');
      console.log('请求头:', ctx.request.headers);
      console.log('请求查询参数:', ctx.query);
      
      // 从请求中获取图像文件
      const file = ctx.request.file;
      const saveHistory = ctx.query.saveHistory === 'true' || false;
      
      if (!file) {
        console.error('没有收到文件');
        ctx.throw(400, getLocalizedString(ctx, 'recognition.imageRequired'));
      }
      
      console.log('文件信息:', { filename: file.originalname, mimetype: file.mimetype, size: file.size, fieldname: file.fieldname });
      console.log('文件存储位置:', file.path ? file.path : '内存中(buffer)');

      // 获取语言和用户ID
      const lang = ctx.query.lang || 'zh';
      const userId = ctx.state.user?.id || null;

      // 安全验证：防止滥用外部API
      // 1. 验证文件大小和类型（已在uploadMiddleware中处理）
      // 2. 记录请求信息用于审计
      const requestInfo = {
        timestamp: new Date(),
        userId: userId || 'anonymous',
        filename: file.originalname,
        filesize: file.size,
        ip: ctx.ip
      };
      console.log('接收到垃圾识别请求:', requestInfo);
      
      // 3. 调用外部垃圾识别接口
      const externalApiUrl = 'http://43.217.144.41:5000/classify';
      const formData = new FormData();
      formData.append('image', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      formData.append('lang', lang); // 添加语言参数到外部API请求中
      
      // 设置超时时间，防止请求长时间挂起
      let externalResult;
      try {
        const response = await axios.post(externalApiUrl, formData, {
          headers: formData.getHeaders(),
          timeout: 30000, // 30秒超时
          maxContentLength: 10 * 1024 * 1024, // 最大10MB
        });
        externalResult = response.data;
      } catch (axiosError) {
        console.error('外部API调用失败:', {
          status: axiosError.response?.status,
          message: axiosError.message,
          stack: axiosError.stack
        });
        throw new Error('外部识别服务暂时不可用，请稍后再试');
      }
      
      // 安全防范：验证外部API返回的数据结构
      if (!externalResult || typeof externalResult !== 'object') {
        throw new Error('外部API返回无效结果格式');
      }
      
      if (externalResult.error) {
        throw new Error(externalResult.message || '外部API识别失败');
      }
      
      // 4. 上传图片到本地存储
      let imageUrl;
      try {
        imageUrl = await wasteRecognitionService.uploadFile(file.buffer, file.originalname);
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        // 图片上传失败不影响识别结果返回，但记录错误
      }
      
      // 5. 构建识别结果，确保返回数据的一致性和安全性
      // 从外部接口返回的data.classification中提取数据
      const classification = externalResult.data?.classification || {};
      const apiInfo = externalResult.data?.api_info || {};
      
      const recognitionResult = {
        waste_name: classification.waste_name || '未知',
        category: classification.category || '',
        category_name: classification.category_name || '未知',
        classification_reason: classification.classification_reason || '无',
        disposal_advice: classification.disposal_advice || '无',
        environmental_tip: classification.environmental_tip || '无',
        confidence: Math.max(0, Math.min(1, classification.confidence || 0)), // 确保置信度在0-1之间
        method: apiInfo.method || 'unknown',
        model: apiInfo.model || 'unknown',
        version: apiInfo.version || 'unknown',
        imageUrl: imageUrl || null,
        timestamp: new Date()
      };
      
      // 6. 如果需要保存历史记录或有用户ID，保存识别记录到数据库
      if (saveHistory || userId) {
        try {
          await recognitionRecordModel.createRecord({
            userId,
            imageUrl,
            wasteType: recognitionResult.waste_name,
            category: recognitionResult.category_name,
            confidence: recognitionResult.confidence,
            description: recognitionResult.classification_reason,
            suggestion: recognitionResult.disposal_advice
          });
          console.log('识别记录已保存到数据库:', { userId, wasteName: recognitionResult.waste_name });
        } catch (dbError) {
          console.error('保存识别记录失败:', dbError);
          // 数据库保存失败不影响识别结果返回，但记录错误
        }
      }
      
      // 7. 记录成功的识别请求
      console.log('垃圾识别请求处理成功:', {
        userId: userId || 'anonymous',
        wasteName: recognitionResult.waste_name,
        confidence: recognitionResult.confidence
      });
      
      // 返回识别结果
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: recognitionResult,
        message: getLocalizedString(ctx, 'recognition.success')
      };
    } catch (error) {
      console.error('垃圾识别上传失败:', {
        message: error.message,
        stack: error.stack,
        userId: ctx.state.user?.id || 'anonymous'
      });
      ctx.status = error.status || 400;
      ctx.body = {
        success: false,
        message: error.message || getLocalizedString(ctx, 'recognition.error')
      };
    }
  }

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

      // 获取该类别下的所有垃圾项
      const wasteItems = wasteRecognitionService.getWasteItemsByCategory(categoryId, lang);

      // 直接返回垃圾列表数组作为data
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: wasteItems,
        message: getLocalizedString(ctx, 'recognition.categoryFetched')
      };
    } catch (error) {
      console.error('获取垃圾类别详情失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.categoryError'));
    }
  }

  /**
   * 获取单个垃圾详情
   * @param {Object} ctx - Koa上下文对象
   */
  async getWasteItemDetail(ctx) {
    try {
      const { wasteItemId } = ctx.params;
      const lang = ctx.query.lang || 'zh';

      // 获取垃圾详情信息
      const wasteItem = wasteRecognitionService.getWasteInfo(wasteItemId, lang);

      if (!wasteItem) {
        ctx.throw(404, getLocalizedString(ctx, 'recognition.wasteItemNotFound'));
      }

      // 返回垃圾详情
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: wasteItem,
        message: getLocalizedString(ctx, 'recognition.wasteItemFetched')
      };
    } catch (error) {
      console.error('获取垃圾详情失败:', error);
      ctx.throw(400, error.message || getLocalizedString(ctx, 'recognition.wasteItemError'));
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