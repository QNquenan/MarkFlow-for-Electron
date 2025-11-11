<template>
  <div class="notification-center">
    <transition-group name="notification-list" tag="div" class="notification-list">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :id="notification.id"
        :title="notification.title"
        :message="notification.message"
        :type="notification.type"
        :duration="notification.duration"
        @close="removeNotification"
      />
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Notification from './Notification.vue'

const notifications = ref([])

// 添加通知
const addNotification = (options) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const notification = {
    id,
    title: options.title || '',
    message: options.message || '',
    type: options.type || 'info',
    duration: options.duration !== undefined ? options.duration : 4500
  }

  notifications.value.push(notification)
}

// 移除通知
const removeNotification = (id) => {
  const index = notifications.value.findIndex((notification) => notification.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// 暴露方法给父组件
defineExpose({
  addNotification
})
</script>

<style scoped>
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  width: 320px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.notification-list-move {
  transition: transform 0.3s ease;
}
</style>