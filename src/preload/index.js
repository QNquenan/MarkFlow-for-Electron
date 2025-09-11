import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 为渲染进程提供的自定义API
const api = {}

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
