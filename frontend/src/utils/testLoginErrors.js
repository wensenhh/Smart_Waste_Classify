import { useUserStore } from '../stores/user';

/**
 * 测试登录错误处理函数
 * 用于验证不同类型的登录错误是否能显示正确的友好提示
 */
export async function testLoginErrors() {
  const userStore = useUserStore();
  
  console.log('===== 开始测试登录错误提示 =====');
  
  try {
    // 测试场景1: 使用不存在的用户名
    console.log('\n测试场景1: 使用不存在的用户名');
    const result1 = await userStore.login({
      username: 'nonexistentuser123',
      password: 'test123'
    });
    console.log('登录结果:', result1);
    console.log('错误提示:', userStore.error);
    
    // 测试场景2: 使用错误的密码
    console.log('\n测试场景2: 使用错误的密码');
    // 假设至少有一个有效的用户名可以测试
    // 这里使用'admin'作为示例，如果实际系统中不存在，可能需要修改
    const result2 = await userStore.login({
      username: 'admin',
      password: 'wrongpassword123'
    });
    console.log('登录结果:', result2);
    console.log('错误提示:', userStore.error);
    
    // 测试场景3: 空用户名或密码
    console.log('\n测试场景3: 空用户名或密码');
    const result3 = await userStore.login({
      username: '',
      password: 'test123'
    });
    console.log('登录结果:', result3);
    console.log('错误提示:', userStore.error);
    
    console.log('\n===== 登录错误提示测试完成 =====');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

/**
 * 在控制台中运行测试的便捷函数
 */
if (typeof window !== 'undefined') {
  // 提供全局方法以便在浏览器控制台直接调用
  window.testLoginErrors = testLoginErrors;
  console.log('登录错误测试工具已加载，可在控制台运行 window.testLoginErrors() 进行测试');
}