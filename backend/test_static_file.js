const http = require('http');

// 测试静态文件访问
function testStaticFileAccess() {
  console.log('测试静态文件服务...');
  
  // 假设的测试图片URL路径
  const testImagePath = '/2025/09/20/1758306844878_570379a1687cb8e7.jpg';
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: testImagePath,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    // 检查Content-Type是否正确
    const contentType = res.headers['content-type'];
    console.log(`Content-Type: ${contentType}`);
    
    if (contentType && contentType.startsWith('image/')) {
      console.log('✅ 静态文件服务正常，返回了正确的图片类型');
    } else {
      console.log('❌ 静态文件服务异常，未返回正确的图片类型');
      
      // 如果不是图片类型，尝试检查返回的内容
      res.on('data', (d) => {
        console.log('响应内容:', d.toString().substring(0, 200));
      });
    }
  });

  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  req.end();
}

// 运行测试
setTimeout(testStaticFileAccess, 1000); // 延迟1秒执行，确保服务器已经完全启动