<template>
  <transition name="slide">
    <div class="collection-wrapper">
      <div class="type-wrapper">
        <router-link to="/user/collection/product" tag="div" class="type needsclick">
          <h2>样品</h2>
          <i class="arrow"></i>
        </router-link>
        <router-link to="/user/collection/material" tag="div" class="type needsclick">
          <h2>面料</h2>
          <i class="arrow"></i>
        </router-link>
        <router-link to="/user/collection/tech" tag="div" class="type needsclick">
          <h2>工艺</h2>
          <i class="arrow"></i>
        </router-link>
        <router-link to="/user/collection/find" tag="div" class="type needsclick">
          <h2>文章</h2>
          <i class="arrow"></i>
        </router-link>
      </div>
      <router-view></router-view>
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
      padding: 0 0.36rem;

      .type {
        position: relative;
        height: 0.78rem;
        line-height: 0.78rem;
        border-bottom: 1px solid #a1a1a1;
        font-size: $font-size-medium;
      }

      .arrow {
        position: absolute;
        right: 0;
        top: 0;
        width: 0.68rem;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 0.2rem;
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
