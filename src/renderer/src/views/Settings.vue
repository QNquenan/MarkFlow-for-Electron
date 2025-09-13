<template>
  <div class="page settings">
    <span class="title">设置</span>

    <div class="content">
      <div class="card">
        <div class="left">
          <files />
          <span>工作目录</span>
        </div>

        <div class="right">
          <div class="inputItem">
            <button>选择文件夹</button>
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
              @change="test"
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
              @change="test"
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
            <button>⭐去看看</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="left">
          <Warning />
          <span>关于MarkFlow</span>
        </div>

        <div class="right">
          <p>版本：{{ ver }}</p>
          <p>By Quenan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Files, ArrowLeftBold, Brush, Link, Warning } from '@element-plus/icons-vue'
import { ref } from 'vue'

const openCard = ref(false)
const themeColor = ref('0')
const ver = ref('1.0.0')

const toggleCardOpen = () => {
  openCard.value = !openCard.value
}
const test = () => {
  console.log(themeColor.value)
}
</script>
