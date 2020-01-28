<template>
  <div id="rights">
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }" replace>首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-table :data='rightsList' border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop='authName' label="权限名称"></el-table-column>
            <el-table-column prop='path' label="路径"></el-table-column>
            <el-table-column prop='level' label="权限等级">
                <template slot-scope="scope">
                    <el-tag v-if='scope.row.level==="0"'>一级</el-tag>
                    <el-tag type='success' v-else-if='scope.row.level==="1"'>二级</el-tag>
                    <el-tag type='warning' v-else-if='scope.row.level==="2"'>三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>
</template>

<script>

export default {
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.$http.get('rights/list').then(res => {
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.rightsList = data
      } else {
        this.$message.error(meta.msg)
      }
    })
  }
}
</script>

<style lang="less" scoped>

</style>
