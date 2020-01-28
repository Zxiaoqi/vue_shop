<template>
  <div id="categories">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" plain @click="addroleVisible=true,title='添加分类'">添加分类</el-button>
      <el-table
        :data="categoriesData"
        style="width: 100%;margin-bottom: 20px;"
        :row-key="id"
        border
        default-expand-all
        :tree-props="{children: 'children'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column
          prop="cat_name"
          label="分类"
          sortable>
        </el-table-column>
        <el-table-column
          prop="cat_deleted"
          label="状态"
          sortable>
        </el-table-column>
        <el-table-column
          prop="cat_level"
          label="层级">
          <el-tag closable type="success"></el-tag>
        </el-table-column>
        <el-table-column
          label="操作">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>

export default {
  data () {
    return {
      type: [1, 2, 3],
      pagenum: 1,
      pagesize: 10,
      categoriesData: []
    }
  },
  methods: {
    getCategoriesData () {
      this.$http.get('categories')
        .then(res => {
          const { data, meta } = res.data
          if (meta.status !== 200) {
            return this.$message.error(meta.msg)
          }
          this.categoriesData = data
          console.log(data)
        })
    }
  },
  created () {
    this.getCategoriesData()
  }
}
</script>

<style lang="less" scoped>
.el-table{
    margin-top: 15px
}
</style>
