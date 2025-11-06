#!/bin/bash

# 设置nvm环境变量
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 使用Node.js 18
nvm use 18

# 显示版本信息
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 安装依赖
npm install
