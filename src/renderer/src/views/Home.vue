<template>
  <div class="page">
    <div class="updata" :class="{ nodisplay: isUpdata }">
      <div v-if="!isUpdata" class="upImg">
        <div class="upImgBtn">
          <UploadFilled />
          <div class="upText">点击上传/拖入上传</div>
        </div>
      </div>
      <div v-else class="imgBox">
        <div class="imgItem btnHover">
          <div class="img">
            <img src="../assets/img/test.jpg" alt="" />
          </div>
          <div class="imgInfo">
            <div class="imgName">favicon.png</div>
            <div class="imgSize">2.3MB</div>
          </div>
        </div>

        <div class="imgItem btnHover">
          <div class="img">
            <img src="../assets/img/test2.jpg" alt="" />
          </div>
          <div class="imgInfo">
            <div class="imgName">favicon.png</div>
            <div class="imgSize">2.3MB</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dataBox">
      <div class="dataInput">
        <div class="inputBox">
          <div class="inputItem">
            <label>水印缩放</label>
            <input type="text" placeholder="请输入水印缩放倍数" />
          </div>
        </div>

        <div class="inputBox">
          <div class="inputItem">
            <label>水印的X轴高度</label>
            <div class="rangeText">
              <input v-model="wateX" type="text" placeholder="请输入水印X轴高度" />
              <span>%</span>
            </div>
            <input v-model="wateX" class="slider" type="range" min="0" max="100" step="1" />
          </div>

          <div class="inputItem">
            <label>水印的Y轴高度</label>
            <div class="rangeText">
              <input v-model="wateY" type="text" placeholder="请输入水印Y轴高度" />
              <span>%</span>
            </div>
            <input v-model="wateY" class="slider" type="range" min="0" max="100" step="1" />
          </div>
        </div>

        <div class="inputBox">
          <div class="inputItem">
            <button class="dinger">重置</button>
          </div>
          <div class="inputItem">
            <button>清空图片列表</button>
          </div>
          <div class="inputItem">
            <button>保存配置</button>
          </div>
          <div class="inputItem">
            <button class="theme">开始任务</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'

const isUpdata = ref(true)
const wateX = ref(50)
const wateY = ref(50)
</script>
