<template>
  <div class="login-container">
    <el-card title="邮箱服务器配置" class="login-card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="服务器地址" prop="host">
          <el-input v-model="form.host" placeholder="例如: imap.gmail.com"></el-input>
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535"></el-input-number>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="邮箱密码"></el-input>
        </el-form-item>
        <el-form-item label="加密方式">
          <el-radio-group v-model="form.secure">
            <el-radio :label="true">SSL/TLS</el-radio>
            <el-radio :label="false">不加密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="connect" :loading="loading" style="width: 100%">连接</el-button>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
        class="error-alert"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmailStore } from '@/stores/email'
import { ElMessage } from 'element-plus'
import imapService from '@/services/imap'

const router = useRouter()
const emailStore = useEmailStore()
const formRef = ref(null)
const loading = ref(false)
const error = ref('')

const form = reactive({
  host: 'imap.gmail.com',
  port: 993,
  username: '',
  password: '',
  secure: true
})

const rules = reactive({
  host: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const connect = async () => {
  if (!await formRef.value.validate()) return

  loading.value = true
  error.value = ''
  
  try {
    // 保存配置
    emailStore.setConfig(form)
    
    // 连接 IMAP 服务器
    const connection = await imapService.connect(form)
    emailStore.setConnection(connection)
    
    ElMessage.success('连接成功')
    router.push('/search')
  } catch (err) {
    error.value = `连接失败: ${err.message}`
    ElMessage.error(`连接失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 如果已经连接，跳转到搜索页面
  if (emailStore.connected) {
    router.push('/search')
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-alert {
  margin-top: 20px;
}
</style>
