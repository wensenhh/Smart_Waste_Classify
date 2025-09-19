/**
 * IP工具模块
 * 用于获取用户IP地址和基于IP的国家信息
 */

/**
 * 从请求头中提取用户IP地址
 * @param {Object} ctx - Koa上下文对象
 * @returns {string} 用户IP地址
 */
const getUserIP = (ctx) => {
  // 尝试从各种可能的请求头中获取IP
  const xForwardedFor = ctx.request.headers['x-forwarded-for'];
  const xRealIP = ctx.request.headers['x-real-ip'];
  const remoteAddress = ctx.request.socket.remoteAddress;
  
  if (xForwardedFor) {
    // x-forwarded-for可能包含多个IP，取第一个
    const ips = xForwardedFor.split(',');
    return ips[0].trim();
  } else if (xRealIP) {
    return xRealIP;
  } else {
    // 本地开发环境下，remoteAddress可能是::1（IPv6的localhost）
    return remoteAddress === '::1' ? '127.0.0.1' : remoteAddress;
  }
};

/**
 * 基于IP地址获取国家信息
 * 注意：实际项目中，这里应该调用IP地理位置API来获取准确的国家信息
 * 由于是示例实现，这里提供一个简化版本
 * @param {string} ip - IP地址
 * @returns {string} 国家名称
 */
const getCountryByIP = async (ip) => {
  try {
    // 这里应该是调用IP地理位置API的逻辑
    // 由于是演示，我们返回一个默认值
    
    // 对于本地IP，返回"China"
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return 'China';
    }
    
    // TODO: 实际项目中，这里应该调用第三方IP地理位置服务API
    // 例如：
    // const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_API_KEY&ip=${ip}`);
    // const data = await response.json();
    // return data.country_name;
    
    // 暂时返回默认值
    return 'Unknown';
  } catch (error) {
    console.error('获取IP地理位置信息失败:', error);
    return 'Unknown';
  }
};

/**
 * 基于区号获取国家信息
 * @param {string} phoneCode - 手机号区号（如：+86）
 * @returns {string} 国家名称
 */
const getCountryByPhoneCode = (phoneCode) => {
  // 简化的区号到国家映射
  const countryMap = {
    '+1': 'United States',
    '+86': 'China',
    '+44': 'United Kingdom',
    '+81': 'Japan',
    '+82': 'South Korea',
    '+65': 'Singapore',
    '+61': 'Australia',
    '+49': 'Germany',
    '+33': 'France',
    '+852': 'Hong Kong',
    '+853': 'Macau',
    '+886': 'Taiwan'
  };
  
  return countryMap[phoneCode] || 'Unknown';
};

module.exports = {
  getUserIP,
  getCountryByIP,
  getCountryByPhoneCode
};