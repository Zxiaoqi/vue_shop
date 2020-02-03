import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/user/Login'
import Home from '../components/user/Home'
import Welcome from '../components/user/Welcome'
import Users from '../components/user/Users'
import Rights from '../components//power/Rights'
import Roles from '../components/power/Roles'
import Categories from '../components/categories/Categories'
import Goods from '../components/categories/Goods'
import Params from '../components/categories/Params'
import addGood from '../components/categories/addGood'
import Orders from '../components/order/Orders'
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
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods/addGood',
        name: 'addGood',
        component: addGood
      },
      {
        path: '/orders',
        component: Orders
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
