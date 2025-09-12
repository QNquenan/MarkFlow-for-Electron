<template>
  <div class="sidebar">
    <div class="header">
      <span>MarkFlow</span>
    </div>

    <div class="btnList">
      <div
        v-for="(i, index) in btnList"
        :key="index"
        class="btnItem"
        :class="{ active: active == index }"
        @click="toPage(index, i.to)"
      >
        <component :is="i.icon" />
        {{ i.name }}
      </div>
    </div>

    <div class="footer">
      <div class="btnItem" :class="{ active: active == -1 }" @click="toPage(-1, '/Settings')">
        <Setting />
        设置
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { House, Brush, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const active = ref(0)
const router = useRouter()

const btnList = [
  {
    name: '首页',
    icon: House,
    to: '/'
  },
  {
    name: '水印',
    icon: Brush,
    to: '/watermark'
  }
]

const toPage = (item, page) => {
  router.push(page)
  toggleActive(item)
}
const toggleActive = (item) => {
  if (item != '-1') {
    active.value = item
  } else {
    active.value = -1
  }
}
</script>
