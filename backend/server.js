// 智能垃圾分类系统后端服务器
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root', // 请根据实际情况修改
  password: '', // 请根据实际情况修改
  database: 'smart_waste_db'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

testDbConnection();

// API路由示例
app.get('/api', (req, res) => {
  res.json({ message: '智能垃圾分类系统后端API' });
});

// 文件上传相关API可以在这里添加

// 启动服务器
app.listen(PORT, () => {
  console.log(`后端服务器运行在 http://localhost:${PORT}`);
  console.log('数据库配置:', { ...dbConfig, password: '******' });
  console.log('请确保已安装所需依赖：npm install express cors mysql2');
});