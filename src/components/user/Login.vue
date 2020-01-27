<template>
  <div id="login" class="login_container">
    <div class="login_box">
        <!-- 头像区域 -->
        <div class="avatar_box">
            <img src="../assets/logo.png" alt="">
        </div>
        <h2>登录</h2>
        <!-- 表单 -->
        <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" label-width="80px" class="login_form">
            <!-- 用户名 -->
            <el-form-item label="用户名" prop="username">
                <el-input v-model="loginForm.username" type="text">
                    <i slot="prefix" class="el-input__icon el-icon-user"></i>
                </el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" type="password">
                    <i slot="prefix" class="el-input__icon el-icon-lock"></i>
                </el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="submitForm()">提交</el-button>
                <el-button @click="resetForm()">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { require: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { require: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm () {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return false
        }
        this.$http.post('login', this.loginForm).then(response => {
          const { data: res } = response
          if (res.meta.status === 200) {
            this.$message.success('登入成功')
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          } else {
            // $message为element-ui的方法，可全局使用
            this.$message.error('密码错误，请重新输入！')
          }
        })
      })
    },
    resetForm () {
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #4684c2;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background: #fff;
    border-radius: 5px;
    position :absolute;
    left: 50%;
    top: 50%;
    transform:translate(-50% ,-50%);
    .avatar_box{
        position: absolute;
        left: 50%;
        transform:translate(-50% ,-50%);
        height: 100px;
        width: 100px;
        background-color: #fff;
        border-radius: 50%;
        img{
            position: relative;
            width: 88%;
            height: 88%;
            left: 6px;
            top: 18px;
        }
    }
    h2{
        position: absolute;
        left: 50%;
        transform: translate(-50%,100%);
        color: #5a5a5a
    }
    .login_form{
        position: absolute;
        bottom: 10px;
        width: 380px
    }
    .btns{
       display: flex;
       justify-content: flex-end
    }
}
</style>>
