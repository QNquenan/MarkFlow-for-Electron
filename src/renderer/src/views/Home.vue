<template>
  <div class="page">
    <div
      class="updata"
      :class="{ nodisplay: isUpdata }"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <div v-if="!isUpdata" class="upImg" @click="importImages">
        <div class="upImgBtn">
          <UploadFilled />
          <div class="upText">点击上传/拖入上传</div>
        </div>
      </div>
      <div v-else class="imgBox">
        <div
          class="imgItem btnHover"
          v-for="(image, index) in uploadedImages"
          :key="index"
          @contextmenu.prevent="openImageContextMenu($event, index)"
        >
          <div class="img">
            <img :src="image.url" :alt="image.name" />
          </div>
          <div class="imgInfo">
            <div class="imgName">{{ image.name }}</div>
            <div class="imgSize">{{ formatFileSize(image.size) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片右键菜单 -->
    <div
      v-if="showImageContextMenu"
      class="context-menu"
      :style="{ top: imageContextMenuPosition.y + 'px', left: imageContextMenuPosition.x + 'px' }"
      @click="hideImageContextMenu"
    >
      <div class="context-menu-item" @click="handleDeleteImage">删除</div>
    </div>

    <div class="dataBox">
      <div class="dataInput">
        <div class="inputBox">
          <div class="inputItem">
            <label>水印缩放</label>
            <input v-model="wateScale" type="text" placeholder="请输入水印缩放倍数" />
          </div>
        </div>

        <div class="inputBox">
          <div class="inputItem">
            <label>水印的X轴高度</label>
            <div class="rangeText">
              <input v-model="wateX" type="text" placeholder="请输入水印X轴高度" />
              <span>%</span>
            </div>
            <input v-model="wateX" class="slider" type="range" min="0" max="100" step="1" />
          </div>

          <div class="inputItem">
            <label>水印的Y轴高度</label>
            <div class="rangeText">
              <input v-model="wateY" type="text" placeholder="请输入水印Y轴高度" />
              <span>%</span>
            </div>
            <input v-model="wateY" class="slider" type="range" min="0" max="100" step="1" />
          </div>
        </div>

        <div class="inputBox">
          <div class="inputItem">
            <button class="dinger" @click="resetWatermarkSettings">重置</button>
          </div>
          <div class="inputItem">
            <button @click="clearUploadedImages">清空图片列表</button>
          </div>
          <div class="inputItem">
            <button @click="saveWatermarkConfig">保存配置</button>
          </div>
          <div class="inputItem">
            <button class="theme" @click="startWatermarkTask">开始任务</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showSuccess, showError, showWarning } from '../services/notificationService.js'

const isUpdata = ref(false)
const wateX = ref(50)
const wateY = ref(50)
const wateScale = ref(0.2) // 调整默认水印比例，从1改为0.2
const uploadedImages = ref([])

// 图片右键菜单相关
const showImageContextMenu = ref(false)
const imageContextMenuPosition = ref({ x: 0, y: 0 })
const imageContextMenuIndex = ref(0)

// 加载保存的配置
onMounted(() => {
  loadWatermarkConfig()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  // 中断所有进行中的处理任务
  processingAborted = true
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }

  // 执行深度清理
  if (uploadedImages.value && Array.isArray(uploadedImages.value)) {
    // 逐个清理图片对象
    uploadedImages.value.forEach((img) => {
      if (img) {
        // 清理对象属性
        img.url = null
        img.path = null
        img.name = null
        img.size = null

        // 冻结对象防止后续修改
        Object.freeze(img)
      }
    })

    // 替换为新数组以断开引用
    uploadedImages.value = []
  }

  // 释放所有潜在引用
  if (typeof window.gc === 'function') {
    window.gc()
  }

  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})

// 加载水印配置
const loadWatermarkConfig = () => {
  const savedConfig = localStorage.getItem('watermarkConfig')
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      wateX.value = config.x || 50
      wateY.value = config.y || 50
      wateScale.value = config.scale ? config.scale / 100 : 0.2 // 调整默认比例
    } catch (e) {
      console.error('加载水印配置失败:', e)
    }
  }
}

// 保存水印配置
const saveWatermarkConfig = () => {
  const config = {
    x: wateX.value,
    y: wateY.value,
    scale: wateScale.value * 100, // 保存为百分比形式
    position: 'custom' // 使用自定义位置
  }
  localStorage.setItem('watermarkConfig', JSON.stringify(config))
  showSuccess('保存成功', '水印配置已保存', 3000)
}

// 重置水印参数
const resetWatermarkSettings = () => {
  wateX.value = 50
  wateY.value = 50
  wateScale.value = 0.2 // 调整默认水印比例
  showSuccess('重置成功', '水印参数已重置', 3000)
}

// 清空上传的图片
const clearUploadedImages = () => {
  // 中断所有进行中的处理任务
  processingAborted = true
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }

  // 保持响应式结构的同时深度清理
  if (uploadedImages.value && Array.isArray(uploadedImages.value)) {
    // 1. 逐个清理图片对象并断开引用
    uploadedImages.value.forEach((img) => {
      if (img) {
        // 清理对象属性
        img.url = null
        img.path = null
        img.name = null
        img.size = null

        // 使用Object.defineProperty防止内存泄漏
        Object.defineProperty(img, 'url', { value: null, configurable: false, writable: false })
        Object.defineProperty(img, 'path', { value: null, configurable: false, writable: false })
      }
    })

    // 2. 使用代理创建空数组占位
    const tempArray = []
    Object.setPrototypeOf(tempArray, Object.getPrototypeOf(uploadedImages.value))
    uploadedImages.value.splice(0, uploadedImages.value.length, ...tempArray)
  }

  // 3. 重置上传状态
  isUpdata.value = false

  // 4. 主动触发垃圾回收（如果可用）
  if (typeof window.gc === 'function') {
    window.gc()
    // 增加内存清理的双重保障
    setTimeout(() => {
      if (typeof window.gc === 'function') {
        window.gc()
      }
    }, 50)
  }

  // 5. 显示成功提示
  showSuccess('清空成功', '图片列表已清空并释放内存', 3000)
}

// 添加全局变量
let processingAborted = false
let currentAbortController = null

// 导入图片
const importImages = async () => {
  try {
    const filePaths = await window.api.selectImageFiles()
    await processImageFiles(filePaths)
  } catch (error) {
    console.error('导入图片失败:', error)
    showError('导入失败', '导入图片时发生错误', 3000)
  }
}

// 处理拖拽上传
const handleDrop = async (event) => {
  event.preventDefault()
  try {
    // 获取拖拽的文件
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      // 创建FileReader读取文件
      const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      // 过滤出图片文件
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        showSuccess('正在导入', `正在处理 ${imageFiles.length} 张图片...这可能需要一些时间`, 10000)

        // 使用防抖和更严格的内存管理处理大量图片
        processFilesInChunksWithDebounce(imageFiles, readFileAsDataURL)
      }
    }
  } catch (error) {
    console.error('拖拽上传失败:', error)
    showError('导入失败', '拖拽上传时发生错误', 3000)
  }
}

// 使用防抖机制处理文件，避免内存峰值
const processFilesInChunksWithDebounce = (files, readFileFn) => {
  processingAborted = false
  currentAbortController = new AbortController()

  let index = 0
  const total = files.length
  let importedCount = 0

  const processNext = () => {
    // 检查是否被中断
    if (processingAborted || currentAbortController.signal.aborted) {
      return
    }

    if (index >= total) {
      // 处理完成
      if (importedCount > 0) {
        showSuccess('导入成功', `成功导入 ${importedCount} 张图片`, 3000)
      }
      return
    }

    const file = files[index]
    readFileFn(file)
      .then((dataURL) => {
        if (dataURL) {
          uploadedImages.value.push({
            name: file.name,
            url: dataURL,
            size: file.size
          })
          importedCount++
          isUpdata.value = true
        }
      })
      .catch((error) => {
        console.error('读取文件失败:', error)
      })
      .finally(() => {
        index++
        // 使用requestIdleCallback如果可用，否则使用setTimeout
        if (window.requestIdleCallback) {
          requestIdleCallback(processNext, { timeout: 100 })
        } else {
          setTimeout(processNext, 50) // 增加延迟以减少内存压力
        }
      })
  }

  processNext()
}

// 处理图片文件
const processImageFiles = async (filePaths) => {
  if (filePaths && filePaths.length > 0) {
    showSuccess('正在导入', `正在处理 ${filePaths.length} 张图片...这可能需要一些时间`, 5000)

    // 使用防抖机制处理文件路径
    let index = 0
    const total = filePaths.length
    let importedCount = 0

    const processNext = async () => {
      if (index >= total) {
        // 处理完成
        if (importedCount > 0) {
          showSuccess('导入成功', `成功导入 ${importedCount} 张图片`, 3000)
        }
        return
      }

      const filePath = filePaths[index]
      const fileName = filePath.split('\\').pop().split('/').pop()

      try {
        // 读取图片文件并转换为DataURL
        const dataURL = await window.api.readImageAsDataURL(filePath)
        if (dataURL) {
          // 获取文件大小
          const fileSize = await window.api.getFileSize(filePath)

          uploadedImages.value.push({
            name: fileName,
            url: dataURL,
            path: filePath,
            size: fileSize
          })
          importedCount++
          isUpdata.value = true
        }
      } catch (error) {
        console.error('处理文件失败:', error)
      } finally {
        index++
        // 使用requestIdleCallback如果可用，否则使用setTimeout
        if (window.requestIdleCallback) {
          requestIdleCallback(processNext, { timeout: 100 })
        } else {
          setTimeout(processNext, 30) // 增加延迟以减少内存压力
        }
      }
    }

    processNext()
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 开始水印任务
const startWatermarkTask = async () => {
  if (uploadedImages.value.length === 0) {
    showWarning('任务失败', '请先上传图片', 3000)
    return
  }

  showSuccess('任务开始', '正在处理图片，请稍候...这可能需要一些时间', 10000)

  try {
    // 获取导出目录
    const exportPath = localStorage.getItem('workPath') || (await window.api.getDownloadsPath())

    // 获取水印配置
    const watermarkConfig = {
      position: 'custom',
      opacity: 100, // 默认不透明
      scale: wateScale.value * 100,
      x: wateX.value,
      y: wateY.value
    }

    // 获取选中的水印
    let watermarkData = null
    let hasWatermark = false
    try {
      const watermarks = JSON.parse(localStorage.getItem('watermarks') || '[]')
      const activeIndex = parseInt(localStorage.getItem('activeWatermarkIndex') || '0')
      if (watermarks.length > 0 && activeIndex < watermarks.length) {
        watermarkData = watermarks[activeIndex].url
        hasWatermark = true
      }
    } catch (e) {
      console.error('加载水印失败:', e)
    }

    // 如果没有水印，显示提醒
    if (!hasWatermark) {
      showWarning('未选择水印', '请先选择或导入一个水印图片', 3000)
      return
    }

    // 使用防抖机制处理水印添加
    let index = 0
    const total = uploadedImages.value.length
    let successCount = 0

    const processNext = async () => {
      if (index >= total) {
        // 处理完成
        showSuccess('任务完成', `成功处理 ${successCount}/${total} 张图片`, 3000)
        return
      }

      const image = uploadedImages.value[index]
      try {
        const options = {
          imagePath: image.path, // 本地文件路径（如果有）
          imageData: image.path ? null : image.url, // base64数据（拖拽上传的文件）
          watermarkData: watermarkData,
          exportPath: exportPath,
          fileName: `watermarked_${image.name}`,
          position: watermarkConfig.position,
          opacity: watermarkConfig.opacity,
          scale: watermarkConfig.scale,
          x: watermarkConfig.x,
          y: watermarkConfig.y,
          isFanse: localStorage.getItem('isFanse') === 'true' // 添加isFanse参数
        }

        const result = await window.api.addWatermarkAndExport(options)
        if (result.success) {
          successCount++
        } else {
          console.error('处理图片失败:', result.error)
        }
      } catch (error) {
        console.error('处理图片时出错:', error)
      } finally {
        index++
        // 使用requestIdleCallback如果可用，否则使用setTimeout
        if (window.requestIdleCallback) {
          requestIdleCallback(processNext, { timeout: 100 })
        } else {
          setTimeout(processNext, 50) // 增加延迟以减少内存压力
        }
      }
    }

    processNext()
  } catch (error) {
    console.error('处理图片时出错:', error)
    showError('任务失败', '处理图片时发生错误: ' + error.message, 3000)
  }
}

// 图片右键菜单相关方法
const openImageContextMenu = (event, index) => {
  imageContextMenuIndex.value = index
  imageContextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showImageContextMenu.value = true
}

const hideImageContextMenu = () => {
  showImageContextMenu.value = false
}

const handleClickOutside = (event) => {
  const contextMenu = document.querySelector('.context-menu')
  if (contextMenu && !contextMenu.contains(event.target)) {
    hideImageContextMenu()
  }
}

// 图片右键删除处理
const handleDeleteImage = () => {
  hideImageContextMenu()

  // 获取要删除的图片索引
  const deletedIndex = imageContextMenuIndex.value

  // 安全检查
  if (deletedIndex < 0 || deletedIndex >= uploadedImages.value.length) {
    return
  }

  // 获取要删除的图片信息
  const deletedName = uploadedImages.value[deletedIndex].name

  // 1. 深度清理要删除的对象
  const imageToDelete = uploadedImages.value[deletedIndex]
  if (imageToDelete) {
    // 清理对象属性
    imageToDelete.url = null
    imageToDelete.path = null
    imageToDelete.name = null
    imageToDelete.size = null

    // 冻结对象防止后续修改
    Object.freeze(imageToDelete)
  }

  // 2. 使用splice替换数组以触发响应式更新
  uploadedImages.value.splice(deletedIndex, 1)

  // 3. 检查并更新上传状态
  isUpdata.value = uploadedImages.value.length > 0

  // 4. 主动触发垃圾回收（如果可用）
  if (typeof window.gc === 'function') {
    window.gc()
  }

  // 5. 显示成功提示
  showSuccess('删除成功', `图片 "${deletedName}" 已删除`, 3000)
}
</script>
