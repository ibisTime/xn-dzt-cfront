<template>
  <transition name="slide">
    <div class="product-detail-wrapper">
      <div class="head">
        <i class="back" @click="back"></i>
        <i class="like" @click="handleCollect" :class="{active:isSC}"></i>
      </div>
      <div class="banner-wrapper" ref="sliderWrapper">
        <slider v-if="currentModel" :showDots="showDots" :loop="loop">
          <div v-for="item in currentModel._advPic">
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
            <div class="description" ref="description">
              <loading class="find-loading" v-show="!currentModel" title=""></loading>
              <div v-html="currentModel && currentModel.description || ''"></div>
            </div>
          </div>
        </scroll>
      </div>
      <div class="footer">
        <button class="f-btn btn-yy" v-show="!isOrder" @click="_book">立即预约</button>
        <button :disabled="disabled" class="f-btn btn-fg" v-show="isOrder" @click="_reBook">一键复购</button>
      </div>
      <toast ref="toast" text="一键复购成功"></toast>
      <model-book ref="modelBook" :productCode="$route.params.id"></model-book>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_CURRENT_MODEL} from 'store/mutation-types';
  import Loading from 'base/loading/loading';
  import Slider from 'base/slider/slider';
  import Toast from 'base/toast/toast';
  import Scroll from 'base/scroll/scroll';
  import {getModel, collection, cancelCollection, reBook} from 'api/biz';
  import {commonMixin} from 'common/js/mixin';
  import {prefixStyle} from 'common/js/dom';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle} from 'common/js/util';
  import ModelBook from 'components/model-book/model-book';

  const RESERVED_HEIGHT = 62;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');

  export default {
    mixins: [commonMixin],
    data() {
      return {
        scrollY: 0,
        isOrder: false,
        isSC: false,
        disabled: false
      };
    },
    created() {
      this.showDots = false;
      this.probeType = 3;
      this.listenScroll = true;
      this._getModel();
    },
    mounted() {
      setTimeout(() => {
        let _maxHeight = window.innerWidth;
        this.$refs.sliderWrapper.style.maxHeight = _maxHeight + 'px';
      }, 20);
    },
    computed: {
      loop() {
        return this.currentModel && this.currentModel._advPic.length > 1;
      },
      ...mapGetters([
        'currentModel'
      ])
    },
    methods: {
      _getModel() {
        if (this.currentModel) {
          setTitle(this.currentModel.name);
        }
        getModel(this.$route.params.id).then((data) => {
          if (data.isOrder === '1') {
            this.isOrder = true;
          }
          if (data.isSC === '1') {
            this.isSC = true;
          }
          initShare({
            title: data.model.name,
            desc: data.model.name,
            link: location.href,
            imgUrl: getShareImg(data.model.advPic)
          });
          if (!this.currentModel) {
            data = data.model;
            setTitle(data.name);
            data._advPic = data.advPic.split('||');
            this.setCurModel(data);
          }
        });
      },
      handleCollect() {
        if (this.isSC) {
          this.isSC = false;
          cancelCollection(this.$route.params.id).then(() => {
            this.setCurModel({
              ...this.currentModel,
              isSC: '0'
            });
            this.$emit('update', this.currentModel);
          }).catch(() => {
            this.isSC = true;
          });
        } else {
          this.isSC = true;
          collection(this.$route.params.id).then(() => {
            this.setCurModel({
              ...this.currentModel,
              isSC: '1'
            });
            this.$emit('update', this.currentModel);
          }).catch(() => {
            this.isSC = false;
          });
        }
      },
      _book() {
        this.$refs.modelBook.show();
      },
      _reBook() {
        this.disabled = true;
        reBook(this.$route.params.id).then((data) => {
          this.disabled = false;
          this.$refs.toast.show();
        }).catch(() => {
          this.disabled = false;
        });
      },
      scroll(pos) {
        this.scrollY = pos.y;
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
          }, 20);
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
      back() {
        this.$router.back();
      },
      ...mapMutations({
        'setCurModel': SET_CURRENT_MODEL
      })
    },
    watch: {
      currentModel() {
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
      Slider,
      ModelBook,
      Toast
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .product-detail-wrapper {
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
      bottom: 64px;

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

    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      background: #fff;

      .f-btn {
        flex: 1;
        margin: 0 19px;
        padding: 0;
        height: 40px;
        line-height: 40px;
        border-radius: 6px;
        font-size: $font-size-medium-x;
        color: #fff;

        &.btn-yy {
          background: $primary-color;
        }

        &.btn-fg {
          background: rgb(167, 149, 47);
        }

        &[disabled] {
          background-color: $color-disable-background;
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
