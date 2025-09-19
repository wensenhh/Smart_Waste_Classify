// 国家/地区区号数据
export const countryCodes = [
  { code: '+86', name: 'China', cnName: '中国', flag: '🇨🇳' },
  { code: '+1', name: 'United States', cnName: '美国', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', cnName: '英国', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', cnName: '澳大利亚', flag: '🇦🇺' },
  { code: '+81', name: 'Japan', cnName: '日本', flag: '🇯🇵' },
  { code: '+82', name: 'South Korea', cnName: '韩国', flag: '🇰🇷' },
  { code: '+65', name: 'Singapore', cnName: '新加坡', flag: '🇸🇬' },
  { code: '+60', name: 'Malaysia', cnName: '马来西亚', flag: '🇲🇾' },
  { code: '+64', name: 'New Zealand', cnName: '新西兰', flag: '🇳🇿' },
  { code: '+49', name: 'Germany', cnName: '德国', flag: '🇩🇪' },
  { code: '+33', name: 'France', cnName: '法国', flag: '🇫🇷' },
  { code: '+39', name: 'Italy', cnName: '意大利', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', cnName: '西班牙', flag: '🇪🇸' },
  { code: '+46', name: 'Sweden', cnName: '瑞典', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', cnName: '挪威', flag: '🇳🇴' },
  { code: '+48', name: 'Poland', cnName: '波兰', flag: '🇵🇱' },
  { code: '+40', name: 'Romania', cnName: '罗马尼亚', flag: '🇷🇴' },
  { code: '+7', name: 'Russia', cnName: '俄罗斯', flag: '🇷🇺' },
  { code: '+91', name: 'India', cnName: '印度', flag: '🇮🇳' },
  { code: '+880', name: 'Bangladesh', cnName: '孟加拉国', flag: '🇧🇩' },
  { code: '+66', name: 'Thailand', cnName: '泰国', flag: '🇹🇭' },
  { code: '+62', name: 'Indonesia', cnName: '印度尼西亚', flag: '🇮🇩' },
  { code: '+84', name: 'Vietnam', cnName: '越南', flag: '🇻🇳' },
  { code: '+63', name: 'Philippines', cnName: '菲律宾', flag: '🇵🇭' },
  { code: '+92', name: 'Pakistan', cnName: '巴基斯坦', flag: '🇵🇰' },
  { code: '+966', name: 'Saudi Arabia', cnName: '沙特阿拉伯', flag: '🇸🇦' },
  { code: '+20', name: 'Egypt', cnName: '埃及', flag: '🇪🇬' },
  { code: '+27', name: 'South Africa', cnName: '南非', flag: '🇿🇦' },
  { code: '+1', name: 'Canada', cnName: '加拿大', flag: '🇨🇦' },
  { code: '+55', name: 'Brazil', cnName: '巴西', flag: '🇧🇷' },
  { code: '+52', name: 'Mexico', cnName: '墨西哥', flag: '🇲🇽' },
  { code: '+54', name: 'Argentina', cnName: '阿根廷', flag: '🇦🇷' },
  { code: '+676', name: 'Tonga', cnName: '汤加', flag: '🇹🇴' }
];

// 根据国家代码获取国家信息
export const getCountryByCode = (code) => {
  return countryCodes.find(country => country.code === code);
};

// 获取用户地理位置并返回对应的国家代码
export const getCountryCodeByLocation = async () => {
  try {
    // 尝试使用浏览器的地理位置API
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    // 这里可以调用地理编码API将经纬度转换为国家代码
    // 为简化实现，我们使用一个模拟的方法
    return getMockCountryCodeByCoordinates(position.coords.latitude, position.coords.longitude);
  } catch (error) {
    console.warn('无法获取用户地理位置，使用默认值:', error);
    // 默认返回中国的国家代码
    return '+86';
  }
};

// 模拟根据经纬度获取国家代码的方法
const getMockCountryCodeByCoordinates = (latitude, longitude) => {
  // 详细的区域判断逻辑
  // 中国
  if (longitude > 73 && longitude < 135 && latitude > 18 && latitude < 53) {
    return '+86'; // 中国
  }
  // 美国
  else if (longitude > -125 && longitude < -66 && latitude > 24 && latitude < 49) {
    return '+1'; // 美国
  }
  // 英国
  else if (longitude > -10 && longitude < 2 && latitude > 49 && latitude < 61) {
    return '+44'; // 英国
  }
  // 澳大利亚
  else if (longitude > 113 && longitude < 154 && latitude > -43 && latitude < -10) {
    return '+61'; // 澳大利亚
  }
  // 日本
  else if (longitude > 122 && longitude < 154 && latitude > 24 && latitude < 46) {
    return '+81'; // 日本
  }
  // 韩国
  else if (longitude > 124 && longitude < 130 && latitude > 33 && latitude < 39) {
    return '+82'; // 韩国
  }
  // 新加坡
  else if (longitude > 103.5 && longitude < 104 && latitude > 1.2 && latitude < 1.5) {
    return '+65'; // 新加坡
  }
  // 马来西亚
  else if (longitude > 100 && longitude < 120 && latitude > 1 && latitude < 7) {
    return '+60'; // 马来西亚
  }
  // 德国
  else if (longitude > 5 && longitude < 16 && latitude > 47 && latitude < 55) {
    return '+49'; // 德国
  }
  // 法国
  else if (longitude > -5 && longitude < 9 && latitude > 42 && latitude < 51) {
    return '+33'; // 法国
  }
  // 意大利
  else if (longitude > 6 && longitude < 19 && latitude > 36 && latitude < 47) {
    return '+39'; // 意大利
  }
  // 西班牙
  else if (longitude > -9 && longitude < 3 && latitude > 36 && latitude < 43) {
    return '+34'; // 西班牙
  }
  // 俄罗斯 (部分欧洲区域)
  else if (longitude > 27 && longitude < 180 && latitude > 41 && latitude < 82) {
    return '+7'; // 俄罗斯
  }
  // 印度
  else if (longitude > 68 && longitude < 98 && latitude > 8 && latitude < 37) {
    return '+91'; // 印度
  }
  // 泰国
  else if (longitude > 95 && longitude < 106 && latitude > 5 && latitude < 21) {
    return '+66'; // 泰国
  }
  // 越南
  else if (longitude > 102 && longitude < 109 && latitude > 8 && latitude < 23) {
    return '+84'; // 越南
  }
  // 加拿大
  else if (longitude > -141 && longitude < -53 && latitude > 41 && latitude < 83) {
    return '+1'; // 加拿大
  }
  // 巴西
  else if (longitude > -74 && longitude < -34 && latitude > -34 && latitude < 5) {
    return '+55'; // 巴西
  }
  // 墨西哥
  else if (longitude > -118 && longitude < -86 && latitude > 14 && latitude < 33) {
    return '+52'; // 墨西哥
  }
  // 默认返回中国
  else {
    return '+86'; // 默认返回中国
  }
};

// 获取格式化的电话号码
export const formatPhoneNumber = (countryCode, phoneNumber) => {
  // 清除电话号码中的非数字字符
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `${countryCode} ${cleanPhone}`;
};

// 验证电话号码是否符合所选国家的格式
export const validatePhoneNumber = (countryCode, phoneNumber) => {
  // 清除电话号码中的非数字字符
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // 根据国家代码使用不同的验证规则
  switch (countryCode) {
    case '+86':
      // 中国手机号验证规则
      return /^1[3-9]\d{9}$/.test(cleanPhone);
    case '+1':
      // 美国/加拿大手机号验证规则
      return /^\d{10}$/.test(cleanPhone);
    case '+44':
      // 英国手机号验证规则
      return /^(?:7\d{9}|07\d{9})$/.test(cleanPhone);
    case '+61':
      // 澳大利亚手机号验证规则
      return /^(?:4\d{8}|04\d{8})$/.test(cleanPhone);
    case '+81':
      // 日本手机号验证规则
      return /^\d{10,11}$/.test(cleanPhone);
    default:
      // 通用手机号验证规则（至少8位数字）
      return /^\d{8,15}$/.test(cleanPhone);
  }
};