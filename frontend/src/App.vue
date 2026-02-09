<script setup>
import { ref, onMounted } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import versionData from './version.json'

// 对话框控制
const showAbout = ref(false)
const showVersion = ref(false)
const showChangelog = ref(false)

// 版本信息
const versionInfo = ref({
  currentVersion: '1.0.1',
  releaseDate: '2026-02-09',
  description: '这是一个基于 Wails 和 Vue 开发的 IMAP 邮件搜索工具，用于快速搜索和管理邮件。',
  techStack: []
})

// 更新日志
const changelog = ref([])

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
        <p class="version">版本：{{ versionInfo.currentVersion }}</p>
        <p class="description">{{ versionInfo.description }}</p>
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
        <h3>版本：{{ versionInfo.currentVersion }}</h3>
        <p><strong>发布日期：</strong>{{ versionInfo.releaseDate }}</p>
        <p><strong>技术栈：</strong></p>
        <ul>
          <li v-for="(tech, index) in versionInfo.techStack" :key="index">{{ tech }}</li>
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
        <div v-for="(version, index) in changelog" :key="index">
          <h3>版本 {{ version.version }} ({{ version.date }})</h3>
          <ul>
            <li v-for="(change, changeIndex) in version.changes" :key="changeIndex">{{ change }}</li>
          </ul>
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
</style>
