<template>
    <div>
        <el-page-header @back="goBack" :content="title">
        </el-page-header>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{title}}</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 消息提示 -->
            <el-alert :title="title+'信息'" type="info" center show-icon :closable="false">
            </el-alert>

            <!-- 步骤条组件 -->
            <!-- align-center(居中效果) -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域:el-tab-pane必须是el-tabs的子节点
            :tab-position="'left'"(设置tab栏为左右结构tab栏) -->
            <!-- 表单：label-position="top"(设置label在文本框上方) -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'"
                :before-leave="beforeTabLeave"
                @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number" min=0></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number" min=0></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number" min=0></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- 选择商品分类的级联选择框 -->
                            <el-cascader v-model="addForm.goods_cat"
                            :options="cateList" :props="cateProps"
                            clearable></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单item项 -->
                        <el-form-item :label="item.attr_name" :key="item.attr_id"
                        v-for="item in manyTableData">
                            <!-- 使用数组渲染复选框组 -->
                            <el-checkbox-group v-model="checkArr.attr_vals">
                                <el-checkbox border :label="val"
                                v-for="(val,i) in item.attr_vals"
                                 :key="i">{{val}}</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 循环生成静态属性 -->
                        <el-form-item :label="item.attr_name"
                        v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                    <!-- 商品图片上传
                    action:指定图片上传api接口
                    :on-preview ： 当点击图片时会触发该事件进行预览操作,处理图片预览
                    :on-remove : 当用户点击图片右上角的X号时触发执行
                    :on-success：当用户点击上传图片并成功上传时触发
                    list-type ：设置预览图片的方式
                    :headers ：设置上传图片的请求头 -->
                    <el-upload :action="uploadURL"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :on-success="handleSuccess"
                    list-type="picture"
                    :multiple='false'
                    :limit=1
                    :headers="headerObj">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                      <!-- 富文本 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="btnAdd"
                        @click="selectSubmit(addForm.goods_id)">{{title}}</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" class="previewImg" />
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 操作商品
      title: '',
      // 保存步骤条激活项索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 保存预览图片的url地址
      previewPath: '',
      // 占位图片的url
      // fileList: [{ name: 'jpeg.jpeg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' }],
      // 控制预览图片对话框的显示和隐藏
      previewVisible: false,
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 用来保存分类数据
      cateList: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表
      manyTableData: [],
      checkArr: {},
      // 静态属性列表
      onlyTableData: []
    }
  },
  created () {
    this.getCateList()
    // console.log(this.$route)
    this.title = this.$route.params.title
    if (this.$route.params.good) {
      this.addForm = this.$route.params.good
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    // 返回商品列表页面
    goBack () {
      this.$router.push('/goods')
    },
    beforeTabLeave (activeName, oldActiveName) {
      // 在tab栏切换之前触发，两个形参为切换前，后的tab栏name
      if (oldActiveName === '0') {
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price === 0) {
          this.$message.error('请输入商品价格')
          return false
        } else if (this.addForm.goods_weight === 0) {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number === 0) {
          this.$message.error('请输入商品数量')
          return false
        }
      }
    },
    // 在参数信息，商品属性面板中添加循环生成结构的代码
    tabClicked () {
      if (this.activeIndex === '1') {
        this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } }).then(res => {
          const { data, meta } = res.data
          if (meta.status === 200) {
            data.forEach(item => {
              let arr = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
              item.attr_vals = arr
              let key = 'attr_vals'
              this.$set(this.checkArr, key, arr)
            })
            this.manyTableData = data
          } else {
            this.$message.error('获取动态参数列表失败')
          }
        })
      } else if (this.activeIndex === '2') {
        this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } }).then(res => {
          const { data, meta } = res.data
          if (meta.status === 200) {
            this.onlyTableData = data
          } else {
            this.$message.error('获取静态属性列表失败')
          }
        })
      }
    },
    handlePreview (file) {
    // 当用户点击图片进行预览时执行，处理图片预览
    // 形参file就是用户预览的那个文件
      this.previewPath = file.response.data.url
      // 显示预览图片对话框
      this.previewVisible = true
    },
    handleRemove (file) {
    // 当用户点击X号删除时执行
    // 形参file就是用户点击删除的文件
    // 获取用户点击删除的那个图片的临时路径
      const filePath = file.response.data.tmp_path
      // 使用findIndex来查找符合条件的索引
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 移除索引对应的图片
      this.addForm.pics.splice(index, 1)
    },
    handleSuccess (response) {
    // 当上传成功时触发执行
    // 形参response就是上传成功之后服务器返回的结果
    // 将服务器返回的临时路径保存到addForm表单的pics数组中
      this.addForm.pics.push({ pic: response.data.tmp_path })
    },
    submitGood (id) {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        const form = _.cloneDeep(this.addForm)
        if (this.title === '添加商品') {
          form.goods_cat = form.goods_cat.join(',')
        }
        if (this.title === '编辑商品') {
          var { goods_id: idx, ...editForm } = form
        }
        this.manyTableData.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
        })
        // 将onlyTableData（静态属性）处理添加到attrs
        this.onlyTableData.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })
        const { data: res } = !id ? await this.$http.post('goods', form)
          : await this.$http.put(`goods/${id}`, editForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // 编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    },
    selectSubmit (id) {
      if (this.title === '添加商品') {
        this.submitGood()
      } else if (this.title === '编辑商品') {
        // 编辑参数有问题
        this.submitGood(id)
      }
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-page-header{
    font-weight:600;
    margin-bottom: 15px
}
.el-button{
    margin:10px
}
.el-dialog__body{
  img{
    width: 100%
  }
}
</style>
