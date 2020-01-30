<template>
  <div id="categories">
categories
  </div>
</template>

<script>

export default {
  data () {
    return {
      goodsList: []
    }
  },
  methods: {
    getGoodsData () {
      this.$http.get('goods').then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.goodsList = data
          this.$messaga.success(meta.msg)
        } else {
          this.$messaga.error(meta.msg)
        }
      })
    }
  },
  created () {
  }
}
</script>

<style lang="less" scoped>

</style>
