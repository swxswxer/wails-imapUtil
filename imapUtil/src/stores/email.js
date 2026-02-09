import { defineStore } from 'pinia'

export const useEmailStore = defineStore('email', {
  state: () => ({
    connection: null,
    connected: false,
    emails: [],
    total: 0,
    loading: false,
    error: null,
    searchKeyword: '',
    currentPage: 1,
    pageSize: 20,
    // 邮箱配置
    config: {
      host: '',
      port: 993,
      username: '',
      password: '',
      secure: true
    }
  }),
  actions: {
    setConfig(config) {
      this.config = { ...this.config, ...config }
    },
    setConnection(connection) {
      this.connection = connection
      this.connected = true
    },
    setEmails(emails, total) {
      this.emails = emails
      this.total = total
    },
    setLoading(loading) {
      this.loading = loading
    },
    setError(error) {
      this.error = error
    },
    setPage(page, pageSize) {
      this.currentPage = page
      this.pageSize = pageSize
    },
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword
    },
    disconnect() {
      this.connection = null
      this.connected = false
      this.emails = []
      this.total = 0
      this.error = null
    }
  }
})
