// 简单的加密函数
export const encrypt = (text, key = 'default-secret-key') => {
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      // 简单的字符偏移加密算法
      const charCode = text.charCodeAt(i);
      const keyCharCode = key.charCodeAt(i % key.length);
      // 确保加密后的字符在可打印ASCII范围内
      const encryptedCharCode = ((charCode + keyCharCode) % 94) + 33;
      result += String.fromCharCode(encryptedCharCode);
    }
    return result;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // 加密失败时返回原文
  }
};

// 解密函数
export const decrypt = (encryptedText, key = 'default-secret-key') => {
  try {
    let result = '';
    for (let i = 0; i < encryptedText.length; i++) {
      const charCode = encryptedText.charCodeAt(i);
      const keyCharCode = key.charCodeAt(i % key.length);
      // 解密算法，与加密算法对应
      // 先减去偏移量33，再减去密钥的影响，最后确保结果在正确范围内
      let decryptedCharCode = (charCode - 33) - keyCharCode;
      // 处理负数情况
      while (decryptedCharCode < 33) {
        decryptedCharCode += 94;
      }
      result += String.fromCharCode(decryptedCharCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // 解密失败时返回密文
  }
};

// 设置cookie
export const setCookie = (name, value, days = 7) => {
  try {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    return true;
  } catch (error) {
    console.error('Set cookie failed:', error);
    return false;
  }
};

// 获取cookie
export const getCookie = (name) => {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  } catch (error) {
    console.error('Get cookie failed:', error);
    return null;
  }
};

// 删除cookie
export const deleteCookie = (name) => {
  try {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    return true;
  } catch (error) {
    console.error('Delete cookie failed:', error);
    return false;
  }
};

// 记住用户凭证
export const rememberCredentials = (username, password, remember = false) => {
  if (remember) {
    // 加密密码
    const encryptedPassword = encrypt(password);
    // 设置cookie，有效期为7天
    setCookie('rememberedUsername', username, 7);
    setCookie('rememberedPassword', encryptedPassword, 7);
  } else {
    // 删除cookie
    deleteCookie('rememberedUsername');
    deleteCookie('rememberedPassword');
  }
};

// 获取记住的用户凭证
export const getRememberedCredentials = () => {
  const username = getCookie('rememberedUsername');
  const encryptedPassword = getCookie('rememberedPassword');
  
  if (username && encryptedPassword) {
    try {
      // 解密密码
      const password = decrypt(encryptedPassword);
      return { username, password };
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      // 如果解密失败，删除cookie
      deleteCookie('rememberedUsername');
      deleteCookie('rememberedPassword');
    }
  }
  
  return null;
};