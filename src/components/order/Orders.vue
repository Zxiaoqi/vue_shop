<template>
    <div>
        <h3>订单列表</h3>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索栏 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable
                    @change='getOrdersData'>
                        <el-button slot="append" icon="el-icon-search"
                        @click="getOrdersData"></el-button>
                    </el-input>
                </el-col>
            </el-row>
             <!-- 订单表格 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="130px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="150px">
                    <template slot-scope="scope">
                        <el-tag type="success"
                        v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="140px"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="info" icon="el-icon-s-order"
                        @click="showOrderDialog(scope.row.order_id)"></el-button>
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                        @click="showEditAddress"></el-button>
                        <el-button size="mini" type="success" icon="el-icon-location"
                        @click="showProgress"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页器 -->
            <el-pagination
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20,queryInfo.pagesize]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog title="修改收货地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <!-- 添加表单 -->
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"
                    :props="cityProps"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流信息进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
            <!-- 时间线组件  -->
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressInfo"
                :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
        <!-- 订单信息 -->
        <el-dialog title="订单信息" :visible.sync="orderDialogVisible" width="50%">
          <el-form ref="orderMessageRef" :model="orderMessage"
          :rules='orderRules' label-width="80px">
            <el-form-item label="订单编号:">
              <div>{{orderMessage.order_number}}</div>
            </el-form-item>
            <el-form-item label="订单价格" prop="order_price">
              <el-input v-model='orderMessage.order_price' type="number" min=0></el-input>
            </el-form-item>
            <el-form-item label="订单数量" prop="order_number">
              <el-input v-model='orderMessage.order_number' type="number" min=0></el-input>
            </el-form-item>
            <el-form-item label="订单支付">
               <el-radio-group v-model="orderMessage.order_pay">
                <el-radio :label="'0'">未支付</el-radio>
                <el-radio :label="'1'">支付宝</el-radio>
                <el-radio :label="'2'">微信</el-radio>
                <el-radio :label="'3'">银行卡</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="支付状态">
              <el-switch v-model="orderMessage.pay_status"
              active-value="1"
              active-text="已付款"
              inactive-value="0"
              inactive-text="未付款"></el-switch>
            </el-form-item>
            <el-form-item label="是否发货">
              <el-switch
                v-model="orderMessage.is_send"
                active-value="是"
                active-text="是"
                inactive-value="否"
                inactive-text="否">
              </el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editOrder">确认</el-button>
              <el-button @click='orderDialogVisible=false'>取消</el-button>
            </el-form-item>
          </el-form>
          <!-- {{orderMessage}} -->
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      // 订单列表
      orderList: [],
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      addressVisible: false,
      // 地址
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      cityData: cityData,
      cityProps: {
        expandTrigger: 'hover'
      },
      progressVisible: false,
      progressInfo: [],
      // 订单信息
      orderMessage: [],
      orderRules: {
        order_price: [{ required: true, message: '请填写订单价格', trigger: 'blur' }],
        order_number: [{ required: true, message: '请填写订单数量', trigger: 'blur' }]
      },
      orderDialogVisible: false,
      orderId: ''
    }
  },
  created () {
    this.getOrdersData()
  },
  methods: {
    async getOrdersData () {
      const { data: res } = await this.$http.get('orders',
        { params: this.queryInfo })
      //   console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 显示页数
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getOrdersData()
    },
    // 当前页
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getOrdersData()
    },
    // 地址对话框
    showEditAddress () {
      this.addressVisible = true
    },
    // 清除输入框内容
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 物流信息
    async showProgress () {
      const { data: res } = await this.$http.get(`/kuaidi/${804909574412544580}`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.message)
      }
      //   console.log(res.data)
      this.progressInfo = res.data
      this.progressVisible = true
    },
    showOrderDialog (id) {
      this.$http.get(`orders/${id}`).then(res => {
        const { data, meta } = res.data
        if (meta.status !== 200) {
          this.$message.error(meta.msg)
        }
        this.orderMessage = data
        this.orderId = id
        this.orderDialogVisible = true
      })
    },
    editOrder () {
      this.$refs.orderMessageRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`orders/${this.orderId}`,
          this.orderMessage)
        // 文档数据有误
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        }
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
  }
}
</script>

<style lang="less" scoped>

</style>
