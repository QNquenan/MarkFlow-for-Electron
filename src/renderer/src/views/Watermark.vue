<template>
  <div class="page watermark">
    <div class="title">我的水印</div>

    <div class="tools">
      <div class="inputItem">
        <button class="theme" @click="importWatermarks">+ 导入水印</button>
      </div>

      <div class="switchBox">
        <label class="switch">
          <input v-model="isFanse" type="checkbox" @change="toggleFanSe" />
          <span class="switch-slider round"></span>
        </label>
        <div class="span">是否开启自动反色</div>
      </div>
    </div>

    <hr />

    <div class="wateBox">
      <div
        v-for="(watermark, index) in watermarks"
        :key="index"
        class="wateItem"
        :class="{ active: activeIndex === index }"
        @click="selectWatermark(index)"
        @dblclick="openRenameDialog"
        @contextmenu.prevent="openContextMenu($event, index)"
      >
        <div class="logo">
          <img :src="watermark.url" :alt="watermark.name" />
        </div>
        <div class="logoName">{{ watermark.name }}</div>
      </div>
    </div>

    <div v-if="isReName" class="dialog">
      <div class="diaBox">
        <div class="diaTitle">修改名字</div>
        <div class="diaContent">
          <div class="inputItem">
            <input v-model="newName" type="text" placeholder="请输入新的水印名" />
          </div>
        </div>
        <div class="diaFooter">
          <div class="inputItem">
            <button @click="cancelRename">取消</button>
          </div>
          <div class="inputItem">
            <button class="theme" @click="confirmRename">确定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
      @click="hideContextMenu"
    >
      <div class="context-menu-item" @click="handleRename">修改名字</div>
      <div class="context-menu-item" @click="handleDelete">删除</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showSuccess, showError, showWarning } from '../services/notificationService.js'

const isFanse = ref(localStorage.getItem('isFanse') === 'true')
const watermarks = ref([])
const activeIndex = ref(0)
const isReName = ref(false)
const newName = ref('')

// 右键菜单相关
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuIndex = ref(0)

// 添加取消重命名的方法
const cancelRename = () => {
  isReName.value = false
  newName.value = ''
}

// 添加确认重命名的方法
const confirmRename = () => {
  // 这里添加重命名逻辑
  if (newName.value.trim() !== '') {
    watermarks.value[activeIndex.value].name = newName.value.trim()
    saveWatermarks()
    showSuccess('操作成功', '水印名称修改成功', 3000)
  }
  isReName.value = false
  newName.value = ''
}

// 添加打开重命名对话框的方法
const openRenameDialog = () => {
  newName.value = watermarks.value[activeIndex.value]?.name || ''
  isReName.value = true
}

const loadWatermarks = async () => {
  const savedWatermarks = localStorage.getItem('watermarks')
  if (savedWatermarks) {
    const parsedWatermarks = JSON.parse(savedWatermarks)

    for (let i = 0; i < parsedWatermarks.length; i++) {
      const watermark = parsedWatermarks[i]
      if (watermark.url.startsWith('file://')) {
        try {
          const filePath = decodeURIComponent(watermark.url.substring(7))
          // 读取图片文件并转换为DataURL
          const dataURL = await window.api.readImageAsDataURL(filePath)
          if (dataURL) {
            parsedWatermarks[i].url = dataURL
          }
        } catch (error) {
          console.error('转换图片失败:', error)
        }
      }
    }

    watermarks.value = parsedWatermarks
  } else {
    // 不设置默认水印
    watermarks.value = []
  }

  // 加载之前保存的选中水印索引
  const savedActiveIndex = localStorage.getItem('activeWatermarkIndex')
  if (savedActiveIndex !== null && watermarks.value.length > 0) {
    const index = parseInt(savedActiveIndex)
    // 确保索引在有效范围内
    if (index >= 0 && index < watermarks.value.length) {
      activeIndex.value = index
    } else {
      activeIndex.value = 0
    }
  } else {
    activeIndex.value = 0
  }
}

// 保存水印到localStorage
const saveWatermarks = () => {
  localStorage.setItem('watermarks', JSON.stringify(watermarks.value))
}

// 切换反色
const toggleFanSe = () => {
  localStorage.setItem('isFanse', isFanse.value)
}

// 导入水印
const importWatermarks = async () => {
  try {
    const filePaths = await window.api.selectImageFiles()
    if (filePaths && filePaths.length > 0) {
      let importedCount = 0
      let duplicateCount = 0
      for (const filePath of filePaths) {
        const fileName = filePath.split('\\').pop().split('/').pop()
        const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))

        // 检查是否已存在同名水印
        const exists = watermarks.value.some((w) => w.name === fileNameWithoutExt)
        if (!exists) {
          // 读取图片文件并转换为DataURL
          const dataURL = await window.api.readImageAsDataURL(filePath)
          if (dataURL) {
            watermarks.value.push({
              name: fileNameWithoutExt,
              url: dataURL
            })
            importedCount++
          }
        } else {
          duplicateCount++
        }
      }
      if (importedCount > 0) {
        saveWatermarks()
        showSuccess('导入成功', `成功导入 ${importedCount} 个水印`, 3000)
      }
      if (duplicateCount > 0) {
        showWarning('导入提醒', `${duplicateCount} 个水印因名称重复未导入`, 3000)
      }
    }
  } catch (error) {
    console.error('导入水印失败:', error)
    showError('导入失败', '导入水印时发生错误', 3000)
  }
}

// 选择水印
const selectWatermark = (index) => {
  activeIndex.value = index
  // 保存当前选中的水印索引到localStorage
  localStorage.setItem('activeWatermarkIndex', index.toString())
}

// 右键菜单相关方法
const openContextMenu = (event, index) => {
  contextMenuIndex.value = index
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

const hideContextMenu = () => {
  showContextMenu.value = false
}

const handleClickOutside = (event) => {
  const contextMenu = document.querySelector('.context-menu')
  if (contextMenu && !contextMenu.contains(event.target)) {
    hideContextMenu()
  }
}

const handleRename = () => {
  hideContextMenu()
  openRenameDialog()
}

const handleDelete = () => {
  hideContextMenu()

  // 检查是否尝试删除当前选中的水印
  if (contextMenuIndex.value === activeIndex.value) {
    showError('操作失败', '不能删除当前选中的水印', 3000)
    return
  }

  // 删除水印
  const deletedName = watermarks.value[contextMenuIndex.value].name
  const deletedIndex = contextMenuIndex.value
  watermarks.value.splice(contextMenuIndex.value, 1)

  // 调整选中索引
  if (deletedIndex < activeIndex.value) {
    // 如果删除的水印在当前选中水印之前，选中索引需要减1
    activeIndex.value = activeIndex.value - 1
  } else if (activeIndex.value >= watermarks.value.length && watermarks.value.length > 0) {
    // 如果选中索引超出了数组范围，调整为最后一个元素
    activeIndex.value = watermarks.value.length - 1
  } else if (watermarks.value.length === 0) {
    // 如果没有水印了，重置为0
    activeIndex.value = 0
  }
  // 保存当前选中的水印索引到localStorage
  localStorage.setItem('activeWatermarkIndex', activeIndex.value.toString())

  saveWatermarks()
  showSuccess('删除成功', `水印 "${deletedName}" 已删除`, 3000)
}

// 组件挂载时加载水印
onMounted(() => {
  loadWatermarks()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
