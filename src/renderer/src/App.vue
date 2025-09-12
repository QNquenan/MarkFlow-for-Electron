<script setup>
import HeaderBar from './components/HeaderBar.vue'
import Sidebar from './components/Sidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <div class="rightBox">
      <HeaderBar />
      <RouterView class="main" />
    </div>
  </div>
</template>
