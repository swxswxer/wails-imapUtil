import { defineStore } from 'pinia'

export const useExportStore = defineStore('export', {
  state: () => ({
    exportFields: ['subject', 'from', 'to', 'date'],
    exportProgress: 0,
    exportStatus: 'idle', // idle, exporting, success, error
    exportError: null,
    fileName: 'emails',
    emails: []
  }),
  actions: {
    setExportFields(fields) {
      this.exportFields = fields
    },
    setExportProgress(progress) {
      this.exportProgress = progress
    },
    setExportStatus(status) {
      this.exportStatus = status
    },
    setExportError(error) {
      this.exportError = error
    },
    setFileName(fileName) {
      this.fileName = fileName
    },
    setEmails(emails) {
      this.emails = emails
    },
    resetExportStatus() {
      this.exportProgress = 0
      this.exportStatus = 'idle'
      this.exportError = null
    }
  }
})
