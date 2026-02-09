<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- 悬浮设置按钮 -->
    <div class="settings-float">
      <el-dropdown trigger="click">
        <el-button type="primary" circle>
          <el-icon><Setting /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showAbout = true">关于</el-dropdown-item>
            <el-dropdown-item @click="showVersion = true">版本信息</el-dropdown-item>
            <el-dropdown-item @click="showChangelog = true">更新日志</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 关于对话框 -->
    <el-dialog
      v-model="showAbout"
      title="关于"
      width="400px"
      destroy-on-close
    >
      <div class="about-content">
        <h3>IMAP 邮件搜索工具</h3>
        <p class="version">版本：1.0.1</p>
        <p class="description">这是一个基于 Wails 和 Vue 开发的 IMAP 邮件搜索工具，用于快速搜索和管理邮件。</p>
        <p class="copyright">© 2026 Yeahka. All rights reserved.</p>
      </div>
    </el-dialog>
    
    <!-- 版本信息对话框 -->
    <el-dialog
      v-model="showVersion"
      title="版本信息"
      width="400px"
      destroy-on-close
    >
      <div class="version-content">
        <h3>版本：1.0.1</h3>
        <p><strong>发布日期：</strong>2026-02-09</p>
        <p><strong>技术栈：</strong></p>
        <ul>
          <li>后端: Go + Wails</li>
          <li>前端: Vue 3 + Element Plus</li>
          <li>IMAP 库: github.com/emersion/go-imap</li>
        </ul>
      </div>
    </el-dialog>
    
    <!-- 更新日志对话框 -->
    <el-dialog
      v-model="showChangelog"
      title="更新日志"
      width="500px"
      destroy-on-close
    >
      <div class="changelog-content">
        <h3>版本 1.0.1 (2026-02-09)</h3>
        <ul>
          <li>优化错误提示，统一显示格式</li>
          <li>添加自动重连机制，提高连接稳定性</li>
          <li>添加心跳检测，保持连接活跃</li>
          <li>添加设置悬浮按钮，包含关于、版本信息、更新日志等功能</li>
        </ul>
        
        <h3>版本 1.0.0 (2026-02-08)</h3>
        <ul>
          <li>初始版本发布</li>
          <li>支持 IMAP 服务器连接</li>
          <li>支持邮件主题关键词搜索</li>
          <li>支持邮件主题清理</li>
          <li>支持搜索结果导出为 Excel</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'

// 对话框控制
const showAbout = ref(false)
const showVersion = ref(false)
const showChangelog = ref(false)
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
  position: relative;
}

/* 悬浮设置按钮 */
.settings-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
}

/* 关于对话框内容 */
.about-content {
  text-align: center;
  padding: 20px 0;
}

.about-content h3 {
  margin-bottom: 20px;
  color: #409eff;
}

.about-content .version {
  font-size: 16px;
  margin-bottom: 15px;
  color: #606266;
}

.about-content .description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #606266;
}

.about-content .copyright {
  font-size: 14px;
  color: #909399;
}

/* 版本信息对话框内容 */
.version-content {
  padding: 10px 0;
}

.version-content h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.version-content p {
  margin-bottom: 10px;
  color: #606266;
}

.version-content ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

.version-content li {
  margin-bottom: 5px;
  color: #606266;
}

/* 更新日志对话框内容 */
.changelog-content {
  padding: 10px 0;
}

.changelog-content h3 {
  margin: 20px 0 10px 0;
  color: #409eff;
}

.changelog-content ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

.changelog-content li {
  margin-bottom: 5px;
  color: #606266;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
