<template>
  <div id="categories">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getGoodsData">
                <el-button slot="append" icon="el-icon-search" @click="getGoodsData"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" width="105px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="95px"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="100px">
              <template slot-scope="scope">
                  {{scope.row.add_time | dateFormat}}
              </template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
              <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit"
                  @click="showEditGoods(scope.row.goods_id)"></el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete"
                  @click="deleteGoods(scope.row.goods_id)"></el-button>
              </template>
          </el-table-column>
      </el-table>
       <!-- 分页器 -->
      <el-pagination
      :current-page="queryinfo.pagenum"
      :page-sizes="[5, 10, 15, 20,queryinfo.pagesize]"
      :page-size="queryinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>

export default {
  data () {
    return {
      goodsList: [],
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 7
      },
      total: 0,
      goodForm: []
    }
  },
  methods: {
    // 获取商品数据
    getGoodsData () {
      this.$http.get('goods', { params: this.queryinfo }).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.goodsList = data.goods
          this.total = data.total
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 显示页数
    handleSizeChange (val) {
      this.queryinfo.pagesize = val
      this.getGoodsData()
    },
    // 当前页
    handleCurrentChange (val) {
      this.queryinfo.pagenum = val
      this.getGoodsData()
    },
    // 去添加页面
    goAddPage () {
      this.$router.push('/goods/addGood')
    },
    // 编辑按钮
    showEditGoods (id) {
      this.$http.get(`goods/${id}`).then(res => {
        console.log(res)
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.goodForm = data
        } else {
          this.$message.error(meta.msg)
        }
      })
    },
    // 删除商品
    deleteGoods (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`goods/${id}`).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            this.$message.success(meta.msg)
            this.getGoodsData()
          } else {
            this.$message.error(meta.msg)
          }
        })
        // this.$http.put(`goods/${id}/pics`)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  filters: {
    // 创建过滤器将秒数过滤为年月日，时分秒
    dateFormat (originVal) {
      const dt = new Date(originVal)
      const y = dt.getFullYear()
      const m = (dt.getMonth() + 1 + '').padStart(2, '0')
      const d = (dt.getDate() + '').padStart(2, '0')

      const hh = (dt.getHours() + '').padStart(2, '0')
      const mm = (dt.getMinutes() + '').padStart(2, '0')
      const ss = (dt.getSeconds() + '').padStart(2, '0')

      return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
  },
  created () {
    this.getGoodsData()
  }
}
</script>

<style lang="less" scoped>

</style>
