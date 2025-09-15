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
  onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback),
  // 选择目录
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  // 获取Downloads目录下的MarkFlow文件夹路径
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  // 选择图片文件
  selectImageFiles: () => ipcRenderer.invoke('select-image-files'),
  // 读取本地图片文件并转换为DataURL
  readImageAsDataURL: (filePath) => ipcRenderer.invoke('read-image-as-data-url', filePath),
  // 获取文件大小
  getFileSize: (filePath) => ipcRenderer.invoke('get-file-size', filePath),
  // 处理拖拽文件
  getDraggedFiles: (files) => ipcRenderer.invoke('get-dragged-files', files),
  // 添加水印并导出图片
  addWatermarkAndExport: (options) => ipcRenderer.invoke('add-watermark-and-export', options),
  // 打开外部链接
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
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