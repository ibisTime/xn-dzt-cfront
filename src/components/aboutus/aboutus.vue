<template>
  <transition name="slide">
    <div class="about-wrapper">
      <scroll class="about-content">
        <div>
          <div ref="description" class="description">
            <div v-html="content"></div>
            <div class="other-info">
              <p>服务时间：{{time}}</p>
              <p>服务热线：{{telephone}}</p>
            </div>
            <loading v-if="loadingFlag" title=""></loading>
          </div>
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
        content: '',
        telephone: '',
        time: '',
        loadingFlag: true
      };
    },
    created() {
      setTitle('关于我们');
      Promise.all([
        getUserSystemConfig('aboutUs'),
        getUserSystemConfig('telephone'),
        getUserSystemConfig('serviceTime')
      ]).then(([aboutus, telephone, time]) => {
        this.loadingFlag = false;
        this.telephone = telephone.cvalue;
        this.time = time.cvalue;
        this.content = aboutus.cvalue;
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
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .about-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 18px;
    background: #fff;

    .about-content {
      height: 100%;
      overflow: hidden;

      .description {
        padding: 18px;
      }

      .other-info {
        padding-top: 30px;
        line-height: 1.5;
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
