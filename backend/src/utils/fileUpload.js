// 文件上传工具
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { uploadDir, maxFileSize } = require('../config/fileUpload');

/**
 * 确保上传目录存在
 * @returns {Promise<void>}
 */
async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('创建上传目录失败:', error);
      throw new Error('无法创建文件上传目录');
    }
  }
}

/**
 * 生成唯一的文件名
 * @param {string} originalName - 原始文件名
 * @returns {string} 唯一文件名
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString('hex');
  const extname = path.extname(originalName).toLowerCase();
  return `${timestamp}_${randomStr}${extname}`;
}

/**
 * 生成按时间维度的目录路径（年/月/日）
 * @returns {string} 时间目录路径
 */
function generateTimeBasedDirectory() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 验证文件类型
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为允许的文件类型
 */
function validateFileType(filename) {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extname = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(extname);
}

/**
 * 验证文件大小
 * @param {Buffer} fileBuffer - 文件数据
 * @returns {boolean} 是否在允许的大小范围内
 */
function validateFileSize(fileBuffer) {
  const fileSize = Buffer.byteLength(fileBuffer);
  return fileSize <= maxFileSize;
}

/**
 * 优化图像文件
 * @param {Buffer} imageBuffer - 图像数据
 * @param {string} filename - 文件名
 * @returns {Promise<Buffer>} 优化后的图像数据
 */
async function optimizeImage(imageBuffer, filename) {
  try {
    const extname = path.extname(filename).toLowerCase();
    const isJpeg = ['.jpg', '.jpeg'].includes(extname);
    const isPng = ['.png'].includes(extname);
    const isWebp = ['.webp'].includes(extname);
    const isGif = ['.gif'].includes(extname);

    // 如果是GIF，不进行优化
    if (isGif) {
      return imageBuffer;
    }

    // 处理其他图像格式
    let pipeline = sharp(imageBuffer)
      .resize(1200, 1200, { // 调整最大尺寸
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .rotate(); // 自动旋转根据EXIF信息

    // 根据文件类型设置不同的压缩参数
    if (isJpeg) {
      pipeline = pipeline.jpeg({
        quality: 80,
        progressive: true
      });
    } else if (isPng) {
      pipeline = pipeline.png({
        compressionLevel: 6
      });
    } else if (isWebp) {
      pipeline = pipeline.webp({
        quality: 80
      });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('图像优化失败:', error);
    // 如果优化失败，返回原始图像
    return imageBuffer;
  }
}

/**
 * 上传文件
 * @param {Buffer} fileBuffer - 文件数据
 * @param {string} originalName - 原始文件名
 * @param {Object} [options={}] - 上传选项
 * @param {boolean} [options.optimize=true] - 是否优化图像
 * @param {string} [options.subDir=''] - 子目录
 * @param {boolean} [options.useTimeBasedDir=true] - 是否使用按时间维度的目录结构
 * @returns {Promise<string>} 文件URL
 */
async function uploadFile(fileBuffer, originalName, options = {}) {
  try {
    const { optimize = true, subDir = '', useTimeBasedDir = true } = options;

    // 验证文件类型
    if (!validateFileType(originalName)) {
      throw new Error('不支持的文件类型，仅支持JPG、PNG、GIF、WebP格式');
    }

    // 验证文件大小
    if (!validateFileSize(fileBuffer)) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      throw new Error(`文件大小超过限制，最大支持${maxSizeMB}MB`);
    }

    // 确定目标目录
    let targetDirPath = uploadDir;
    
    // 如果指定了子目录，添加到路径
    if (subDir) {
      targetDirPath = path.join(targetDirPath, subDir);
    }
    
    // 如果使用时间维度的目录结构，添加时间目录
    if (useTimeBasedDir) {
      const timeDir = generateTimeBasedDirectory();
      targetDirPath = path.join(targetDirPath, timeDir);
    }
    
    // 确保目标目录存在
    await fs.mkdir(targetDirPath, { recursive: true });

    // 生成唯一文件名
    const filename = generateUniqueFilename(originalName);
    const filePath = path.join(targetDirPath, filename);

    // 处理文件
    let fileData = fileBuffer;

    // 如果是图像文件且需要优化，则进行优化
    if (optimize && validateFileType(originalName)) {
      fileData = await optimizeImage(fileData, filename);
    }

    // 保存文件
    await fs.writeFile(filePath, fileData);

    // 构建文件URL
    // 计算相对路径（从uploads目录开始）
    const relativeTargetDir = path.relative(uploadDir, targetDirPath);
    // 确保路径分隔符在URL中始终使用/而不是操作系统相关的分隔符
    const normalizedRelativeTargetDir = relativeTargetDir.split(path.sep).join('/');
    const relativePath = normalizedRelativeTargetDir ? `${normalizedRelativeTargetDir}/${filename}` : filename;
    
    // 获取基础URL（优先使用环境变量中的BASE_URL，否则从环境变量构建）
    // 完全从环境变量中读取，不硬编码任何URL
    const baseUrl = process.env.BASE_URL || 
                   `${process.env.PROTOCOL || 'http'}://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`;
    
    // 构建完整的文件URL（简化路径，不添加/static/uploads前缀）
    const fileUrl = `${baseUrl}/${relativePath}`;

    return fileUrl;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}

/**
 * 删除文件
 * @param {string} fileUrl - 文件URL
 * @returns {Promise<boolean>} 是否删除成功
 */
async function deleteFile(fileUrl) {
  try {
    // 从URL中提取文件路径（移除基础URL部分）
    // 完全从环境变量中读取，不硬编码任何URL
    const baseUrl = process.env.BASE_URL || 
                   `${process.env.PROTOCOL || 'http'}://${process.env.HOST || 'localhost'}:${process.env.PORT || 3002}`;
    const relativePath = fileUrl.replace(baseUrl + '/', '');
    const filePath = path.join(uploadDir, relativePath);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      console.warn('文件不存在，无法删除:', filePath);
      return false;
    }

    // 删除文件
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('文件删除失败:', error);
    throw error;
  }
}

/**
 * 获取文件信息
 * @param {string} fileUrl - 文件URL
 * @returns {Promise<Object|null>} 文件信息或null
 */
async function getFileInfo(fileUrl) {
  try {
    // 从URL中提取文件路径（移除基础URL部分）
    // 完全从环境变量中读取，不硬编码任何URL
    const baseUrl = process.env.BASE_URL || 
                   `${process.env.PROTOCOL || 'http'}://${process.env.HOST || 'localhost'}:${process.env.PORT || 3002}`;
    const relativePath = fileUrl.replace(baseUrl + '/', '');
    const filePath = path.join(uploadDir, relativePath);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      console.warn('文件不存在:', filePath);
      return null;
    }

    // 获取文件信息
    const stats = await fs.stat(filePath);
    const extname = path.extname(filePath).toLowerCase();

    return {
      path: filePath,
      size: stats.size,
      mtime: stats.mtime,
      extension: extname,
      url: fileUrl
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    throw error;
  }
}

/**
 * 清理过期文件
 * @param {number} days - 保留天数
 * @returns {Promise<number>} 清理的文件数量
 */
async function cleanupOldFiles(days = 30) {
  try {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    // 递归遍历上传目录
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          
          // 如果文件修改时间早于截止时间，则删除
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(fullPath);
            deletedCount++;
          }
        }
      }
    }

    await scanDirectory(uploadDir);
    console.log(`清理了${deletedCount}个过期文件`);
    return deletedCount;
  } catch (error) {
    console.error('清理过期文件失败:', error);
    throw error;
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileInfo,
  cleanupOldFiles,
  ensureUploadDir,
  validateFileType,
  validateFileSize
};