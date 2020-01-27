<template>
    <el-container class="home-container">
      <el-header>
        <div>
          <img src="../assets/logo.png" alt="">
          <span>电商后台管理平台</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse? '64px':'200px'">
          <div class="coll" @click="changeCollapse">≡</div>
          <el-menu
            class="el-menu-vertical-demo"
            background-color="#333744"
            text-color="#fff" active-text-color="#409eee"
             unique-opened :collapse='isCollapse'
            :collapse-transition="false"
            router :default-active="acitveNav"><!--开启路由-->
            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="item of menulist" :key="item.id">
              <!-- 模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 导航名 -->
                <span>{{item.authName}}</span>
              </template>
                <!-- 子导航名 -->
              <el-menu-item :index="'/'+sublist.path" v-for="sublist in item.children"
              :key="sublist.id" @click='saveNav(sublist.path)'>
                <i :class="iconschildren[sublist.id]"></i>
                <span>{{sublist.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      acitveNav: '',
      // 是否折叠
      isCollapse: false,
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-quanxianguanli-mianxing',
        '101': 'iconfont icon-shangpinguanli',
        '102': 'iconfont icon-dingdanguanli',
        '145': 'iconfont icon-shujutongji3'
      },
      iconschildren: {
        '110': 'iconfont icon-users1',
        '111': 'iconfont icon-jiaoseguanli',
        '112': 'iconfont icon-quanxianguanli-mianxing',
        '104': 'iconfont icon-shangpinliebiao',
        '115': 'iconfont icon-jiexicanshu',
        '121': 'iconfont icon-shangpinfenlei',
        '107': 'iconfont icon-dingdanliebiao',
        '146': 'iconfont icon-shujubaobiao'
      }
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    changeCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNav (path) {
      window.sessionStorage.setItem('savenav', '/' + path)
      this.acitveNav = window.sessionStorage.getItem('savenav')
    },
    getMenuList () {
      this.$http.get('menus').then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.menulist = data
        }
      })
    }
  },
  created () {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%
}
.el-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 20px;
  background-color: #373d41;
  color: #fff;
  >div{
    display: flex;
    align-items: center;
    img{
    height: 70px;
    padding-right: 20px
  }
  }
}
.el-aside{
  background-color: #333744;
  i.iconfont{
    padding-right: 15px
  }
  .el-menu{
    border: 0;
  }
  .coll{
    width: 100%;
    height: 40px;
    line-height:40px;
    text-align: center;
    background-color: #525c71;
    color: #eaedf1;
    font-size: 30px;
    cursor: pointer;
  }
}
.el-main{
  background-color: #eaedf1
}
</style>
