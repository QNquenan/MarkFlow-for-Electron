import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Watermark from '../views/Watermark.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/watermark',
    name: 'Watermark',
    component: Watermark,
    meta: { title: '水印工具' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
