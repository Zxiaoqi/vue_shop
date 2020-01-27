<template>
  <div id="roles">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>角色管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-button type="primary" plain @click="addroleVisible=true,title='添加角色'">添加角色</el-button>
        <el-table :data='rolesList' border stripe>
            <el-table-column type='expand'>
                <template slot-scope="props">
                    <el-row
                    closable
                    @close="removeRight(props.row,item.id)"
                    :class="['bdbottom', idx===0?'bdtop':'','vcenter']" v-for='(item,idx) in props.row.children' :key="item.id">
                        <!-- 一级 -->
                        <el-col  :span='5'>
                            <el-tag closable>{{item.authName}}</el-tag>
                        </el-col>
                        <!-- 二级 和三级-->
                        <el-col :span='19' >
                            <el-row
                            closable
                            @close="removeRight(props.row,item1.id)"
                            :class="[idx1===0?'':'bdtop','vcenter']" v-for="(item1,idx1) in item.children" :key="item1.id">
                                <el-col :span='7'>
                                    <el-tag closable type="success">{{item1.authName}}</el-tag>
                                </el-col>
                                <el-col :span="17">
                                    <el-tag
                                    closable
                                    @close="removeRight(props.row,item2.id)"
                                    :class="[idx2===0?'':'bdtop']"
                                    v-for="(item2,idx2) in item1.children" :key="item2.id"
                                    type="warning">{{item2.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop='roleName' label="角色名称"></el-table-column>
            <el-table-column prop='roleDesc' label="角色描述"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit"
                     @click='showEditForm(scope.row.id)'>编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete"
                    @click='deleteRoles(scope.row.id)'>删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting"
                    @click="showSetRights(scope.row)">权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
    :title="title"
    :visible.sync="addroleVisible"
    width="40%">
      <el-form ref="roleRef" :model="roles"
      :rules="addRolesRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" >
          <el-input v-model="roles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addroleVisible = false">取 消</el-button>
        <el-button type="primary" @click='changeRolesRight'>确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" width="50%"
    :visible.sync="setRightsVisible">
        <el-tree :data="rightsList"
        :props="treeProps" show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys" ref='treeRef'></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightsVisible = false">取 消</el-button>
            <el-button type="primary" @click='allotRights()'>确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data () {
    return {
      rolesList: [],
      rightsList: [],
      // 树形控件属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      setRoleId: '',
      addroleVisible: false,
      setRightsVisible: false,
      roles: {},
      addRolesRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      title: '',
      roleId: 0
    }
  },
  methods: {
    // 移除角色权限
    removeRight (role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
          const { data, meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            role.children = data
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
    // 添加角色
    addRolesRight () {
      this.$refs.roleRef.validate(valid => {
        if (!valid) {
          return false
        }
        this.$http.post('roles',
          { roleName: this.roles.roleName,
            roleDesc: this.roles.roleDesc }).then(res => {
          const { meta } = res.data
          if (meta.status === 201) {
            this.$message.success(meta.msg)
            this.addroleVisible = false
            this.getRolesData()
          } else {
            this.$message.error(meta.msg)
          }
        })
      })
    },
    // 显示编辑对话框
    showEditForm (id) {
      this.title = '编辑角色'
      this.addroleVisible = true
      this.roleId = id
      this.$http.get('roles/' + id).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.roles = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 编辑角色
    editRoles () {
      this.$refs.roleRef.validate(valid => {
        if (!valid) {
          return false
        }
        this.$http.put(`roles/${this.roleId}`,
          { roleName: this.roles.roleName,
            roleDesc: this.roles.roleDesc }).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            this.addroleVisible = false
            this.getRolesData()
          } else {
            this.$message.error(meta.msg)
          }
        })
      })
    },
    // 复用对话框
    changeRolesRight () {
      if (this.title === '添加角色') {
        this.addRolesRight()
      } else if (this.title === '编辑角色') {
        this.editRoles()
      } else {
        return false
      }
    },
    // 删除角色
    deleteRoles (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${id}`).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            this.getRolesData()
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
    // 分配权限
    showSetRights (rights) {
      this.setRightsVisible = true
      this.setRoleId = rights.id
      this.$http.get('rights/tree').then(res => {
        const { data, meta } = res.data
        const arr = []
        if (meta.status === 200) {
          this.rightsList = data
          rights.children.map(item => {
            item.children.filter(val => {
              arr.push(val.id)
            })
          })
          this.defKeys = arr
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 确定权限分配
    allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ].join(',')
      this.$http.post(`roles/${this.setRoleId}/rights`, { rids: keys }).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.setRightsVisible = false
          this.getRolesData()
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 获取数据
    getRolesData () {
      this.$http.get('roles').then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.rolesList = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    }
  },
  created () {
    this.getRolesData()
  }
}
</script>

<style lang="less" scoped>
.el-table{
    margin-top: 15px
}
.el-tag{
    margin:7px
}
.el-row{
    margin-bottom: 0
}
.bdtop{
    border-top: 1px solid #EBEEF5
}
.bdbottom{
    border-bottom: 1px solid #EBEEF5
}
.vcenter{
    display: flex;
    align-items:center
}
</style>
