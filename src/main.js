import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/css/font-icon.css'
import ZkTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 先设置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 再放到vue原型上
// 添加请求拦截器
axios.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error)
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
