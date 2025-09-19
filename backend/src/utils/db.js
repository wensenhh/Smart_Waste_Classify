// 数据库连接模块
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

// 创建数据库连接池
let pool = null;

/**
 * 初始化数据库连接池
 */
const initPool = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      console.log('数据库连接池创建成功');
    }
    return pool;
  } catch (error) {
    console.error('创建数据库连接池失败:', error.message);
    throw new Error('数据库连接池初始化失败');
  }
};

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功:', { 
      host: dbConfig.host, 
      database: dbConfig.database, 
      user: dbConfig.user 
    });
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  }
};

/**
 * 执行SQL查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - SQL参数数组
 * @returns {Promise} 查询结果
 */
const query = async (sql, params = []) => {
  let connection = null;
  try {
    // 如果连接池未初始化，先初始化
    if (!pool) {
      await initPool();
    }
    
    // 获取连接
    connection = await pool.getConnection();
    
    // 执行查询
    const [rows] = await connection.execute(sql, params);
    
    return rows;
  } catch (error) {
    console.error('数据库查询失败:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    // 释放连接
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 执行SQL插入
 * @param {string} sql - SQL插入语句
 * @param {Array|Object} params - SQL参数
 * @returns {Promise} 插入结果
 */
const insert = async (sql, params = []) => {
  let connection = null;
  try {
    // 如果连接池未初始化，先初始化
    if (!pool) {
      await initPool();
    }
    
    // 获取连接
    connection = await pool.getConnection();
    
    // 执行插入
    const [result] = await connection.execute(sql, params);
    
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('数据库插入失败:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    // 释放连接
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 执行SQL更新
 * @param {string} sql - SQL更新语句
 * @param {Array} params - SQL参数数组
 * @returns {Promise} 更新结果
 */
const update = async (sql, params = []) => {
  let connection = null;
  try {
    // 如果连接池未初始化，先初始化
    if (!pool) {
      await initPool();
    }
    
    // 获取连接
    connection = await pool.getConnection();
    
    // 执行更新
    const [result] = await connection.execute(sql, params);
    
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  } catch (error) {
    console.error('数据库更新失败:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    // 释放连接
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 执行SQL删除
 * @param {string} sql - SQL删除语句
 * @param {Array} params - SQL参数数组
 * @returns {Promise} 删除结果
 */
const del = async (sql, params = []) => {
  let connection = null;
  try {
    // 如果连接池未初始化，先初始化
    if (!pool) {
      await initPool();
    }
    
    // 获取连接
    connection = await pool.getConnection();
    
    // 执行删除
    const [result] = await connection.execute(sql, params);
    
    return {
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('数据库删除失败:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    // 释放连接
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 执行事务
 * @param {Function} callback - 事务回调函数
 * @returns {Promise} 事务结果
 */
const transaction = async (callback) => {
  let connection = null;
  try {
    // 如果连接池未初始化，先初始化
    if (!pool) {
      await initPool();
    }
    
    // 获取连接
    connection = await pool.getConnection();
    
    // 开始事务
    await connection.beginTransaction();
    
    // 执行事务回调
    const result = await callback(connection);
    
    // 提交事务
    await connection.commit();
    
    return result;
  } catch (error) {
    // 回滚事务
    if (connection) {
      await connection.rollback();
    }
    console.error('数据库事务失败:', error.message);
    throw error;
  } finally {
    // 释放连接
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 关闭数据库连接池
 */
const closePool = async () => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('数据库连接池已关闭');
    }
  } catch (error) {
    console.error('关闭数据库连接池失败:', error.message);
  }
};

/**
 * 获取连接池状态
 */
const getPoolStatus = () => {
  if (!pool) {
    return {
      status: 'not_initialized',
      config: dbConfig
    };
  }
  
  return {
    status: 'initialized',
    config: dbConfig,
    // mysql2连接池没有直接暴露状态信息，这里仅返回配置
    connectionLimit: dbConfig.connectionLimit
  };
};

module.exports = {
  initPool,
  testConnection,
  query,
  insert,
  update,
  del,
  transaction,
  closePool,
  getPoolStatus
};