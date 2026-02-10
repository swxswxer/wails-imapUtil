<template>
  <div class="search-container">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>邮件搜索</span>
          <div class="header-buttons">
            <el-tooltip content="可以去除邮件中的'回复'、'转发'、'RE'等关键字" placement="top">
              <el-button type="success" @click="cleanData" :disabled="emails.length === 0">数据清理</el-button>
            </el-tooltip>
            <el-button type="primary" @click="showExportDialog = true" :disabled="emails.length === 0">导出为 Excel</el-button>
          </div>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form" label-width="80px">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="输入关键词搜索邮件主题" style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search" :loading="loading">搜索</el-button>
          <el-button @click="disconnect">断开连接</el-button>
        </el-form-item>
      </el-form>
      
      <div class="search-result-count" v-if="!loading && emails.length > 0">
        搜索结果总数：{{ emails.length }}
      </div>
      
      <el-table :data="emails" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="subject" label="主题" min-width="300" header-align="center"></el-table-column>
        <el-table-column prop="date" label="日期" width="180" align="right" header-align="center">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="empty-state" v-if="!loading && emails.length === 0">
        <el-empty description="暂无邮件数据" :image-size="200" />
      </div>
    </el-card>
    
    <!-- 导出弹框 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出配置"
      width="500px"
      destroy-on-close
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="exportForm.fileName" placeholder="导出文件的名称"></el-input>
        </el-form-item>
      </el-form>
      
      <div class="export-progress" v-if="exportProgress > 0 && exportProgress < 100">
        <el-progress :percentage="exportProgress" status="success"></el-progress>
        <div class="progress-text">导出中，请稍候...</div>
      </div>
      
      <div class="export-error" v-if="exportError">
        <el-alert
          title="导出失败"
          type="error"
          :description="exportError"
          show-icon
        />
      </div>
      
      <div class="email-count" v-if="emails.length > 0">
        <el-tag type="info">共 {{ emails.length }} 封邮件</el-tag>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button type="primary" @click="exportToExcel" :loading="exportLoading" :disabled="exportProgress > 0 && exportProgress < 100">导出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmailStore } from '@/stores/email'
import { useExportStore } from '@/stores/export'
import { ElMessage } from 'element-plus'
import imapService from '@/services/imap'
import exportService from '@/services/export'
import dayjs from 'dayjs'

const router = useRouter()
const emailStore = useEmailStore()
const exportStore = useExportStore()

const searchForm = reactive({
  keyword: ''
})

const loading = ref(false)
const total = ref(0)
const emails = ref([])

// 导出弹框相关变量
const showExportDialog = ref(false)
const exportForm = reactive({
  fileName: 'emails'
})
const exportLoading = ref(false)
const exportProgress = ref(0)
const exportError = ref('')

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const search = async () => {
  if (!searchForm.keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    const result = await imapService.search(searchForm.keyword)
    emails.value = result
    total.value = result.length
    emailStore.setEmails(result, result.length)
    emailStore.setSearchKeyword(searchForm.keyword)
  } catch (error) {
    ElMessage.error(`搜索失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const exportToExcel = async () => {
  if (emails.value.length === 0) {
    ElMessage.warning('暂无邮件数据可导出')
    return
  }

  exportLoading.value = true
  exportProgress.value = 0
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
    
    ElMessage.success(`导出成功，文件已保存到: ${filePath}`)
    showExportDialog.value = false
  } catch (error) {
    exportError.value = error.message
    ElMessage.error(`导出失败: ${error.message}`)
  } finally {
    exportLoading.value = false
  }
}

const cleanData = () => {
  if (emails.value.length === 0) {
    ElMessage.warning('暂无邮件数据可清理')
    return
  }

  // 要移除的前缀列表
  const prefixes = [
    '发送方召回邮件:',
    '发送方召回邮件：',
    '【联合收单】',
    'Re:',
    'Re：',
    '回复:',
    '回复：',
    '[SPAM]',
    'Fw:',
    'Fw：',
    '/Sender recalled the mail:',
    '/Sender recalled the mail：',
    '转发:',
    '转发：',
  ]

  // 清理邮件主题
  const cleanedEmails = emails.value.map(email => {
    let cleanedSubject = email.subject
    
    // 1. 去除主题中的全部空格
    cleanedSubject = cleanedSubject.replace(/\s/g, '')
    
    // 2. 循环处理前缀，直到没有前缀可以去除为止（处理重复前缀的情况）
    let hasRemovedPrefix
    do {
      hasRemovedPrefix = false
      
      // 尝试移除每个前缀（前缀也需要去除空格以匹配）
      prefixes.forEach(prefix => {
        const prefixWithoutSpace = prefix.replace(/\s/g, '')
        if (cleanedSubject.startsWith(prefixWithoutSpace)) {
          cleanedSubject = cleanedSubject.substring(prefixWithoutSpace.length)
          hasRemovedPrefix = true
        }
      })
    } while (hasRemovedPrefix)
    
    return {
      ...email,
      subject: cleanedSubject
    }
  })

  // 更新数据
  emails.value = cleanedEmails
  emailStore.setEmails(cleanedEmails, cleanedEmails.length)
  
  ElMessage.success(`成功清理了 ${cleanedEmails.length} 封邮件的主题`)
}

const disconnect = () => {
  emailStore.disconnect()
  router.push('/')
}

onMounted(() => {
  // 如果未连接，跳转到登录页面
  if (!emailStore.connected) {
    router.push('/')
  }
  // 初始化页面数据
  searchForm.keyword = emailStore.searchKeyword
  emails.value = emailStore.emails
  total.value = emailStore.total
})
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.search-card {
   min-height: 95vh;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-result-count {
  margin-bottom: 1px;
  padding: 10px 0 10px 10px;
  color: #606266;
  font-weight: 500;
  text-align: left;
  font-size: 14px;
}

.search-form {
  margin-bottom: 1px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #606266;
}

.export-progress {
  margin-top: 20px;
}

.export-error {
  margin-top: 20px;
}

.email-count {
  margin-top: 20px;
}
</style>
