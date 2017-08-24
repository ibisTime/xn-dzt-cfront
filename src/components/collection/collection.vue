<template>
  <transition name="slide">
    <div class="collection-wrapper">
      <div class="type-wrapper">
        <div class="type">
          <h2>产品</h2>
          <i class="arrow"></i>
        </div>
        <div class="type">
          <h2>面料</h2>
          <i class="arrow"></i>
        </div>
        <div class="type">
          <h2>工艺</h2>
          <i class="arrow"></i>
        </div>
        <div class="type">
          <h2>文章</h2>
          <i class="arrow"></i>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
  import {setTitle} from 'common/js/util';

  export default {
    created() {
      this.setTitle();
    },
    methods: {
      setTitle() {
        if (this.$route.path === '/user/collection') {
          setTitle('我的收藏');
        }
      }
    },
    updated() {
      this.setTitle();
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .collection-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .type-wrapper {
      padding: 0 18px;

      .type {
        position: relative;
        height: 39px;
        line-height: 39px;
        border-bottom: 1px solid #a1a1a1;
        font-size: $font-size-medium;
      }

      .arrow {
        position: absolute;
        right: 0;
        top: 0;
        width: 34px;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 10px;
        @include bg-image('more');
      }
    }
  }
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
