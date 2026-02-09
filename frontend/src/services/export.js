import * as XLSX from 'xlsx'
import * as backend from '../../wailsjs/go/main/App'

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
    return new Promise(async (resolve, reject) => {
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

        // 生成 Excel 文件数据
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const data = new Uint8Array(excelBuffer)

        // 调用后端保存文件对话框
        let filePath
        try {
          if (!backend.SaveFileDialog) {
            throw new Error('后端方法 SaveFileDialog 不可用')
          }
          
          filePath = await backend.SaveFileDialog(`${fileName}.xlsx`)
          
          console.log('SaveFileDialog 返回值:', filePath)
          
          if (!filePath) {
            throw new Error('用户取消了保存操作')
          }
        } catch (dialogError) {
          console.error('文件保存对话框错误:', dialogError)
          reject(new Error(`文件选择失败: ${dialogError.message || JSON.stringify(dialogError)}`))
          return
        }

        // 调用后端保存文件
        try {
          if (!backend.SaveFile) {
            throw new Error('后端方法 SaveFile 不可用')
          }
          
          console.log('准备调用 SaveFile:', filePath, data.length)
          
          const result = await backend.SaveFile(filePath, Array.from(data))
          
          console.log('SaveFile 返回值:', result)
          
        } catch (saveError) {
          console.error('文件保存错误:', saveError)
          reject(new Error(`文件保存失败: ${saveError.message || JSON.stringify(saveError)}`))
          return
        }

        console.log('Excel 导出成功:', {
          fileName: filePath,
          emailCount: emails.length,
          fields: fields
        })

        resolve(filePath)
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
    return new Promise(async (resolve, reject) => {
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

        // 生成 CSV 文件数据
        const encoder = new TextEncoder()
        const data = encoder.encode(csvContent)

        // 调用后端保存文件对话框
        let filePath
        try {
          if (!backend.SaveFileDialog) {
            throw new Error('后端方法 SaveFileDialog 不可用')
          }
          
          filePath = await backend.SaveFileDialog(`${fileName}.csv`)
          
          console.log('SaveFileDialog 返回值:', filePath)
          
          if (!filePath) {
            throw new Error('用户取消了保存操作')
          }
        } catch (dialogError) {
          console.error('文件保存对话框错误:', dialogError)
          reject(new Error(`文件选择失败: ${dialogError.message || JSON.stringify(dialogError)}`))
          return
        }

        // 调用后端保存文件
        try {
          if (!backend.SaveFile) {
            throw new Error('后端方法 SaveFile 不可用')
          }
          
          console.log('准备调用 SaveFile:', filePath, data.length)
          
          const result = await backend.SaveFile(filePath, Array.from(data))
          
          console.log('SaveFile 返回值:', result)
          
        } catch (saveError) {
          console.error('文件保存错误:', saveError)
          reject(new Error(`文件保存失败: ${saveError.message || JSON.stringify(saveError)}`))
          return
        }

        console.log('CSV 导出成功:', {
          fileName: filePath,
          emailCount: emails.length,
          fields: fields
        })

        resolve(filePath)
      } catch (error) {
        console.error('CSV 导出失败:', error)
        reject(error)
      }
    })
  }
}

// 导出单例
export default new ExportService()
