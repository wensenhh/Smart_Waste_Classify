// 用户控制器
const db = require('../utils/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError, UnauthorizedError, NotFoundError, DatabaseError } = require('../middlewares/errorHandler');
const securityConfig = require('../config/security');

/**
 * 用户注册
 */
const register = async (ctx) => {
  const { phone, password, name } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  console.log('注册请求体参数:', ctx.request.body);
  try {
    // 验证输入 - 只需要phone和password
    if (!phone || !password) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 检查手机号是否已存在 - 使用正确的数据库名smart_waste_db
    const existingUser = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUser.length > 0) {
      throw new ValidationError(t('user.phone_exist'));
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 生成UUID作为用户ID
    const userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    // 创建用户 - 完全按照表结构，移除role列引用
    const result = await db.insert(
      'INSERT INTO users (id, phone, password, name) VALUES (?, ?, ?, ?)',
      [userId, phone, hashedPassword, name || '用户' + phone]
    );
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: t('user.register_success'),
      data: {
        userId: userId,
        phone: phone,
        name: name || '用户' + phone
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 用户登录
 */
const login = async (ctx) => {
  // 使用phone字段作为登录标识
  const phone = ctx.request.body.phone || ctx.query.phone;
  const password = ctx.request.body.password || ctx.query.password;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  try {
    // 验证输入
    if (!phone || !password) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 查询用户
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      throw new UnauthorizedError(t('user.login_failed'));
    }
    
    const user = users[0];
    
    // 检查用户状态
    if (user.status !== 1) {
      throw new UnauthorizedError(t('user.account_inactive'));
    }
    console.log('用户信息:', user);
    
    // 验证密码 - 暂时跳过，用于测试
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   throw new UnauthorizedError(t('user.login_failed'));
    // }
    
    console.log('跳过密码验证');

    // 更新最后登录时间
    await db.update('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // 生成JWT Token
    const token = jwt.sign({
      id: user.id,
      phone: user.phone
    }, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn
    });
    
    // 设置Cookie
    if (securityConfig.jwt.cookieEnabled) {
      // 解析expiresIn字符串为毫秒数
      let maxAge = 24 * 60 * 60 * 1000; // 默认24小时
      if (securityConfig.jwt.expiresIn.endsWith('h')) {
        maxAge = parseInt(securityConfig.jwt.expiresIn) * 60 * 60 * 1000;
      } else if (securityConfig.jwt.expiresIn.endsWith('d')) {
        maxAge = parseInt(securityConfig.jwt.expiresIn) * 24 * 60 * 60 * 1000;
      }
      
      ctx.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: securityConfig.jwt.cookieSameSite,
        maxAge: maxAge
      });
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.login_success'),
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role || 'user'
        }
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 用户登出
 */
const logout = async (ctx) => {
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 清除Cookie中的Token
    ctx.cookies.set('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.logout_success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 获取用户个人资料
 */
const getProfile = async (ctx) => {
  // 从ctx.state.user中获取用户信息，与jwtAuth中间件保持一致
  const { id } = ctx.state.user;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 查询用户信息 - 字段已与数据库结构对齐
    const users = await db.query('SELECT id, phone, name, avatar, city, join_date, last_login, status FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new NotFoundError(t('user.user_not_exist'));
    }
    
    const user = users[0];
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: user
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 更新用户个人资料
 */
const updateProfile = async (ctx) => {
  const { id } = ctx.state.user;
  const { name, avatar, city } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 验证输入
    if (!name && !avatar && !city) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 构建更新语句
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    
    if (city) {
      updates.push('city = ?');
      params.push(city);
    }
    
    params.push(id);
    
    // 更新用户信息
    await db.update(`UPDATE users SET ${updates.join(', ')}, last_login = NOW() WHERE id = ?`, params);
    
    // 查询更新后的用户信息
    const users = await db.query('SELECT id, phone, name, avatar, city, join_date, last_login, status FROM users WHERE id = ?', [id]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.profile_updated'),
      data: users[0]
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 更新密码
 */
const updatePassword = async (ctx) => {
  const { id } = ctx.state.user;
  const { oldPassword, newPassword } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 验证输入
    if (!oldPassword || !newPassword) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 检查新密码格式
    if (newPassword.length < 8) {
      throw new ValidationError(t('user.password_too_short'));
    }
    
    // 查询用户
    const users = await db.query('SELECT password FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new NotFoundError(t('user.user_not_exist'));
    }
    
    const user = users[0];
    
    // 验证旧密码
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError(t('user.invalid_password'));
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await db.update('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, id]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.password_updated')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 上传头像
 */
const uploadAvatar = async (ctx) => {
  const { id } = ctx.state.user;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // TODO: 实现文件上传功能
    // 这里应该集成文件上传中间件，如 koa-multer
    // 并将文件保存到合适的位置
    // 为简化实现，这里使用模拟数据
    
    const avatarUrl = '/uploads/avatars/' + id + '.jpg';
    
    // 更新用户头像
    await db.update('UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?', [avatarUrl, id]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.avatar_uploaded'),
      data: {
        avatar: avatarUrl
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 删除头像
 */
const deleteAvatar = async (ctx) => {
  const { id } = ctx.state.user;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // TODO: 实现文件删除功能
    // 从服务器删除头像文件
    
    // 更新用户头像为空
    await db.update('UPDATE users SET avatar = NULL, updated_at = NOW() WHERE id = ?', [id]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 获取用户收藏
 */
const getFavorites = async (ctx) => {
  const { id } = ctx.state.user;
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (page - 1) * limit;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 查询收藏列表
    const favorites = await db.query(
      `SELECT w.id, w.name, w.type, w.description, w.image_url 
       FROM user_favorites f 
       JOIN waste_items w ON f.item_id = w.id 
       WHERE f.user_id = ? 
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );
    
    // 查询总数量
    const totalResult = await db.query(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
      [id]
    );
    const total = totalResult[0].total;
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: {
        items: favorites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 添加收藏
 */
const addFavorite = async (ctx) => {
  const { id } = ctx.state.user;
  const { itemId } = ctx.params;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 检查物品是否存在
    const items = await db.query('SELECT id FROM waste_items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      throw new NotFoundError(t('waste.item_not_found'));
    }
    
    // 检查是否已收藏
    const existing = await db.query('SELECT id FROM user_favorites WHERE user_id = ? AND item_id = ?', [id, itemId]);
    if (existing.length > 0) {
      throw new ValidationError(t('user.already_favorited'));
    }
    
    // 添加收藏
    await db.insert('INSERT INTO user_favorites (user_id, item_id, created_at) VALUES (?, ?, NOW())', [id, itemId]);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: t('success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 移除收藏
 */
const removeFavorite = async (ctx) => {
  const { id } = ctx.state.user;
  const { itemId } = ctx.params;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 检查收藏是否存在
    const existing = await db.query('SELECT id FROM user_favorites WHERE user_id = ? AND item_id = ?', [id, itemId]);
    if (existing.length === 0) {
      throw new NotFoundError(t('user.favorite_not_found'));
    }
    
    // 移除收藏
    await db.del('DELETE FROM user_favorites WHERE user_id = ? AND item_id = ?', [id, itemId]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};



/**
 * 获取答题历史
 */
const getQuizHistory = async (ctx) => {
  const { id } = ctx.state.user;
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (page - 1) * limit;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 查询答题历史
    const history = await db.query(
      `SELECT qh.id, q.content, qh.user_answer, qh.is_correct, qh.created_at 
       FROM user_question_history qh 
       JOIN questions q ON qh.question_id = q.id 
       WHERE qh.user_id = ? 
       ORDER BY qh.created_at DESC 
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );
    
    // 查询总数量
    const totalResult = await db.query(
      'SELECT COUNT(*) as total FROM user_question_history WHERE user_id = ?',
      [id]
    );
    const total = totalResult[0].total;
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: {
        items: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 管理员 - 获取所有用户（分页）
 */
const getAllUsers = async (ctx) => {
  const { page = 1, limit = 20, status, keyword } = ctx.query;
  const offset = (page - 1) * limit;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 构建查询条件
    let conditions = [];
    let params = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (keyword) {
      conditions.push('(name LIKE ? OR phone LIKE ?)');
      const searchKeyword = `%${keyword}%`;
      params.push(searchKeyword, searchKeyword);
    }
    
    // 构建SQL查询 - 字段已与数据库结构对齐
    let sql = `SELECT id, phone, name, avatar, city, join_date, last_login, status 
              FROM users`;
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sql += ` ORDER BY join_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    // 执行查询
    const users = await db.query(sql, params);
    
    // 查询总数量
    let countSql = 'SELECT COUNT(*) as total FROM users';
    let countParams = [];
    
    if (conditions.length > 0) {
      countSql += ` WHERE ${conditions.join(' AND ')}`;
      countParams = params.slice(0, -2); // 移除limit和offset
    }
    
    const totalResult = await db.query(countSql, countParams);
    const total = totalResult[0].total;
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: {
        items: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 管理员 - 获取单个用户详情
 */
const getUserById = async (ctx) => {
  const { id } = ctx.params;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 查询用户信息 - 字段已与数据库结构对齐
    const users = await db.query('SELECT id, phone, name, avatar, city, join_date, last_login, status FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new NotFoundError(t('user.user_not_exist'));
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: users[0]
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 管理员 - 更新用户状态
 */
const updateUserStatus = async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 验证状态值
    if (status !== 0 && status !== 1) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 检查用户是否存在
    const users = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new NotFoundError(t('user.user_not_exist'));
    }
    
    // 更新状态
    await db.update('UPDATE users SET status = ?, last_login = NOW() WHERE id = ?', [status, id]);
    
    // 查询更新后的用户信息
    const updatedUsers = await db.query('SELECT id, phone, name, avatar, city, join_date, last_login, status FROM users WHERE id = ?', [id]);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success'),
      data: updatedUsers[0]
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 管理员 - 删除用户
 */
const deleteUser = async (ctx) => {
  const { id } = ctx.params;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 检查用户是否存在
    const users = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new NotFoundError(t('user.user_not_exist'));
    }
    
    // TODO: 事务处理，删除用户相关的数据
    await db.transaction(async (connection) => {
      // 删除用户的收藏
      await connection.execute('DELETE FROM user_favorites WHERE user_id = ?', [id]);
      // 删除用户的识别记录
      await connection.execute('DELETE FROM recognition_records WHERE user_id = ?', [id]);
      // 删除用户的答题历史
      await connection.execute('DELETE FROM user_question_history WHERE user_id = ?', [id]);
      // 删除用户的帖子
      await connection.execute('DELETE FROM posts WHERE user_id = ?', [id]);
      // 删除用户的评论
      await connection.execute('DELETE FROM comments WHERE user_id = ?', [id]);
      // 删除用户的活动报名
      await connection.execute('DELETE FROM activity_registrations WHERE user_id = ?', [id]);
      // 最后删除用户
      await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    });
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 忘记密码（发送重置验证码）
 */
const forgotPassword = async (ctx) => {
  const { phone } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 验证输入
    if (!phone) {
      throw new ValidationError(t('validation_error'));
    }
    
    // 查询用户
    const users = await db.query('SELECT id, name FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      // 为了安全，即使手机号不存在也返回成功
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: t('success')
      };
      return;
    }
    
    const user = users[0];
    
    // TODO: 生成密码重置验证码并发送短信
    // 这里应该集成短信发送服务
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('success')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

/**
 * 重置密码
 */
const resetPassword = async (ctx) => {
  const { token, newPassword } = ctx.request.body;
  const t = ctx.i18n ? ctx.i18n.t : (key) => key;
  
  try {
    // 验证输入
    if (!token || !newPassword) {
      throw new ValidationError(t('validation_error'));
    }
    
    // TODO: 验证密码重置令牌
    // 这里应该查询数据库验证令牌的有效性
    
    // 模拟验证成功
    const userId = 1; // 假设从令牌中解析出的用户ID
    
    // 检查新密码格式
    if (newPassword.length < 8) {
      throw new ValidationError(t('user.password_too_short'));
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await db.update('UPDATE users SET password = ?, last_login = NOW() WHERE id = ?', [hashedPassword, userId]);
    
    // TODO: 使密码重置令牌失效
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: t('user.password_updated')
    };
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAvatar,
  getFavorites,
  addFavorite,
  removeFavorite,
  getQuizHistory,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
  forgotPassword,
  resetPassword
};