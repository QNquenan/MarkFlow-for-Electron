<template>
  <div class="headerBar">
    <div class="right">
      <div class="toMinBtn headerBtn" title="最小化" @click="HideWindow">-</div>
      <div class="toWindowBtn headerBtn" title="窗口/最大化" @click="toggleMaxMinWindow">❐</div>
      <div class="closeBtn headerBtn" title="关闭" @click="closeWindow">✕</div>
    </div>
  </div>
</template>

<script setup>
const HideWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.minimizeWindow()
  }
}

const toggleMaxMinWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.toggleMaximizeWindow()
  }
}

const closeWindow = () => {
  if (typeof window.api !== 'undefined') {
    window.api.closeWindow()
  }
}
</script>
