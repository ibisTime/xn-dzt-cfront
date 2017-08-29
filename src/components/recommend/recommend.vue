<template>
  <transition name="slide">
    <div class="recommend-wrapper">
      <scroll ref="scroll" class="scroll-content">
        <div>
          <div class="description" ref="description">
            <div v-html="content"></div>
          </div>
          <loading v-if="!content" title=""></loading>
        </div>
      </scroll>
      <div class="foot-btn">
        <button @click="showTJ">我要推荐</button>
        <button @click="goHistory">推荐历史</button>
      </div>
      <div class="mask" @click="_hideMask" v-show="showMask">
        <div class="content">
          <p>请点击右上角</p>
          <p>将它发送给指定朋友</p>
          <p>或分享到朋友圈</p>
        </div>
        <img src="./arrow.png" class="arrow">
      </div>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {getUserSystemConfig} from 'api/general';

  export default {
    data() {
      return {
        content: '',
        showMask: false
      };
    },
    created() {
      this.isWxConfiging = false;
      this.wxData = null;
      this.initData();
    },
    updated() {
      this.initData();
    },
    methods: {
      initData() {
        if (this.$route.path === '/user/recommend') {
          setTitle('我的推荐');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData) {
            this.initShare();
          }
          if (!this.content) {
            this.getContent();
          }
        } else {
          this.isWxConfiging = false;
          this.wxData = null;
        }
      },
      getContent() {
        getUserSystemConfig('commend').then((data) => {
          this.content = data.cvalue;
        });
      },
      initShare() {
        this.isWxConfiging = true;
        initShare({
          title: '合衣定制',
          desc: '合衣定制',
          link: location.href,
          imgUrl: getShareImg()
        }, (data) => {
          this.isWxConfiging = false;
          this.wxData = data;
        }, () => {
          this.isWxConfiging = false;
          this.wxData = null;
        });
      },
      _refreshScroll() {
        setTimeout(() => {
          let imgs = this.$refs.description.getElementsByTagName('img');
          for (let i = 0; i < imgs.length; i++) {
            let _img = imgs[i];
            if (_img.complete) {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
              continue;
            }
            _img.onload = () => {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
            };
          }
        }, 20);
      },
      _hideMask() {
        this.showMask = false;
      },
      showTJ() {
        this.showMask = true;
      },
      goHistory() {
        this.$router.push('/user/recommend/history');
      }
    },
    watch: {
      content() {
        this._refreshScroll();
      }
    },
    components: {
      Scroll,
      Loading
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

    .scroll-content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 76px;
      width: 100%;

      .description {
        padding: 18px;
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
        margin-left: 10px;

        &:first-child {
          margin-right: 10px;
          margin-left: 0;
        }
      }
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .content {
        position: absolute;
        top: 90px;
        left: 30%;
        text-align: center;
        color: #fff;
        line-height: 1.5;
        font-size: $font-size-large-xx;
      }

      .arrow {
        position: absolute;
        top: 10px;
        right: 20px;
        width: 80px;
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
