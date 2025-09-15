<script setup>
import { ref, onMounted } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import Sidebar from './components/Sidebar.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import { initNotificationCenter } from './services/notificationService.js'

const notificationCenter = ref(null)

onMounted(() => {
  // 初始化通知中心
  if (notificationCenter.value) {
    initNotificationCenter(notificationCenter.value)
  }
})
</script>

<template>
  <div class="layout">
    <Sidebar />
    <div class="rightBox">
      <HeaderBar />
      <div class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    <NotificationCenter ref="notificationCenter" />
  </div>
</template>

<style>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.rightBox {
  width: calc(100% - 200px);
  position: relative;
}

.main {
  width: 100%;
  height: calc(100% - 50px);
  border-top: var(--bar-border);
  border-left: var(--bar-border);
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 8px 0 0 0;
}
</style>