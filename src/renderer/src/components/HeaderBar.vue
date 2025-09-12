<template>
  <div class="headerBar">
    <div class="right">
      <div class="toMinBtn headerBtn" title="最小化" @click="HideWindow">-</div>
      <div class="toWindowBtn headerBtn" title="窗口/最大化" @click="toggleMaxMinWindow">
        {{ isMaximized ? '🗖' : '🗗' }}
      </div>
      <div class="closeBtn headerBtn" title="关闭" @click="closeWindow">✕</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isMaximized = ref(false)
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
