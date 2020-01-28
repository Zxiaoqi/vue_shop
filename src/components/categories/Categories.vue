<template>
  <div id="categories">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" plain @click="addCatDialogVisible=true,title='添加分类'">添加分类</el-button>
      </el-row>
      <tree-table :data="cateListData" border
        :columns="columns"
        show-index index-text="#"
        :selection-type='false' :expand-type='false'
        :show-row-hover='false'>
        <!-- 是否有效 -->
          <template slot='isok' slot-scope='scope'>
            <i class='el-icon-success'
            v-if="scope.row.cat_deleted===false"
            style="color: lightgreen"></i>
            <i class='el-icon-error' v-else style="color:red"></i>
          </template>
          <!-- 排序 -->
          <template slot='order' slot-scope='scope'>
            <el-tag size='mini'
            v-if='scope.row.cat_level===0'>一级</el-tag>
            <el-tag size='mini' type='success'
            v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag size='mini' type='warning'
            v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot='opt'>
            <el-button type="primary" icon="el-icon-edit"
            size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete"
            size="mini">删除</el-button>
          </template>
        </tree-table>
        <!-- 分页器 -->
      <div class="block">
        <el-pagination
          :current-page="queryinfo.pagenum"
          :page-sizes="[5, 10, 15, 20,queryinfo.pagesize]"
          :page-size="queryinfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCatDialogVisible"
    width="40%" @close="clearSelect">
      <span>
        <el-form :model="addCatForm"
        :rules="addCatFormRules"
        ref="addCatFormRef"
        label-width="82px">
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCatForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader
            v-model="selectOptions"
            :options="selectParentcate"
            :props='selectProps'
            @change="changeParentCate" clearable>
            </el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCatDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data () {
    return {
      queryinfo: {
        type: [1, 2, 3],
        pagenum: 1,
        pagesize: 10
      },
      cateListData: [],
      total: 0,
      columns: [
        { label: '分类名称',
          prop: 'cat_name' },
        { label: '是否有效',
          type: 'template',
          template: 'isok' },
        { label: '排序',
          type: 'template',
          template: 'order' },
        { label: '操作',
          type: 'template',
          template: 'opt' }
      ],
      addCatDialogVisible: false,
      addCatForm: {
        cat_name: ''
      },
      addCatFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      selectOptions: [],
      selectParentcate: [],
      selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      }
    }
  },
  methods: {
    // 获取商品分类数据
    getCategoriesData () {
      this.$http.get('categories',
        { params: this.queryinfo })
        .then(res => {
          const { data, meta } = res.data
          if (meta.status !== 200) {
            return this.$message.error(meta.msg)
          }
          this.cateListData = data.result
          this.total = data.total
          this.queryinfo.pagesize = data.pagesize
        })
    },
    getParentCateList () {
      this.$http.get('categories',
        { params: { type: 2 } })
        .then(res => {
          const { data, meta } = res.data
          if (meta.status !== 200) {
            return this.$message.error(meta.msg)
          }
          this.selectParentcate = data
        })
    },
    // 父级分类改变
    changeParentCate () {},
    // 显示页数
    handleSizeChange (val) {
      this.queryinfo.pagesize = val
      this.getCategoriesData()
    },
    // 当前页
    handleCurrentChange (val) {
      this.queryinfo.pagenum = val
      this.getCategoriesData()
    },
    clearSelect () {
      this.addCatForm = {}
    }
  },
  created () {
    this.getCategoriesData()
    this.getParentCateList()
  }
}
</script>

<style lang="less" scoped>
.el-table{
    margin-top: 15px
}
</style>
