<template>
  <transition name="slide">
    <div class="flow-wrapper">
      <div class="no-result-wrapper">
        <no-result title="抱歉，暂无兑换商品"></no-result>
      </div>
    </div>
  </transition>
</template>
<script>
  import NoResult from 'base/no-result/no-result';
  import {setTitle} from 'common/js/util';

  export default {
    created() {
      setTitle('积分兑换');
    },
    components: {
      NoResult
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .flow-wrapper{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
