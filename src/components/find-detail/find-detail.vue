<template>
  <transition name="slide">
    <div class="find-detail-wrapper">
      <div class="head">
        <i class="back" @click="back"></i>
        <i class="like" :class="{active:isSC}" @click="handleCollect"></i>
      </div>
      <div class="banner-wrapper" ref="sliderWrapper">
        <slider v-if="article" :showDots="showDots" :loop="loop">
          <div v-for="item in article.advPic">
            <img :src="item | formatImg" @load="loadImage"/>
          </div>
        </slider>
        <div class="filter" ref="filter" v-show="!loop"></div>
      </div>
      <div class="bg-layer" ref="layer"></div>
      <div ref="scrollWrapper" class="scroll-wrapper">
        <scroll class="scroll-content"
                ref="scroll"
                @scroll="scroll"
                :listen-scroll="listenScroll"
                :probe-type="probeType">
          <div>
            <div class="description">
              <loading class="find-loading" v-show="!article" title=""></loading>
              <div ref="description" class="" v-html="article && article.description || ''"></div>
            </div>
          </div>
        </scroll>
      </div>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Slider from 'base/slider/slider';
  import {getArticle, collection, cancelCollection} from 'api/biz';
  import {commonMixin} from 'common/js/mixin';
  import {prefixStyle} from 'common/js/dom';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle, clearTag} from 'common/js/util';

  const RESERVED_HEIGHT = 62;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');

  export default {
    mixins: [commonMixin],
    data() {
      return {
        article: null,
        isSC: false,
        scrollY: 0,
        loop: true
      };
    },
    created() {
      this.showDots = false;
      this.probeType = 3;
      this.listenScroll = true;
      getArticle(this.$route.params.id).then((data) => {
        setTitle(data.article.title);
        initShare({
          title: data.article.title,
          desc: clearTag(data.article.description),
          link: location.href,
          imgUrl: getShareImg(data.article.advPic)
        });
        this.isSC = data.isSC === '1';
        data.article.advPic = data.article.advPic.split('||');
        this.article = data.article;
      });
    },
    mounted() {
      setTimeout(() => {
        let _maxHeight = window.innerWidth;
        this.$refs.sliderWrapper.style.maxHeight = _maxHeight + 'px';
      }, 20);
    },
    computed: {
      loop() {
        return this.article && this.article.advPic.length > 1;
      }
    },
    methods: {
      handleCollect() {
        if (this.isSC) {
          this.isSC = false;
          cancelCollection(this.$route.params.id).catch(() => {
            this.isSC = true;
          });
        } else {
          this.isSC = true;
          collection(this.$route.params.id).catch(() => {
            this.isSC = false;
          });
        }
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
      scroll(pos) {
        this.scrollY = pos.y;
      },
      back() {
        this.$router.back();
      },
      loadImage() {
        if(!this.checkLoaded) {
          setTimeout(() => {
            this.$refs.scrollWrapper.style.top = this.$refs.sliderWrapper.clientHeight + 'px';
            this.checkLoaded = true;
            this.imageHeight = this.$refs.sliderWrapper.clientHeight;
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
            setTimeout(() => {
              this.$refs.scroll.refresh();
            }, 20);
          }, 40);
        }
      }
    },
    watch: {
      article() {
        this._refreshScroll();
      },
      scrollY(newY) {
        let translateY = Math.max(this.minTranslateY, newY);
        let zIndex = 0;
        let scale = 1;
        let blur = 0;
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`;
        const percent = Math.abs(newY / this.imageHeight);
        if (newY > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else {
          blur = Math.min(20 * percent, 20);
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
        if (newY < this.minTranslateY) {
          zIndex = 10;
          this.$refs.sliderWrapper.style.height = `${RESERVED_HEIGHT}px`;
        } else {
          this.$refs.sliderWrapper.style.height = 'auto';
        }
        this.$refs.sliderWrapper.style.zIndex = zIndex;
        this.$refs.sliderWrapper.style[transform] = `scale(${scale})`;
      }
    },
    components: {
      Scroll,
      Loading,
      Slider
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .find-detail-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 101;

    .bg-layer {
      position: relative;
      height: 100%;
      background: #fff;
    }

    .head {
      .back {
        position: fixed;
        left: 0;
        top: 0;
        width: 62px;
        height: 62px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 12px;
        z-index: 102;
        @include bg-image('back');
      }

      .like {
        position: fixed;
        right: 0;
        top: 0;
        width: 62px;
        height: 62px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 20px;
        z-index: 102;
        @include bg-image('like');

        &.active {
          @include bg-image('like-act');
        }
      }
    }

    .banner-wrapper {
      position: relative;
      font-size: 0;
      overflow: hidden;

      img {
        width: 100%;
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.02);
      }
    }

    .scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      bottom: 0;

      .scroll-content {
        position: relative;
        height: 100%;
      }

      .description {
        padding: 32px 20px;

        img {
          max-width: 100%;
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
