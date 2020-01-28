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
          <el-button type="primary" plain @click="adduserVisible = true">添加用户</el-button>
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
            @click="assignRoles(scope.row)"></el-button>
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
  <!-- 添加用户对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="adduserVisible"
    width="40%">
      <el-form ref="addFormref" :model="addForm" :rules="rules" label-width="70px">
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
        <el-button type="primary" @click='addUser'>确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
    title="编辑用户"
    :visible.sync="editDialogVisible"
    width="40%" @close='editDialogClose'>
      <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="assignRolesDialogVisible"
    width="40%" @close="clearSelect">
      <span>
        <p>当前用户：{{userinfo.username}}</p>
        <p>当前角色：{{userinfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectRole" placeholder="选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRoles">确 定</el-button>
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
      editDialogVisible: false,
      assignRolesDialogVisible: false,
      title: '',
      userId: 0,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
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
      },
      userinfo: {},
      rolesList: {},
      selectRole: ''
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
    // 添加用户数据
    addUser () {
      this.$refs.addFormref.validate(valid => {
        if (!valid) {
          return false
        }
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
      this.editDialogVisible = true
      this.userId = id
      this.$http.get(`users/${id}`).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.editForm = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 编辑用户数据
    editUser () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) {
          return false
        }
        this.$http.put(`users/${this.userId}`, { email: this.editForm.email,
          mobile: this.editForm.mobile }).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
          // console.log(data)
            this.$message.success(meta.msg)
            this.editDialogVisible = false
            this.getUsersdata()
          } else {
            this.$message.error(meta.msg)
          }
        })
      })
    },
    // 重置表单
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除用户
    deleteUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`users/${id}`).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            this.getUsersdata()
          } else {
            this.$message.error(meta.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
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
    // 分配角色
    // 获取角色列表
    assignRoles (userinfo) {
      this.userinfo = userinfo
      this.assignRolesDialogVisible = true
      this.$http.get('roles').then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.rolesList = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 清空选择器
    clearSelect () {
      this.selectRole = ''
    },
    // 确定分配角色
    setUserRoles () {
      this.$http.put(`users/${this.userinfo.id}/role`, { rid: this.selectRole }).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          this.assignRolesDialogVisible = false
          this.$message.success(meta.msg)
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 获取用户数据
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
button.el-button--mini.is-circle{
  margin: 0 5px
}
</style>
