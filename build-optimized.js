const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 V2Board Admin...');

try {
  // 设置环境变量
  process.env.NODE_ENV = 'production';
  process.env.VUE_APP_BUILD_TIME = new Date().toISOString();

  // 执行构建命令
  console.log('📦 执行构建...');
  execSync('vue-cli-service build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  // 检查构建结果
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ 构建成功！');
    console.log(`📁 构建文件位置: ${distPath}`);
    
    // 显示构建文件大小
    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
        console.log(`📄 ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
      }
    });
    
    console.log(`📊 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.error('❌ 构建失败：dist 目录不存在');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
