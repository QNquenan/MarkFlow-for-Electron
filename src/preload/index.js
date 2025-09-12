import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 为渲染进程提供的自定义API
const api = {
  // 隐藏
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  // 最大化
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  // 窗口化
  unmaximizeWindow: () => ipcRenderer.send('window-unmaximize'),
  // 切换窗口最大化
  toggleMaximizeWindow: () => ipcRenderer.send('window-maximize-toggle'),
  // 关闭
  closeWindow: () => ipcRenderer.send('window-close'),
  // 监听窗口最大化事件
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
  onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback)
}

// 仅当启用上下文隔离时，使用 `contextBridge` API
// 将Electron API暴露给渲染进程，否则直接添加到DOM全局对象中
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
