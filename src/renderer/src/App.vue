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
      <div class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>
