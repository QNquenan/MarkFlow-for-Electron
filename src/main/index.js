import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { homedir } from 'os'
import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'
import piexif from 'piexifjs'

// 启动参数优化
app.commandLine.appendSwitch('disable-gpu-cache')
app.commandLine.appendSwitch('disk-cache-size', '1048576')
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

  // 窗口控制事件
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

  // 文件选择和处理
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('get-downloads-path', async () => {
    const homeDir = homedir()
    const downloadsPath = path.join(homeDir, 'Downloads', 'MarkFlow')

    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true })
    }

    return downloadsPath
  })

  ipcMain.handle('select-image-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths
    }
    return []
  })

  ipcMain.handle('read-image-as-data-url', async (event, filePath) => {
    try {
      const fileBuffer = fs.readFileSync(filePath)
      const ext = path.extname(filePath).toLowerCase().slice(1)
      let mimeType = 'image/png'
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'

      const base64String = fileBuffer.toString('base64')
      const dataURL = `data:${mimeType};base64,${base64String}`

      return dataURL
    } catch (error) {
      console.error('读取图片文件失败:', error)
      return null
    }
  })

  ipcMain.handle('get-file-size', async (event, filePath) => {
    try {
      const stats = fs.statSync(filePath)
      return stats.size
    } catch (error) {
      console.error('获取文件大小失败:', error)
      return 0
    }
  })

  ipcMain.handle('get-dragged-files', async () => {
    return []
  })

  // 添加水印并导出图片
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
        const decodedImagePath = decodeURIComponent(imagePath)
        originalImageBuffer = fs.readFileSync(decodedImagePath)
        image = await loadImage(decodedImagePath)
      } else {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
        originalImageBuffer = Buffer.from(base64Data, 'base64')
        image = await loadImage(imageData)
      }

      // 创建画布
      const canvas = createCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')

      // 绘制原图
      ctx.drawImage(image, 0, 0)

      // 绘制水印
      if (watermarkData) {
        const watermark = await loadImage(watermarkData)

        // 计算水印尺寸
        const watermarkScale = scale / 100
        const imageDiagonal = Math.sqrt(image.width * image.width + image.height * image.height)
        const watermarkDiagonal = Math.sqrt(
          watermark.width * watermark.width + watermark.height * watermark.height
        )
        const watermarkWidth =
          (watermark.width * (imageDiagonal * watermarkScale)) / watermarkDiagonal
        const watermarkHeight =
          (watermark.height * (imageDiagonal * watermarkScale)) / watermarkDiagonal

        // 计算水印位置
        let posX, posY
        switch (position) {
          case 'top-left':
            posX = 10 + watermarkWidth / 2
            posY = 10 + watermarkHeight / 2
            break
          case 'top-right':
            posX = image.width - 10 - watermarkWidth / 2
            posY = 10 + watermarkHeight / 2
            break
          case 'bottom-left':
            posX = 10 + watermarkWidth / 2
            posY = image.height - 10 - watermarkHeight / 2
            break
          case 'bottom-right':
            posX = image.width - 10 - watermarkWidth / 2
            posY = image.height - 10 - watermarkHeight / 2
            break
          case 'center':
            posX = image.width / 2
            posY = image.height / 2
            break
          case 'custom':
            posX = (image.width * x) / 100
            posY = (image.height * y) / 100
            break
          default:
            posX = image.width - 10 - watermarkWidth / 2
            posY = image.height - 10 - watermarkHeight / 2
        }

        // 调整位置确保水印不会超出边界
        posX = Math.max(watermarkWidth / 2, Math.min(posX, image.width - watermarkWidth / 2))
        posY = Math.max(watermarkHeight / 2, Math.min(posY, image.height - watermarkHeight / 2))
        
        const drawX = posX - watermarkWidth / 2
        const drawY = posY - watermarkHeight / 2

        // 自动反色处理
        if (isFanse) {
          const imageData = ctx.getImageData(
            drawX,
            drawY,
            Math.min(watermarkWidth, image.width - drawX),
            Math.min(watermarkHeight, image.height - drawY)
          )
          const data = imageData.data

          let totalBrightness = 0
          let count = 0

          for (let i = 0; i < data.length; i += 4 * 10) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b
            totalBrightness += brightness
            count++
          }

          const averageBrightness = count > 0 ? totalBrightness / count : 0

          if (averageBrightness < 128) {
            ctx.fillStyle = 'white'
          } else {
            ctx.fillStyle = 'black'
          }

          const watermarkCanvas = createCanvas(watermarkWidth, watermarkHeight)
          const watermarkCtx = watermarkCanvas.getContext('2d')

          watermarkCtx.drawImage(watermark, 0, 0, watermarkWidth, watermarkHeight)
          const watermarkImageData = watermarkCtx.getImageData(
            0,
            0,
            watermarkWidth,
            watermarkHeight
          )
          const watermarkDataArray = watermarkImageData.data

          for (let i = 0; i < watermarkDataArray.length; i += 4) {
            if (watermarkDataArray[i + 3] > 0) {
              watermarkDataArray[i] = parseInt(ctx.fillStyle.slice(1), 16) >> 16
              watermarkDataArray[i + 1] = (parseInt(ctx.fillStyle.slice(1), 16) >> 8) & 0xff
              watermarkDataArray[i + 2] = parseInt(ctx.fillStyle.slice(1), 16) & 0xff
            }
          }

          watermarkCtx.putImageData(watermarkImageData, 0, 0)

          ctx.globalAlpha = opacity / 100 || 1.0
          ctx.drawImage(watermarkCanvas, drawX, drawY)
        } else {
          ctx.globalAlpha = opacity / 100 || 1.0
          ctx.drawImage(watermark, drawX, drawY, watermarkWidth, watermarkHeight)
        }
      }

      ctx.globalAlpha = 1.0

      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true })
      }

      // 导出图片
      let buffer
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()

      if (fileExt === 'png' || fileName.includes('.png')) {
        buffer = canvas.toBuffer('image/png', {
          compressionLevel: 6,
          filters: canvas.PNG_FILTER_SUB
        })
      } else {
        buffer = canvas.toBuffer('image/jpeg', {
          quality: 1
        })

        // 保留EXIF信息
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
            const exifObj = piexif.load(originalImageBuffer.toString('binary'))

            if (exifObj) {
              if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Orientation]) {
                delete exifObj['0th'][piexif.ImageIFD.Orientation]
              }
              
              const newJpegWithExif = piexif.insert(piexif.dump(exifObj), buffer.toString('binary'))
              buffer = Buffer.from(newJpegWithExif, 'binary')
            }
          } catch (exifError) {
            console.warn('处理EXIF信息时出错:', exifError)
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

  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url)
      return true
    } catch (error) {
      console.error('打开外部链接时出错:', error)
      return false
    }
  })

  // 窗口状态变化通知
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/' })
  }

  return mainWindow
}

// 应用准备就绪
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})