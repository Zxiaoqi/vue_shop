import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/user/Login'
import Home from '../components/user/Home'
import Welcome from '../components/user/Welcome'
import Users from '../components/user/Users'
// import Rights from "../components//power/Rights"
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  // !!!最后一定要调用next()方法，不然router不会执行
  next()
})

export default router
