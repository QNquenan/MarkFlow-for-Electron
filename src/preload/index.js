import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 为渲染进程提供的自定义API
const api = {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  unmaximizeWindow: () => ipcRenderer.send('window-unmaximize'),
  toggleMaximizeWindow: () => ipcRenderer.send('window-maximize-toggle'),
  closeWindow: () => ipcRenderer.send('window-close'),
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
  onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback),
  
  // 文件操作
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  selectImageFiles: () => ipcRenderer.invoke('select-image-files'),
  readImageAsDataURL: (filePath) => ipcRenderer.invoke('read-image-as-data-url', filePath),
  getFileSize: (filePath) => ipcRenderer.invoke('get-file-size', filePath),
  getDraggedFiles: (files) => ipcRenderer.invoke('get-dragged-files', files),
  
  // 水印处理
  addWatermarkAndExport: (options) => ipcRenderer.invoke('add-watermark-and-export', options),
  
  // 其他
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
}

// 暴露API给渲染进程
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