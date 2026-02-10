<script setup>
import { ref, onMounted } from 'vue'
import { Setting, InfoFilled, Message, Calendar, Notebook, Check } from '@element-plus/icons-vue'
import versionData from './version.json'

// 对话框控制
const showSettings = ref(false)

// 菜单状态
const activeMenu = ref('about')

// 版本信息
const versionInfo = ref({
  currentVersion: '1.0.1',
  releaseDate: '2026-02-09',
  description: '这是一个基于 Wails 和 Vue 开发的 IMAP 邮件搜索工具，用于快速搜索和管理邮件。',
  techStack: []
})

// 更新日志
const changelog = ref([])

// 菜单选择处理
const handleMenuSelect = (key) => {
  activeMenu.value = key
}

// 初始化版本信息
onMounted(() => {
  if (versionData) {
    versionInfo.value.currentVersion = versionData.currentVersion
    versionInfo.value.releaseDate = versionData.versionInfo.releaseDate
    versionInfo.value.description = versionData.versionInfo.description
    versionInfo.value.techStack = versionData.versionInfo.techStack
    changelog.value = versionData.changelog
  }
})
</script>

<template>
  <div class="app-container">
    <router-view />
    
    <!-- 悬浮设置按钮 -->
    <div class="settings-float">
      <el-button type="primary" circle @click="showSettings = true">
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>
    
    <!-- 设置窗口 -->
    <el-dialog
      v-model="showSettings"
      title="设置"
      width="800px"
      destroy-on-close
    >
      <div class="settings-container">
        <!-- 左侧菜单 -->
        <div class="settings-menu">
          <el-menu
            :default-active="activeMenu"
            class="settings-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <!-- 右侧内容区 -->
        <div class="settings-content">
          <!-- 关于内容 -->
          <div v-if="activeMenu === 'about'" class="about-content">
            <!-- 头部信息 -->
            <div class="about-header">
              <div class="app-icon">
                <el-icon class="icon-large"><Message /></el-icon>
              </div>
              <h2>IMAP 邮件搜索工具</h2>
              <p class="version-tag">版本 {{ versionInfo.currentVersion }}</p>
            </div>
            
            <!-- 描述信息 -->
            <el-card class="about-card">
              <template #header>
                <div class="card-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>工具介绍</span>
                </div>
              </template>
              <div class="card-content">
                <p>{{ versionInfo.description }}</p>
              </div>
            </el-card>
            

            
            <!-- 更新日志 -->
            <el-card class="about-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Notebook /></el-icon>
                  <span>更新日志</span>
                </div>
              </template>
              <div class="card-content">
                <div v-for="(version, index) in changelog" :key="index" class="version-item">
                  <div class="version-header">
                    <el-badge 
                      :value="version.version" 
                      type="primary" 
                      class="version-badge"
                    />
                    <span class="version-date">{{ version.date }}</span>
                  </div>
                  <ul class="change-list">
                    <li v-for="(change, changeIndex) in version.changes" :key="changeIndex">
                      <el-icon class="change-icon"><Check /></el-icon>
                      <span>{{ change }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </el-card>
            
            <!-- 版权信息 -->
            <div class="copyright-section">
              <p class="copyright">© 2026 Yeahka. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
  position: relative;
}

/* 悬浮设置按钮 */
.settings-float {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 999;
}

.settings-float .el-button {
  font-size: 18px;
  width: 50px;
  height: 50px;
}

/* 设置窗口容器 */
.settings-container {
  display: flex;
  height: 500px;
}

/* 左侧菜单 */
.settings-menu {
  width: 150px;
  border-right: 1px solid #e4e7ed;
}

/* 右侧内容区 */
.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 关于内容 */
.about-content {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

/* 头部信息 */
.about-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-icon {
  margin-bottom: 20px;
}

.icon-large {
  font-size: 64px;
  opacity: 0.9;
}

.about-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.version-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

/* 卡片样式 */
.about-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.about-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.card-content {
  padding: 16px 0;
}

/* 信息项 */
.info-item {
  margin-bottom: 16px;
}

.info-label {
  display: inline-block;
  width: 100px;
  font-weight: 500;
  color: #606266;
}

.info-value {
  color: #303133;
}

/* 技术栈标签 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

/* 版本项 */
.version-item {
  margin-bottom: 24px;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.version-badge {
  font-weight: 600;
}

.version-date {
  color: #909399;
  font-size: 14px;
}

/* 变更列表 */
.change-list {
  margin: 0;
  padding-left: 24px;
}

.change-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #606266;
  line-height: 1.5;
  text-align: left;
}

.change-list li span {
  flex: 1;
  text-align: left;
}

.change-icon {
  margin-top: 2px;
  color: #67c23a;
  font-size: 14px;
}

/* 版权信息 */
.copyright-section {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.copyright {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
</style>
