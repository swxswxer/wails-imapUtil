<template>
  <div class="export-container">
    <el-card title="导出配置" class="export-card">
      <el-form :model="exportForm" ref="formRef" label-width="100px">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="exportForm.fileName" placeholder="导出文件的名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="exportToExcel" :loading="loading" :disabled="exportStatus === 'exporting'">导出</el-button>
          <el-button @click="goBack">返回搜索</el-button>
        </el-form-item>
      </el-form>
      
      <div class="export-progress" v-if="exportProgress > 0 && exportProgress < 100">
        <el-progress :percentage="exportProgress" status="success"></el-progress>
        <div class="progress-text">导出中，请稍候...</div>
      </div>
      
      <div class="export-error" v-if="exportStatus === 'error'">
        <el-alert
          title="导出失败"
          type="error"
          :description="exportError"
          show-icon
        />
        <el-button type="primary" @click="exportToExcel" style="margin-top: 20px" :loading="loading">重试</el-button>
        <el-button @click="goBack" style="margin-top: 20px">返回搜索</el-button>
      </div>
      
      <div class="email-count" v-if="emails.length > 0">
        <el-tag type="info">共 {{ emails.length }} 封邮件</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmailStore } from '@/stores/email'
import { useExportStore } from '@/stores/export'
import { ElMessage } from 'element-plus'
import exportService from '@/services/export'

const router = useRouter()
const emailStore = useEmailStore()
const exportStore = useExportStore()

const formRef = ref(null)
const loading = ref(false)
const exportProgress = ref(0)
const exportStatus = ref('idle')
const exportError = ref('')
const emails = ref([])
const savedFilePath = ref('')

const exportForm = reactive({
  fileName: 'emails'
})

const exportToExcel = async () => {
  loading.value = true
  exportProgress.value = 0
  exportStatus.value = 'exporting'
  exportError.value = ''

  try {
    // 模拟导出进度
    const progressInterval = setInterval(() => {
      exportProgress.value += 10
      if (exportProgress.value >= 100) {
        clearInterval(progressInterval)
      }
    }, 200)

    // 默认导出主题和日期字段
    const fixedFields = ['subject', 'date']
    const filePath = await exportService.exportToExcel(emails.value, fixedFields, exportForm.fileName)
    
    clearInterval(progressInterval)
    exportProgress.value = 100
    exportStatus.value = 'idle'
    ElMessage.success(`导出成功，文件已保存到: ${filePath}`)
    // 导出成功后跳回搜索页面
    setTimeout(() => {
      goBack()
    }, 1500)
  } catch (error) {
    exportStatus.value = 'error'
    exportError.value = error.message
    ElMessage.error(`导出失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/search')
}

onMounted(() => {
  // 如果未连接，跳转到登录页面
  if (!emailStore.connected) {
    router.push('/')
  }
  
  // 初始化数据
  emails.value = exportStore.emails.length > 0 ? exportStore.emails : emailStore.emails
  exportForm.fileName = exportStore.fileName
  
  // 如果没有邮件数据，跳回搜索页面
  if (emails.value.length === 0) {
    ElMessage.warning('暂无邮件数据，请先搜索邮件')
    router.push('/search')
  }
})
</script>

<style scoped>
.export-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.export-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.export-progress {
  margin-top: 30px;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #606266;
}

.export-result {
  margin-top: 30px;
}

.export-error {
  margin-top: 30px;
}

.email-count {
  margin-top: 20px;
}
</style>
