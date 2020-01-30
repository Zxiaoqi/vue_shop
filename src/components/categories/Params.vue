<template>
  <div id="params">
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <!-- <el-alert
        show-icon
        title="注意：只允许选择三级参数！"
        type="warning"
        :closable='false'>
        </el-alert> -->
        <el-row>
            <el-col>
                <span>选择商品分类：
                    <el-cascader
                    v-model="selectCate"
                    :options="cateList"
                    :props='cateProps'
                    @change="changeCate" clearable>
                    </el-cascader>
                </span>
            </el-col>
        </el-row>
        <el-tabs v-model="activeName"
        @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled"  size="mini"
                @click="addMany">添加参数</el-button>
                <el-table
                :data="manyCateParams"
                style="width: 100%" border>
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                          <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                          closable>
                            {{item}}
                          </el-tag>
                          <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                          </el-input>
                          <el-button v-else class="button-new-tag" size="small"
                          @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop='attr_name' label="名称"></el-table-column>
                    <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                        @click="editAttr(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                        @click="deleteParams(scope.row)">删除</el-button>
                    </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isBtnDisabled" size="mini"
                @click="addOnly">添加属性</el-button>
                <el-table
                :data="onlyCateParams"
                style="width: 100%" border>
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                          <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                          closable @close="handleClose(i,scoperow)">
                            {{item}}
                          </el-tag>
                          <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                          </el-input>
                          <el-button v-else class="button-new-tag" size="small"
                          @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop='attr_name' label="属性名称"></el-table-column>
                    <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                        @click="editAttr(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                        @click="deleteParams(scope.row)">删除</el-button>
                    </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <!-- 参数属性对话框 -->
    <el-dialog
    :title="title"
    :visible.sync="addDialogVisible"
    width="37%" @close="closeDialog">
      <el-form ref="addParamsFormRef" :model="addParamsList" :rules="addParamsRules" label-width="80px">
        <el-form-item :label="label" prop="attr_name">
          <el-input v-model="addParamsList.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data () {
    return {
      cateList: [],
      selectCate: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: 'many',
      manyCateParams: [],
      onlyCateParams: [],
      title: '',
      label: '',
      addDialogVisible: false,
      addParamsList: {
        attr_name: ''
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      cate: ''

    }
  },
  computed: {
    // 判断按钮是否可选
    isBtnDisabled () {
      if (this.selectCate.length > 0) {
        return false
      } else {
        return true
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    cateId () {
      if (this.selectCate.length > 0) {
        return this.selectCate[this.selectCate.length - 1]
      }
    }
  },
  methods: {
    // 获取商品参数列表
    getCateList () {
      this.$http.get('categories')
        .then(res => {
          const { data, meta } = res.data
          if (meta.status !== 200) {
            return this.$message.error(meta.msg)
          }
          this.cateList = data
        })
    },
    // 分类改变,请求参数
    changeCate () {
      if (this.selectCate.length > 0) {
        let id = this.selectCate[this.selectCate.length - 1]
        this.$http.get(`categories/${id}/attributes`,
          { params: { sel: this.activeName } }).then(res => {
          const { data, meta } = res.data
          if (meta.status === 200) {
            if (this.activeName === 'many') {
              this.manyCateParams = data
            } else {
              this.onlyCateParams = data
            }
            data.forEach(item => {
              item.attr_vals = item.attr_vals
                ? item.attr_vals.split(' ') : []
              item.inputVisible = false
              item.inputValue = ''
            })
          } else {
            this.$message.error(meta.msg)
          }
        })
      }
    },
    // tab点击事件
    handleClick () {
      this.changeCate()
    },
    // 添加参数对话框
    addMany () {
      this.title = '添加参数'
      this.label = '参数名称'
      this.addDialogVisible = true
    },
    // 添加属性对话框
    addOnly () {
      this.title = '添加属性'
      this.label = '属性名称'
      this.addDialogVisible = true
    },
    // 编辑属性对话框
    editAttr (cate) {
      if (this.activeName === 'many') {
        this.title = '修改动态参数'
        this.label = '参数名称'
      } else {
        this.title = '修改静态属性'
        this.label = '属性名称'
      }
      this.addDialogVisible = true
      this.cate = cate
      this.$http.get(`categories/${cate.cat_id}/attributes/${cate.attr_id}`,
        { attr_sel: this.activeName }).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.addParamsList = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 确定添加
    addParams () {
      this.$refs.addParamsFormRef.validate(valid => {
        if (!valid) return false
        this.$http.post(`categories/${this.cateId}/attributes`,
          { attr_name: this.addParamsList.attr_name,
            attr_sel: this.activeName }).then(res => {
          const { meta } = res.data
          if (meta.status === 201) {
            this.$message.success(meta.msg)
            this.changeCate()
          } else {
            this.$message.error(meta.msg)
          }
        })
      })
    },
    // 确定参数属性
    submitParams () {
      if (this.title.indexOf('添加') !== -1) {
        this.addParams()
      } else {
        this.$refs.addParamsFormRef.validate(valid => {
          if (!valid) return false
          this.$http.put(`categories/${this.cate.cat_id}/attributes/${this.cate.attr_id}`,
            { attr_sel: this.activeName,
              attr_name: this.activeName.attr_name }).then(res => {
            const { meta } = res.data
            if (meta.status === 200) {
              this.$message.success(meta.msg)
            } else {
              this.$message.error(meta.msg)
            }
          })
        })
      }
      this.addDialogVisible = false
    },
    // delete参数
    deleteParams (cate) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/${cate.cat_id}/attributes/${cate.attr_id}`).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            this.changeCate()
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
    closeDialog () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // tag显示input,有bug， v-if无法显示隐藏input
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length !== 0) {
        row.attr_vals.push(row.inputValue.trim())
        this.saveAttrVals(row)
      }
      row.inputVisible = false
      row.inputValue = ''
    },
    saveAttrVals (row) {
      this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`,
        { attr_sel: row.attr_sel,
          attr_name: row.attr_name,
          attr_vals: row.attr_vals.join(' ') }).then(res => {
        const { meta } = res.data
        if (meta.status === 200) {
          this.$message.success(meta.msg)
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-table{
    margin-top: 15px
}
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
