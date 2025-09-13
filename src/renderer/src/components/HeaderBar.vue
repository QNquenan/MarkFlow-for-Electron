<template>
  <div class="headerBar">
    <div class="right">
      <div class="toMinBtn headerBtn" title="切换明暗" @click="toggleDark">
        {{ theme == 'light' ? '☀️' : '🌙' }}
      </div>
      <div class="toMinBtn headerBtn" title="最小化" @click="HideWindow">—</div>
      <div class="toWindowBtn headerBtn" title="窗口/最大化" @click="toggleMaxMinWindow">
        {{ isMaximized ? '🗖' : '🗗' }}
      </div>
      <div class="closeBtn headerBtn" title="关闭" @click="closeWindow">✕</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')
const isMaximized = ref(false)

const toggleDark = () => {
  if (theme.value == 'light') {
    theme.value = 'dark'
    document.body.setAttribute('theme', theme.value)
    localStorage.setItem('theme', theme.value)
  } else {
    theme.value = 'light'
    document.body.setAttribute('theme', theme.value)
    localStorage.setItem('theme', theme.value)
  }
}

const HideWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.minimizeWindow()
  }
}

const toggleMaxMinWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.toggleMaximizeWindow()
  }
  isMaximized.value = !isMaximized.value
}

const closeWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.closeWindow()
  }
}
</script>
