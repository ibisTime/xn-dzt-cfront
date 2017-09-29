<template>
  <transition name="slide">
    <div class="recommend-wrapper">
      <scroll ref="scroll" class="scroll-content">
        <div>
          <div class="rich-text-description" ref="description">
            <div v-html="content"></div>
          </div>
          <loading v-if="!content" title=""></loading>
        </div>
      </scroll>
      <div class="foot-btn">
        <button @click="showTJ">我要推荐</button>
        <button @click="goHistory">推荐历史</button>
      </div>
      <go-home></go-home>
      <share-mask ref="mask"></share-mask>
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
  import GoHome from 'components/go-home/go-home';
  import ShareMask from 'components/share-mask/share-mask';

  export default {
    data() {
      return {
        content: ''
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
      showTJ() {
        this.$refs.mask.show();
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
      Loading,
      GoHome,
      ShareMask
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
      bottom: 1.52rem;
      width: 100%;

      .description {
        padding: 0.36rem;
      }
    }

    .foot-btn {
      display: flex;
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0.36rem;

      button {
        flex: 1;
        border-radius: 0.12rem;
        line-height: 0.8rem;
        font-size: $font-size-medium-x;
        color: #fff;
        background: $primary-color;
        margin-left: 0.2rem;

        &:first-child {
          margin-right: 0.2rem;
          margin-left: 0;
        }
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
