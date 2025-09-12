<script setup>
import HeaderBar from './views/HeaderBar.vue'
import Sidebar from './views/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <div class="rightBox">
      <HeaderBar />
      <div class="main"></div>
    </div>
  </div>
</template>
