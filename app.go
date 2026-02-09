package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	imapClient  *client.Client
	imapConfig  map[string]interface{}
	imapConnected bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// 设置窗口标题
	runtime.WindowSetTitle(ctx, "乐刷邮件工具")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// SaveFileDialog shows a file save dialog and returns the selected path
func (a *App) SaveFileDialog(defaultName string) (string, error) {
	options := runtime.SaveDialogOptions{
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel Files (*.xlsx)",
				Pattern:     "*.xlsx",
			},
			{
				DisplayName: "CSV Files (*.csv)",
				Pattern:     "*.csv",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	}

	path, err := runtime.SaveFileDialog(a.ctx, options)
	if err != nil {
		return "", err
	}

	return path, nil
}

// SaveFile saves data to the specified file path
func (a *App) SaveFile(filePath string, data []byte) error {
	// 打印详细信息用于调试
	fmt.Printf("SaveFile 被调用，文件路径: %s, 数据长度: %d\n", filePath, len(data))
	
	// 检查文件路径是否为空
	if filePath == "" {
		return fmt.Errorf("文件路径为空")
	}
	
	// 检查数据是否为空
	if len(data) == 0 {
		return fmt.Errorf("文件数据为空")
	}
	
	// Ensure the directory exists
	dir := filepath.Dir(filePath)
	fmt.Printf("目标目录: %s\n", dir)
	
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Printf("创建目录失败: %v\n", err)
		return fmt.Errorf("创建目录失败: %v", err)
	}

	// 直接尝试写入文件，不进行权限测试
	// 因为在某些环境中，权限测试可能会失败但实际写入文件可能成功
	fmt.Printf("开始写入文件: %s\n", filePath)
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		fmt.Printf("写入文件失败: %v\n", err)
		return fmt.Errorf("写入文件失败: %v", err)
	}

	fmt.Printf("文件保存成功: %s\n", filePath)
	return nil
}

// IMAPConnect connects to an IMAP server
func (a *App) IMAPConnect(config map[string]interface{}) (bool, error) {
	// Validate config
	host, ok := config["host"].(string)
	if !ok || host == "" {
		return false, fmt.Errorf("缺少必要的配置信息: host")
	}

	username, ok := config["username"].(string)
	if !ok || username == "" {
		return false, fmt.Errorf("缺少必要的配置信息: username")
	}

	password, ok := config["password"].(string)
	if !ok || password == "" {
		return false, fmt.Errorf("缺少必要的配置信息: password")
	}

	// 处理端口配置
	if port, ok := config["port"]; ok {
		// 将端口添加到host中
		switch v := port.(type) {
		case float64:
			host = fmt.Sprintf("%s:%d", host, int(v))
		case int:
			host = fmt.Sprintf("%s:%d", host, v)
		case string:
			if v != "" {
				host = fmt.Sprintf("%s:%s", host, v)
			}
		}
	}

	// Connect to server
	c, err := client.DialTLS(host, nil)
	if err != nil {
		return false, fmt.Errorf("连接IMAP服务器失败: %v", err)
	}

	// Login
	if err := c.Login(username, password); err != nil {
		c.Logout()
		return false, fmt.Errorf("登录IMAP服务器失败: %v", err)
	}

	// Save client and config
	a.imapClient = c
	a.imapConfig = config
	a.imapConnected = true

	return true, nil
}

// IMAPDisconnect disconnects from the IMAP server
func (a *App) IMAPDisconnect() (bool, error) {
	if !a.imapConnected || a.imapClient == nil {
		return false, fmt.Errorf("未连接到IMAP服务器")
	}

	if err := a.imapClient.Logout(); err != nil {
		return false, fmt.Errorf("断开IMAP连接失败: %v", err)
	}

	// Reset state
	a.imapClient = nil
	a.imapConfig = nil
	a.imapConnected = false

	return true, nil
}

// IMAPPing checks if the IMAP connection is still alive
func (a *App) IMAPPing() (bool, error) {
	if !a.imapConnected || a.imapClient == nil {
		return false, fmt.Errorf("未连接到IMAP服务器")
	}

	// Try to NOOP command to check connection
	if err := a.imapClient.Noop(); err != nil {
		// Connection is dead, reset state
		a.imapClient = nil
		a.imapConnected = false
		return false, fmt.Errorf("连接已断开: %v", err)
	}

	return true, nil
}

// IMAPSearch searches emails by keyword
func (a *App) IMAPSearch(keyword string) ([]map[string]interface{}, error) {
	if !a.imapConnected || a.imapClient == nil {
		return nil, fmt.Errorf("未连接到IMAP服务器")
	}

	// Select INBOX
	_, err := a.imapClient.Select("INBOX", false)
	if err != nil {
		// 连接可能已断开，重置状态
		a.imapClient = nil
		a.imapConnected = false
		return nil, fmt.Errorf("连接已断开: %v", err)
	}

	// Search criteria
	criteria := imap.NewSearchCriteria()
	// 使用Header设置主题搜索
	criteria.Header.Add("Subject", keyword)

	// Search
	ids, err := a.imapClient.Search(criteria)
	if err != nil {
		// 连接可能已断开，重置状态
		a.imapClient = nil
		a.imapConnected = false
		return nil, fmt.Errorf("连接已断开: %v", err)
	}

	// Get messages
	var messages []map[string]interface{}
	if len(ids) > 0 {
		seqset := new(imap.SeqSet)
		seqset.AddNum(ids...)

		// Fetch messages
		messages = make([]map[string]interface{}, 0, len(ids))
		ch := make(chan *imap.Message)
		go func() {
			err = a.imapClient.Fetch(seqset, []imap.FetchItem{imap.FetchEnvelope}, ch)
			if err != nil {
				// 连接可能已断开，重置状态
				a.imapClient = nil
				a.imapConnected = false
				return
			}
		}()

		for msg := range ch {
			envelope := msg.Envelope
			if envelope != nil {
				message := map[string]interface{}{
					"id":      msg.SeqNum,
					"subject": envelope.Subject,
					"date":    envelope.Date.Format(time.RFC3339),
				}
				messages = append(messages, message)
			}
		}
	}

	return messages, nil
}
