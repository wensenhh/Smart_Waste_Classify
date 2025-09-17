// 用户路由
const Router = require('koa-router');
const router = new Router();
const userController = require('../controllers/userController');
const { jwtAuth, authorize, validateInput } = require('../middlewares/security');

/**
 * 用户路由定义
 */
router
  // 公开路由 - 无需身份验证
  .post('/register', userController.register)
  .post('/login', userController.login)
  .post('/logout', userController.logout)
  .post('/forgot-password', userController.forgotPassword)
  .post('/reset-password', userController.resetPassword)
  
  // 需要身份验证的路由
  .use(jwtAuth())
  
  // 用户信息相关
  .get('/profile', userController.getProfile)
  .put('/profile', userController.updateProfile)
  .put('/password', userController.updatePassword)
  .post('/avatar', userController.uploadAvatar)
  .delete('/avatar', userController.deleteAvatar)
  
  // 用户收藏
  .get('/favorites', userController.getFavorites)
  .post('/favorites/:itemId', userController.addFavorite)
  .delete('/favorites/:itemId', userController.removeFavorite)
  
  // 用户历史记录
  .get('/history/recognition', userController.getRecognitionHistory)
  .delete('/history/recognition/:recordId', userController.deleteRecognitionRecord)
  .get('/history/quiz', userController.getQuizHistory)
  
  // 管理员路由 - 需要管理员权限
  .use(authorize('admin'))
  .get('/', userController.getAllUsers)
  .get('/:id', userController.getUserById)
  .put('/:id/role', userController.updateUserRole)
  .delete('/:id', userController.deleteUser)
  .put('/:id/status', userController.updateUserStatus);

/**
 * 导出用户路由
 */
module.exports = router;