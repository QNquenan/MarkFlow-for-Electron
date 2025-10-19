import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { homedir } from 'os'
import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'
import piexif from 'piexifjs'

// 添加一些启动参数来减少缓存错误
app.commandLine.appendSwitch('disable-gpu-cache')
app.commandLine.appendSwitch('disk-cache-size', '1048576') // 1MB缓存大小
app.commandLine.appendSwitch('disable-http-cache')

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

  // 添加选择图片文件的IPC处理程序
  ipcMain.handle('select-image-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths
    }
    return []
  })

  // 添加读取本地图片文件并转换为DataURL的IPC处理程序
  ipcMain.handle('read-image-as-data-url', async (event, filePath) => {
    try {
      // 读取文件
      const fileBuffer = fs.readFileSync(filePath)

      // 获取文件扩展名
      const ext = path.extname(filePath).toLowerCase().slice(1)

      // 确定MIME类型
      let mimeType = 'image/png'
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
      else if (ext === 'gif') mimeType = 'image/gif'
      else if (ext === 'bmp') mimeType = 'image/bmp'
      else if (ext === 'webp') mimeType = 'image/webp'

      // 转换为DataURL
      const base64String = fileBuffer.toString('base64')
      const dataURL = `data:${mimeType};base64,${base64String}`

      return dataURL
    } catch (error) {
      console.error('读取图片文件失败:', error)
      return null
    }
  })

  // 添加获取文件大小的IPC处理程序
  ipcMain.handle('get-file-size', async (event, filePath) => {
    try {
      const stats = fs.statSync(filePath)
      return stats.size
    } catch (error) {
      console.error('获取文件大小失败:', error)
      return 0
    }
  })

  // 添加处理拖拽文件的IPC处理程序
  ipcMain.handle('get-dragged-files', async () => {
    // 在Electron中，我们无法直接从拖拽事件获取文件路径
    // 但可以通过特定的方法实现，这里简化处理
    return []
  })

  // 添加添加水印并导出图片的IPC处理程序
  ipcMain.handle('add-watermark-and-export', async (event, options) => {
    try {
      const {
        imagePath,
        imageData,
        watermarkData,
        exportPath,
        fileName,
        position,
        opacity,
        scale,
        x,
        y,
        isFanse
      } = options

      // 加载原图
      let image
      let originalImageBuffer = null
      if (imagePath) {
        // 对文件路径进行解码
        const decodedImagePath = decodeURIComponent(imagePath)
        // 从文件路径加载图片
        originalImageBuffer = fs.readFileSync(decodedImagePath)
        image = await loadImage(decodedImagePath)
      } else {
        // 从base64数据加载图片
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
        originalImageBuffer = Buffer.from(base64Data, 'base64')
        image = await loadImage(imageData)
      }

      // 创建画布
      const canvas = createCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')

      // 绘制原图
      ctx.drawImage(image, 0, 0)

      // 如果有水印，则绘制水印
      if (watermarkData) {
        const watermark = await loadImage(watermarkData)

        // 计算水印尺寸（根据scale参数调整）
        const watermarkScale = scale / 100
        const watermarkWidth = watermark.width * watermarkScale
        const watermarkHeight = watermark.height * watermarkScale

        // 计算水印位置
        let posX, posY
        switch (position) {
          case 'top-left':
            posX = 10
            posY = 10
            break
          case 'top-right':
            posX = image.width - watermarkWidth - 10
            posY = 10
            break
          case 'bottom-left':
            posX = 10
            posY = image.height - watermarkHeight - 10
            break
          case 'bottom-right':
            posX = image.width - watermarkWidth - 10
            posY = image.height - watermarkHeight - 10
            break
          case 'center':
            posX = (image.width - watermarkWidth) / 2
            posY = (image.height - watermarkHeight) / 2
            break
          case 'custom':
            // 使用自定义位置
            posX = (image.width * x) / 100 - watermarkWidth / 2
            posY = (image.height * y) / 100 - watermarkHeight / 2
            break
          default:
            posX = image.width - watermarkWidth - 10
            posY = image.height - watermarkHeight - 10
        }

        // 确保水印不会超出图片边界
        posX = Math.max(0, Math.min(posX, image.width - watermarkWidth))
        posY = Math.max(0, Math.min(posY, image.height - watermarkHeight))

        // 检查是否需要根据背景明暗调整水印颜色
        if (isFanse) {
          // 获取水印区域的图像数据
          const imageData = ctx.getImageData(
            posX,
            posY,
            Math.min(watermarkWidth, image.width - posX),
            Math.min(watermarkHeight, image.height - posY)
          )
          const data = imageData.data

          // 计算平均亮度
          let totalBrightness = 0
          let count = 0

          // 采样计算亮度，提高性能
          for (let i = 0; i < data.length; i += 4 * 10) {
            // 每10个像素取一个样本
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b
            totalBrightness += brightness
            count++
          }

          const averageBrightness = count > 0 ? totalBrightness / count : 0

          // 如果背景较暗，使用白色水印；如果背景较亮，使用黑色水印
          if (averageBrightness < 128) {
            // 背景较暗，使用白色水印
            ctx.fillStyle = 'white'
          } else {
            // 背景较亮，使用黑色水印
            ctx.fillStyle = 'black'
          }

          // 创建新的水印canvas
          const watermarkCanvas = createCanvas(watermarkWidth, watermarkHeight)
          const watermarkCtx = watermarkCanvas.getContext('2d')

          // 在新的canvas上绘制水印并应用颜色
          watermarkCtx.drawImage(watermark, 0, 0, watermarkWidth, watermarkHeight)
          const watermarkImageData = watermarkCtx.getImageData(
            0,
            0,
            watermarkWidth,
            watermarkHeight
          )
          const watermarkDataArray = watermarkImageData.data

          // 修改水印颜色
          for (let i = 0; i < watermarkDataArray.length; i += 4) {
            // 只改变颜色，保持透明度
            if (watermarkDataArray[i + 3] > 0) {
              // 如果不是完全透明
              watermarkDataArray[i] = parseInt(ctx.fillStyle.slice(1), 16) >> 16 // R
              watermarkDataArray[i + 1] = (parseInt(ctx.fillStyle.slice(1), 16) >> 8) & 0xff // G
              watermarkDataArray[i + 2] = parseInt(ctx.fillStyle.slice(1), 16) & 0xff // B
            }
          }

          // 将修改后的水印放回canvas
          watermarkCtx.putImageData(watermarkImageData, 0, 0)

          // 设置透明度（默认为不透明）
          ctx.globalAlpha = opacity / 100 || 1.0

          // 绘制修改后的水印
          ctx.drawImage(watermarkCanvas, posX, posY)
        } else {
          // 设置透明度（默认为不透明）
          ctx.globalAlpha = opacity / 100 || 1.0

          // 绘制水印
          ctx.drawImage(watermark, posX, posY, watermarkWidth, watermarkHeight)
        }
      }

      // 重置透明度
      ctx.globalAlpha = 1.0

      // 确保导出目录存在
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true })
      }

      // 导出图片，保持较好的质量但控制文件大小
      let buffer
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()

      if (fileExt === 'png' || fileName.includes('.png')) {
        // PNG格式导出
        buffer = canvas.toBuffer('image/png', {
          compressionLevel: 6, // 压缩级别 0-9，6是默认值
          filters: canvas.PNG_FILTER_SUB // 使用SUB过滤器
        })
      } else {
        // JPEG格式导出
        buffer = canvas.toBuffer('image/jpeg', {
          quality: 1 // JPEG质量 0-1，0.9是高质量
        })

        // 如果有原始图片且是JPEG格式，则尝试保留EXIF信息
        if (
          originalImageBuffer &&
          ((imagePath &&
            (imagePath.toLowerCase().endsWith('.jpg') ||
              imagePath.toLowerCase().endsWith('.jpeg'))) ||
            (!imagePath &&
              imageData &&
              (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg'))))
        ) {
          try {
            // 直接使用piexifjs处理EXIF
            const exifObj = piexif.load(originalImageBuffer.toString('binary'))

            if (exifObj) {
              // 直接在原始buffer上操作，避免再次压缩
              const newJpegWithExif = piexif.insert(piexif.dump(exifObj), buffer.toString('binary'))
              buffer = Buffer.from(newJpegWithExif, 'binary')
            }
          } catch (exifError) {
            console.warn('处理EXIF信息时出错:', exifError)
            // 如果EXIF处理失败，使用已生成的buffer
          }
        }
      }

      const outputPath = path.join(exportPath, fileName)
      fs.writeFileSync(outputPath, buffer)

      return { success: true, outputPath }
    } catch (error) {
      console.error('添加水印并导出图片失败:', error)
      return { success: false, error: error.message }
    }
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
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/' })
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
