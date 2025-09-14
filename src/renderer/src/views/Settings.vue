<template>
  <div class="page settings">
    <span class="title">设置</span>

    <div class="content">
      <div class="card">
        <div class="left">
          <files />
          <div class="text">
            <span>工作目录</span>
            <span class="patch">{{ workPatch }}</span>
          </div>
        </div>

        <div class="right">
          <div class="inputItem">
            <button @click="selectFolder">选择文件夹</button>
          </div>
        </div>
      </div>

      <div class="openCard card">
        <div class="header" :class="{ open: openCard }" @click="toggleCardOpen">
          <div class="left">
            <Brush />
            <span>主题色</span>
          </div>

          <div class="right">
            <ArrowLeftBold :class="{ r90: openCard }" />
          </div>
        </div>
        <div class="cardMain" :class="{ open: openCard }">
          <div class="inputItem">
            <input
              id="pink"
              v-model="themeColor"
              value="0"
              type="radio"
              name="theme-color"
              @change="updateThemeColor"
            />
            <label for="pink">粉色系</label>
          </div>
          <div class="inputItem">
            <input
              id="blue"
              v-model="themeColor"
              value="1"
              type="radio"
              name="theme-color"
              @change="updateThemeColor"
            />
            <label for="blue">蓝色系</label>
          </div>
        </div>
      </div>

      <div class="title">关于</div>
      <div class="card">
        <div class="left">
          <Link />
          <span>Github</span>
        </div>

        <div class="right">
          <div class="inputItem">
            <button @click="openGithubLink">⭐去看看</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="left">
          <Warning />
          <div class="text">
            <span>关于MarkFlow</span>
            <span class="patch">版本：{{ ver }}</span>
          </div>
        </div>

        <div class="right">
          <p>By Quenan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Files, ArrowLeftBold, Brush, Link, Warning } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'

const openCard = ref(false)
const themeColor = ref('0')
const ver = ref('1.0.0')
const workPatch = ref('')

onMounted(() => {
  if (localStorage.getItem('workPath')) {
    workPatch.value = localStorage.getItem('workPath')
  } else {
    setDefaultWorkPath()
  }

  if (localStorage.getItem('themeColor')) {
    themeColor.value = localStorage.getItem('themeColor')
    updateThemeColor()
  } else {
    themeColor.value = '0'
  }
})

// 页面加载时设置默认工作目录
const setDefaultWorkPath = async () => {
  try {
    const downloadsPath = await window.api.getDownloadsPath()
    workPatch.value = downloadsPath
  } catch (error) {
    console.error('获取下载目录时出错:', error)
    // 降级方案：使用硬编码的默认路径
    workPatch.value = 'C:\\Users\\Administrator\\Downloads\\MarkFlow'
  }
}

const toggleCardOpen = () => {
  openCard.value = !openCard.value
}

const updateThemeColor = () => {
  const root = document.documentElement
  if (themeColor.value === '0') {
    root.style.setProperty('--theme-color', '#FFB3B3')
  } else if (themeColor.value === '1') {
    root.style.setProperty('--theme-color', '#298dff')
  }
  localStorage.setItem('themeColor', themeColor.value)
}

// 打开GitHub链接
const openGithubLink = () => {
  window.api.openExternal('https://github.com/QNquenan/MarkFlow-for-Electron')
}

const selectFolder = async () => {
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      workPatch.value = result
      localStorage.setItem('workPath', result)
    }
  } catch (error) {
    console.error('选择文件夹时出错:', error)
  }
}
</script>
