<template>
  <transition name="slide">
    <div class="introduce-wrapper">
      <scroll ref="scroll" class="introduce-content">
        <div>
          <div class="description" ref="description">
            <div v-html="content"></div>
          </div>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import {setTitle} from 'common/js/util';
  import {getUserSystemConfig} from 'api/general';

  export default {
    data() {
      return {
        content: ''
      };
    },
    created() {
      setTitle('会员介绍');
      getUserSystemConfig('memIntro').then((data) => {
        this.content = data.cvalue;
      });
    },
    methods: {
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
      }
    },
    watch: {
      content() {
        this._refreshScroll();
      }
    },
    components: {
      Scroll
    }
  };
</script>
<style lang="scss" scoped>
  .introduce-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: #fff;

    .introduce-content {
      height: 100%;
    }

    .description {
      padding: 18px;

      img {
        max-width: 100%;
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
