import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { homedir } from 'os'
import fs from 'fs'

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 800,
    height: 670,
    minHeight: 670,
    title: 'MarkFlow',
    show: false,
    frame: false,
    icon: path.join(__dirname, '../../resources/favicon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 监听窗口控制事件
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    mainWindow.maximize()
  })

  ipcMain.on('window-unmaximize', () => {
    mainWindow.unmaximize()
  })

  ipcMain.on('window-maximize-toggle', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  // 添加选择目录的IPC处理程序
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // 添加获取Downloads目录路径的IPC处理程序
  ipcMain.handle('get-downloads-path', async () => {
    const homeDir = homedir()
    const downloadsPath = path.join(homeDir, 'Downloads', 'MarkFlow')
    
    // 如果目录不存在，则创建它
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true })
    }
    
    return downloadsPath
  })

  // 添加打开外部链接的IPC处理程序
  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url)
      return true
    } catch (error) {
      console.error('打开外部链接时出错:', error)
      return false
    }
  })

  // 当窗口最大化状态改变时，通知渲染进程
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })

  // 基于 electron-vite cli 的渲染器 HMR
  // 开发时加载远程 URL，生产时加载本地 html 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// 当 Electron 完成初始化并准备创建浏览器窗口时会调用这个方法
// 某些 API 只能在此事件发生后使用
app.whenReady().then(() => {
  // 为 windows 设置应用用户模型 id
  electronApp.setAppUserModelId('com.electron')

  // 开发中默认通过 F12 打开或关闭 DevTools
  // 生产中忽略 CommandOrControl + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC 测试
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都关闭时退出，macOS 除外。在 macOS 上，应用程序及其菜单栏通常会保持活动状态，直到用户明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中你可以包含应用程序的其余特定主进程代码
// 你也可以将它们放在单独的文件中并通过 require 引入