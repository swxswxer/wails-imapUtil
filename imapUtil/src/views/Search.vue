<template>
  <div class="search-container">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>邮件搜索</span>
          <el-button type="primary" @click="exportEmails" :disabled="emails.length === 0">导出为 Excel</el-button>
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
      
      <el-table :data="emails" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="subject" label="主题" min-width="300"></el-table-column>
        <el-table-column prop="from" label="发件人" min-width="180"></el-table-column>
        <el-table-column prop="to" label="收件人" min-width="180"></el-table-column>
        <el-table-column prop="date" label="日期" min-width="150">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <div class="empty-state" v-if="!loading && emails.length === 0">
        <el-empty description="暂无邮件数据" :image-size="200" />
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
import imapService from '@/services/imap'
import dayjs from 'dayjs'

const router = useRouter()
const emailStore = useEmailStore()
const exportStore = useExportStore()

const searchForm = reactive({
  keyword: ''
})

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const emails = ref([])

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
    const result = await imapService.search(searchForm.keyword, currentPage.value, pageSize.value)
    emails.value = result.emails
    total.value = result.total
    emailStore.setEmails(result.emails, result.total)
    emailStore.setSearchKeyword(searchForm.keyword)
    emailStore.setPage(currentPage.value, pageSize.value)
  } catch (error) {
    ElMessage.error(`搜索失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  search()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  search()
}

const exportEmails = () => {
  exportStore.setEmails(emails.value)
  router.push('/export')
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
  currentPage.value = emailStore.currentPage
  pageSize.value = emailStore.pageSize
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
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
</style>
