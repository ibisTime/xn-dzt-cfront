<template>
  <transition name="slide">
    <div class="welfare-wrapper">
      <scroll ref="scroll" class="welfare-content">
        <div>
          <div class="rich-text-description" ref="description">
            <div v-html="content"></div>
          </div>
          <loading v-if="!content" title=""></loading>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {setTitle} from 'common/js/util';
  import {getUserSystemConfig} from 'api/general';

  export default {
    data() {
      return {
        content: ''
      };
    },
    created() {
      setTitle('会员福利');
      getUserSystemConfig('memWelfare').then((data) => {
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
      Scroll,
      Loading
    }
  };
</script>
<style lang="scss" scoped>
  .welfare-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: #fff;

    .welfare-content {
      height: 100%;
    }

    .description {
      padding: 0.36rem;

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
