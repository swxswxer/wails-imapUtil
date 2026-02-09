// 模拟 IMAP 服务，用于演示
// 实际使用中需要在 Tauri 环境中使用 node-imap 或 imapflow 库
class ImapService {
  constructor() {
    this.connected = false
    this.config = null
    // 模拟邮件数据
    this.mockEmails = [
      {
        id: '1',
        subject: '测试邮件 1',
        from: 'sender1@example.com',
        to: 'recipient@example.com',
        date: new Date('2024-01-01T10:00:00'),
        body_preview: '这是测试邮件 1 的内容预览'
      },
      {
        id: '2',
        subject: '测试邮件 2',
        from: 'sender2@example.com',
        to: 'recipient@example.com',
        date: new Date('2024-01-02T11:00:00'),
        body_preview: '这是测试邮件 2 的内容预览'
      },
      {
        id: '3',
        subject: '重要通知',
        from: 'admin@example.com',
        to: 'recipient@example.com',
        date: new Date('2024-01-03T12:00:00'),
        body_preview: '这是重要通知的内容预览'
      },
      {
        id: '4',
        subject: '会议安排',
        from: 'manager@example.com',
        to: 'recipient@example.com',
        date: new Date('2024-01-04T13:00:00'),
        body_preview: '这是会议安排的内容预览'
      },
      {
        id: '5',
        subject: '项目进度',
        from: 'developer@example.com',
        to: 'recipient@example.com',
        date: new Date('2024-01-05T14:00:00'),
        body_preview: '这是项目进度的内容预览'
      }
    ]
  }

  /**
   * 连接 IMAP 服务器
   * @param {Object} config - 邮箱配置
   * @returns {Promise<Object>} 连接对象
   */
  async connect(config) {
    return new Promise((resolve, reject) => {
      // 模拟连接延迟
      setTimeout(() => {
        try {
          // 验证配置
          if (!config.host || !config.username || !config.password) {
            throw new Error('缺少必要的配置信息')
          }

          this.config = config
          this.connected = true
          console.log('IMAP 连接成功:', config)
          resolve(this)
        } catch (error) {
          console.error('IMAP 连接失败:', error)
          reject(error)
        }
      }, 1000)
    })
  }

  /**
   * 搜索邮件
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise<Object>} 搜索结果
   */
  async search(keyword, page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
      // 模拟搜索延迟
      setTimeout(() => {
        try {
          if (!this.connected) {
            throw new Error('未连接到 IMAP 服务器')
          }

          // 模拟搜索逻辑
          const filteredEmails = this.mockEmails.filter(email => 
            email.subject.toLowerCase().includes(keyword.toLowerCase())
          )

          // 分页处理
          const start = (page - 1) * pageSize
          const end = start + pageSize
          const paginatedEmails = filteredEmails.slice(start, end)

          console.log('IMAP 搜索结果:', {
            total: filteredEmails.length,
            emails: paginatedEmails,
            page,
            pageSize
          })

          resolve({
            total: filteredEmails.length,
            emails: paginatedEmails,
            page,
            pageSize
          })
        } catch (error) {
          console.error('IMAP 搜索失败:', error)
          reject(error)
        }
      }, 1000)
    })
  }

  /**
   * 断开连接
   * @returns {Promise<void>}
   */
  async disconnect() {
    return new Promise((resolve) => {
      // 模拟断开连接延迟
      setTimeout(() => {
        this.connected = false
        this.config = null
        console.log('IMAP 断开连接')
        resolve()
      }, 500)
    })
  }
}

// 导出单例
export default new ImapService()
