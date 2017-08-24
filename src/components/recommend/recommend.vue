<template>
  <transition name="slide">
    <div class="recommend-wrapper">
      <div class="content">
        <img src="./bg@2x.png"/>
      </div>
      <div class="foot-btn">
        <button @click="getHistory">推荐历史</button>
      </div>
    </div>
  </transition>
</template>
<script>
  import {getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';

  export default {
    created() {
      setTitle('我的推荐');
    },
    mounted() {
      initShare({
        title: '合衣定制',
        desc: '合衣定制',
        link: location.href,
        imgUrl: getShareImg()
      });
    },
    methods: {
      getHistory() {}
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .recommend-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .content {
      padding: 18px;

      img {
        width: 100%;
      }
    }

    .foot-btn {
      display: flex;
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 18px;

      button {
        flex: 1;
        border-radius: 6px;
        line-height: 40px;
        font-size: $font-size-medium-x;
        color: #fff;
        background: $primary-color;
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
