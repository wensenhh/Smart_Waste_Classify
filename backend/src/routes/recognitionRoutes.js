// 垃圾识别路由
const Router = require('@koa/router');
const recognitionController = require('../controllers/recognitionController');
const { jwtAuth, authorize } = require('../middlewares/security');
const { uploadMiddleware } = require('../middlewares/upload');
const { validateRequest } = require('../middlewares/validation');

const router = new Router();

/**
 * 垃圾识别相关路由
 */

// 公开路由 - 无需身份验证
router.post('/identify', 
  uploadMiddleware.single('file'),
  validateRequest({ 
    file: 'required|file'
  }),
  recognitionController.recognizeWaste
);

// 受保护路由 - 需要登录才能上传图片并调用外部接口识别
router.post('/upload', 
  jwtAuth,
  uploadMiddleware.single('image'),
  validateRequest({ 
    image: 'required|file'
  }),
  recognitionController.upload
);

// 公开路由 - 搜索垃圾信息
router.get('/search', 
  validateRequest({ 
    keyword: 'required|string'
  }),
  recognitionController.searchWaste
);

// 公开路由 - 获取垃圾类别
router.get('/categories', 
  recognitionController.getCategories
);

// 公开路由 - 获取单个垃圾类别详情
router.get('/categories/:categoryId', 
  validateRequest({ 
    categoryId: 'required|string'
  }),
  recognitionController.getCategoryDetail
);

// 公开路由 - 获取单个垃圾详情
router.get('/items/:wasteItemId', 
  validateRequest({ 
    wasteItemId: 'required|string'
  }),
  recognitionController.getWasteItemDetail
);

// 身份验证路由 - 使用Koa的jwtAuth中间件
router.use(jwtAuth);

// 用户识别历史
router.get('/history', 
  validateRequest({ 
    page: 'number|min:1',
    limit: 'number|min:1|max:100'
  }),
  recognitionController.getUserRecognitionHistory
);

// 获取单个识别记录详情
router.get('/history/:recordId', 
  validateRequest({ 
    recordId: 'required|string'
  }),
  recognitionController.getRecognitionRecord
);

// 删除单个识别记录
router.delete('/history/:recordId', 
  validateRequest({ 
    recordId: 'required|string'
  }),
  recognitionController.deleteRecognitionRecord
);

// 批量删除识别记录
router.post('/history/batch-delete', 
  validateRequest({ 
    record_ids: 'required|array'
  }),
  recognitionController.batchDeleteRecognitionRecords
);

// 获取用户垃圾类别统计
router.get('/stats', 
  recognitionController.getUserCategoryStats
);

// 管理员路由 - 使用authorize中间件并指定admin角色
router.use(authorize('admin'));

// 获取所有用户的识别记录（管理员）
router.get('/admin/records', 
  validateRequest({ 
    page: 'number|min:1',
    limit: 'number|min:1|max:100'
  }),
  recognitionController.getAllRecognitionRecords
);

// 删除用户的识别记录（管理员）
router.delete('/admin/users/:userId/records/:recordId', 
  validateRequest({ 
    userId: 'required|string',
    recordId: 'required|string'
  }),
  recognitionController.deleteUserAllRecords
);

// 获取系统统计数据（管理员）
router.get('/admin/system-stats', 
  recognitionController.getSystemRecognitionStats
);

module.exports = router;