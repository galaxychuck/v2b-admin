const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const JavaScriptObfuscator = require("javascript-obfuscator");

const isProd = process.env.NODE_ENV === "production";

module.exports = defineConfig({
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  productionSourceMap: false,
  
  configureWebpack: (config) => {
    config.experiments = { 
      ...config.experiments, 
      asyncWebAssembly: true, 
      syncWebAssembly: true 
    };
    
    config.resolve = { 
      ...config.resolve, 
      alias: { "@": path.resolve(__dirname, "src") }
    };
    
    // 优化代码分割 - 管理后台优化
    config.optimization = {
      ...config.optimization,
      concatenateModules: true,
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: "all",
        maxInitialRequests: 5,
        maxAsyncRequests: 15,
        minSize: 200000,
        maxSize: 800000,
        cacheGroups: {
          // 运行时
          runtime: {
            name: 'runtime',
            test: /[\\/]node_modules[\\/](@vue|vue)[\\/]/,
            priority: 60,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // 核心库
          core: {
            name: 'chunk-core',
            test: /[\\/]node_modules[\\/](vue|vue-router|vuex|@vue|axios|lodash|lodash-es|dayjs|moment|crypto-js|jsencrypt)[\\/]/,
            priority: 50,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // Element Plus UI库
          elementPlus: {
            name: 'chunk-element-plus',
            test: /[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/,
            priority: 40,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // 图表库
          charts: {
            name: 'chunk-charts',
            test: /[\\/]node_modules[\\/](chart\.js|echarts)[\\/]/,
            priority: 30,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // 其他库
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      }
    };
    
    // 生产环境优化
    if (isProd) {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        })
      ];
    }
  },
  
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  
  devServer: {
    port: 8081,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
});
