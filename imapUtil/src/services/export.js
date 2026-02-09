import * as XLSX from 'xlsx'

// 导出服务，用于将邮件数据导出为 Excel 文件
class ExportService {
  /**
   * 将邮件数据导出为 Excel 文件
   * @param {Array} emails - 邮件数据数组
   * @param {Array} fields - 要导出的字段
   * @param {string} fileName - 导出文件的名称
   * @returns {Promise<boolean>} 导出是否成功
   */
  async exportToExcel(emails, fields, fileName = 'emails') {
    return new Promise((resolve, reject) => {
      try {
        // 验证参数
        if (!Array.isArray(emails) || emails.length === 0) {
          throw new Error('没有可导出的邮件数据')
        }

        if (!Array.isArray(fields) || fields.length === 0) {
          throw new Error('请选择要导出的字段')
        }

        // 准备导出数据
        const exportData = emails.map(email => {
          const row = {}
          fields.forEach(field => {
            // 处理不同字段的显示
            switch (field) {
              case 'subject':
                row['主题'] = email.subject || ''
                break
              case 'from':
                row['发件人'] = email.from || ''
                break
              case 'to':
                row['收件人'] = email.to || ''
                break
              case 'date':
                row['日期'] = email.date ? new Date(email.date).toLocaleString() : ''
                break
              default:
                row[field] = email[field] || ''
            }
          })
          return row
        })

        // 创建工作簿和工作表
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '邮件数据')

        // 生成 Excel 文件并下载
        XLSX.writeFile(workbook, `${fileName}.xlsx`)

        console.log('Excel 导出成功:', {
          fileName: `${fileName}.xlsx`,
          emailCount: emails.length,
          fields: fields
        })

        resolve(true)
      } catch (error) {
        console.error('Excel 导出失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 将数据导出为 CSV 文件
   * @param {Array} emails - 邮件数据数组
   * @param {Array} fields - 要导出的字段
   * @param {string} fileName - 导出文件的名称
   * @returns {Promise<boolean>} 导出是否成功
   */
  async exportToCSV(emails, fields, fileName = 'emails') {
    return new Promise((resolve, reject) => {
      try {
        // 验证参数
        if (!Array.isArray(emails) || emails.length === 0) {
          throw new Error('没有可导出的邮件数据')
        }

        if (!Array.isArray(fields) || fields.length === 0) {
          throw new Error('请选择要导出的字段')
        }

        // 准备导出数据
        const exportData = emails.map(email => {
          const row = {}
          fields.forEach(field => {
            row[field] = email[field] || ''
          })
          return row
        })

        // 创建工作簿和工作表
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const csvContent = XLSX.utils.sheet_to_csv(worksheet)

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('CSV 导出成功:', {
          fileName: `${fileName}.csv`,
          emailCount: emails.length,
          fields: fields
        })

        resolve(true)
      } catch (error) {
        console.error('CSV 导出失败:', error)
        reject(error)
      }
    })
  }
}

// 导出单例
export default new ExportService()
