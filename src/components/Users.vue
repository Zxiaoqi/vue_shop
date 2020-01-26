<template>
  <div id="users">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="30">
        <el-col :span="8">
          <!-- 输入框搜索 -->
          <el-input placeholder="请输入内容" class="input-with-select" v-model='pageinfo.query'
          clearable @change="getUsersdata">
            <el-button slot='append' icon="el-icon-search" @click='getUsersdata'></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" plain @click="showAddForm">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
      :data="userslist"
      style="width: 100%" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop='username' label="姓名"></el-table-column>
        <el-table-column prop='role_name' label="管理"></el-table-column>
        <el-table-column prop='email' label="邮箱"></el-table-column>
        <el-table-column prop='mobile' label="电话"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change='userChange(scope.row)'></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" circle
          @click='showEditForm(scope.row.id)'></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" circle
          @click='deleteUser(scope.row.id)'></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable='false'>
            <el-button size="mini" icon="el-icon-user" circle
            ></el-button>
          </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
      :current-page="pageinfo.pagenum"
      :page-sizes="[1, 2, 3, 100,pageinfo.pagesize]"
      :page-size="pageinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>
    <el-dialog
    :title="title"
    :visible.sync="adduserVisible"
    width="40%">
      <el-form ref="addFormref" :model="addForm" :rules="rules" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adduserVisible = false">取 消</el-button>
        <el-button type="primary" @click='submitUser()'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'users',
  data () {
    const checkMobile = (rule, value, cb) => {
      let reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        cb()
      } else {
        cb(new Error('手机号码格式不正确'))
      }
    }
    return {
      pageinfo: {
        query: '',
        pagenum: 1,
        pagesize: 7
      },
      userslist: [],
      total: 0,
      adduserVisible: false,
      title: '',
      userId: 0,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 7, message: '长度在 3 到 7 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  methods: {
    // 修改用户状态
    userChange (statu) {
      this.$http.put(`users/${statu.id}/state/${statu.mg_state}`).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          this.$message.success('更改用户数据成功')
        } else {
          statu.mg_state = !statu.mg_state
          this.$message.error('更改用户数据失败')
        }
      })
    },
    // 显示添加对话框
    showAddForm () {
      this.adduserVisible = true
      this.title = '添加用户'
    },
    // 添加用户数据
    addUser () {
      this.$refs.addFormref.validate(valid => {
        this.adduserVisible = false
        this.$http.post('users', this.addForm).then(res => {
          const { meta } = res.data
          if (meta.status === 201) {
            this.$message.success(meta.msg)
            this.adduserVisible = false
            this.getUsersdata()
          } else {
            this.$message.error(meta.msg)
          }
          // console.log(res)
        })
      })
    },
    // 显示编辑对话框
    showEditForm (id) {
      this.title = '编辑用户'
      this.adduserVisible = true
      this.userId = id
    },
    // 编辑用户数据
    editUser () {
      this.$http.put(`users/${this.userId}`, { params: this.addForm }).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          // console.log(data)
          this.$message.success(meta.msg)
          this.adduserVisible = false
          this.getUsersdata()
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 复用提交用户按钮
    submitUser () {
      if (this.title === '添加用户') {
        this.addUser()
      } else if (this.title === '编辑用户') {
        this.editUser()
      }
    },
    deleteUser (id) {
      this.$http.delete(`users/${id}`).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.getUsersdata()
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 显示页数
    handleSizeChange (val) {
      this.pageinfo.pagesize = val
      this.getUsersdata()
    },
    // 当前页
    handleCurrentChange (val) {
      this.pageinfo.pagenum = val
      this.getUsersdata()
    },
    getUsersdata () {
      this.$http.get('users', { params:
       this.pageinfo
      }).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.userslist = data.users
          this.total = data.total
        // console.log(data)
        } else {
          this.$message.error('获取用户数据失败')
        }
      })
    }
  },
  created () {
    this.getUsersdata()
  }
}
</script>

<style lang="less" scoped>
.el-form-item{
  padding-right: 15px
}
</style>
