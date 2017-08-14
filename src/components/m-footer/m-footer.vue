<template>
  <div class="foot-wrapper">
    <router-link tag="div" class="foot-item item-0" to="/home">
    </router-link>
    <router-link tag="div" class="foot-item item-1" to="/home1">
    </router-link>
    <router-link tag="div" class="foot-item item-2" to="/home2">
    </router-link>
    <router-link tag="div" class="foot-item item-3" to="/home3">
    </router-link>
  </div>
</template>
<script>
  export default {
    props: {
      currentIndex: {
        type: Number,
        default: 0
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";

  .foot-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    height: 49px;
    width: 100%;
    background: #fff;

    .foot-item {
      flex: 1;
      margin: 10px 0;
      height: 25px;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;

      &.item-0 {
        @include bg-image('home');

        &.router-link-active {
          @include bg-image('home-act');
        }
      }

      &.item-1 {
        @include bg-image('book');

        &.router-link-active {
          @include bg-image('book-act');
        }
      }

      &.item-2 {
        @include bg-image('find');

        &.router-link-active {
          @include bg-image('find-act');
        }
      }

      &.item-3 {
        @include bg-image('mine');

        &.router-link-active {
          @include bg-image('mine-act');
        }
      }
    }
  }
</style>
