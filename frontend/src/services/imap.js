// IMAP 服务，调用后端 Go 实现
import * as App from '../../wailsjs/go/main/App'

class ImapService {
  constructor() {
    this.connected = false
    this.config = null
    this.heartbeatTimer = null
  }

  /**
   * 连接 IMAP 服务器
   * @param {Object} config - 邮箱配置
   * @returns {Promise<Object>} 连接对象
   */
  async connect(config) {
    try {
      // 验证配置
      if (!config.host || !config.username || !config.password) {
        throw new Error('缺少必要的配置信息')
      }

      // 调用后端连接方法
      await App.IMAPConnect(config)

      this.config = config
      this.connected = true
      console.log('IMAP 连接成功:', config)
      
      // 启动心跳机制
      this.startHeartbeat()
      
      return this
    } catch (error) {
      console.error('IMAP 连接失败:', error)
      throw error
    }
  }

  /**
   * 搜索邮件
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  async search(keyword) {
    try {
      if (!this.connected) {
        // 尝试从 store 获取配置并重新连接
        const { useEmailStore } = await import('@/stores/email')
        const emailStore = useEmailStore()
        
        if (emailStore.config.host && emailStore.config.username && emailStore.config.password) {
          console.log('尝试重新连接 IMAP 服务器...')
          await this.connect(emailStore.config)
        } else {
          throw new Error('未连接到 IMAP 服务器')
        }
      }

      // 调用后端搜索方法
      const messages = await App.IMAPSearch(keyword)

      console.log('IMAP 搜索结果:', messages)
      return messages
    } catch (error) {
      console.error('IMAP 搜索失败:', error)
      
      // 检查是否是连接断开错误
      if (error.message.includes('连接已断开') || error.message.includes('未连接到 IMAP 服务器')) {
        this.connected = false
        
        // 尝试从 store 获取配置并重新连接
        const { useEmailStore } = await import('@/stores/email')
        const emailStore = useEmailStore()
        
        if (emailStore.config.host && emailStore.config.username && emailStore.config.password) {
          console.log('尝试重新连接 IMAP 服务器...')
          await this.connect(emailStore.config)
          
          // 重新连接成功后再次执行搜索
          const messages = await App.IMAPSearch(keyword)
          console.log('重新连接后搜索结果:', messages)
          return messages
        }
      }
      
      throw error
    }
  }

  /**
   * 断开连接
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (!this.connected) {
        return
      }

      // 调用后端断开连接方法
      await App.IMAPDisconnect()

      this.connected = false
      this.config = null
      
      // 停止心跳机制
      this.stopHeartbeat()
      
      console.log('IMAP 断开连接')
    } catch (error) {
      console.error('IMAP 断开连接失败:', error)
      throw error
    }
  }

  /**
   * 检查连接状态
   * @returns {Promise<boolean>} 连接是否正常
   */
  async ping() {
    try {
      if (!this.connected) {
        return false
      }

      // 调用后端 ping 方法
      const result = await App.IMAPPing()
      console.log('IMAP 连接状态检查:', result)
      return true
    } catch (error) {
      console.error('IMAP 连接状态检查失败:', error)
      this.connected = false
      return false
    }
  }

  /**
   * 启动心跳机制
   * @param {number} interval - 心跳间隔（毫秒）
   */
  startHeartbeat(interval = 30000) {
    // 清除之前的心跳定时器
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    // 启动新的心跳定时器
    this.heartbeatTimer = setInterval(async () => {
      try {
        if (this.connected) {
          await this.ping()
        }
      } catch (error) {
        console.error('心跳检查失败:', error)
      }
    }, interval)

    console.log('IMAP 心跳机制已启动，间隔:', interval, 'ms')
  }

  /**
   * 停止心跳机制
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
      console.log('IMAP 心跳机制已停止')
    }
  }
}

// 导出单例
export default new ImapService()
