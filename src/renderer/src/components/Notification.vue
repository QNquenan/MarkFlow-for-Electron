<template>
  <div
    class="notification"
    :class="[type, { 'slide-in': isVisible, 'slide-out': isLeaving }]"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
  >
    <div class="notification-content">
      <div class="icon">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'warning'">⚠</span>
        <span v-else-if="type === 'error'">✕</span>
      </div>
      <div class="text">
        <div class="title">{{ title }}</div>
        <div class="message">{{ message }}</div>
      </div>
      <button class="close-btn" @click="closeNotification">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 4500
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(false)
const isLeaving = ref(false)
let timer = null
let remainingTime = props.duration
let startTime = null

const closeNotification = () => {
  isLeaving.value = true
  setTimeout(() => {
    emit('close', props.id)
  }, 300)
}

const pauseTimer = () => {
  if (timer) {
    clearTimeout(timer)
    const elapsed = Date.now() - startTime
    remainingTime = Math.max(0, remainingTime - elapsed)
  }
}

const resumeTimer = () => {
  if (remainingTime > 0) {
    startTime = Date.now()
    timer = setTimeout(() => {
      closeNotification()
    }, remainingTime)
  }
}

onMounted(() => {
  // 触发动画
  setTimeout(() => {
    isVisible.value = true
  }, 10)

  // 设置自动关闭
  if (props.duration > 0) {
    startTime = Date.now()
    timer = setTimeout(() => {
      closeNotification()
    }, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.notification {
  position: relative;
  width: 15rem;
  margin-top: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  opacity: 0;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  z-index: 1000;
}

.notification.slide-in {
  transform: translateX(0);
  opacity: 1;
}

.notification.slide-out {
  transform: translateX(100%);
  opacity: 0;
}

.notification.success {
  background-color: #f0f9ff;
  border: 1px solid #b3e0ff;
  color: #007acc;
}

.notification.warning {
  background-color: #fff9e6;
  border: 1px solid #ffe680;
  color: #cc9900;
}

.notification.error {
  background-color: #fff0f0;
  border: 1px solid #ff9999;
  color: #cc0000;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
}

.icon {
  margin-right: 12px;
  font-size: 20px;
  line-height: 1;
}

.text {
  flex: 1;
}

.title {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.message {
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}
</style>