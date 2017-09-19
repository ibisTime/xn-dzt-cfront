<template>
  <transition name="slide">
    <div class="product-detail-wrapper">
      <div class="banner-wrapper" ref="sliderWrapper">
        <slider class="in-slider" v-if="currentModel" :showDots="showDots" :loop="loop">
          <div v-for="item in currentModel._advPic">
            <img :src="item | formatImg" @load="loadImage"/>
          </div>
        </slider>
        <div class="head">
          <i class="back" @click="back"></i>
          <i class="like" @click="handleCollect" :class="{active:isSC}"></i>
        </div>
        <div class="filter" ref="filter" v-show="!loop"></div>
      </div>
      <div class="split"></div>
      <div class="bg-layer" ref="layer"></div>
      <div ref="scrollWrapper" class="scroll-wrapper">
        <scroll class="scroll-content"
                ref="scroll"
                @scroll="scroll"
                :listen-scroll="listenScroll"
                :probe-type="probeType">
          <div>
            <div class="rich-text-description" ref="description">
              <div v-html="currentModel && currentModel.description || ''"></div>
            </div>
          </div>
        </scroll>
      </div>
      <div class="footer">
        <button :disabled="disabled" v-show="curBtn==='bookBtn'" class="f-btn btn-yy" @click="_book">提交预约</button>
        <button :disabled="disabled" v-show="curBtn==='cancelBtn'" class="f-btn btn-cancel" @click="_cancel">取消预约</button>
        <button :disabled="disabled" v-show="curBtn==='reBtn'" class="f-btn btn-fg" @click="_reBook">一键复购</button>
      </div>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
      <go-home></go-home>
      <model-book v-if="latestOrder"
                  ref="modelBook"
                  :latestOrder="latestOrder"
                  :productCode="$route.params.id"
                  @bookSuc="handleBook"
                  @bookCancel="handleCancelBook"></model-book>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_CURRENT_MODEL} from 'store/mutation-types';
  import Loading from 'base/loading/loading';
  import Slider from 'base/slider/slider';
  import Scroll from 'base/scroll/scroll';
  import {getModel, collection, cancelCollection, getLatestOrder} from 'api/biz';
  import {commonMixin} from 'common/js/mixin';
  import {prefixStyle} from 'common/js/dom';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle, clearTag} from 'common/js/util';
  import ModelBook from 'components/model-book/model-book';
  import GoHome from 'components/go-home/go-home';

  const RESERVED_HEIGHT = 0;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');

  export default {
    mixins: [commonMixin],
    data() {
      return {
        scrollY: 0,
        isSC: false,
        disabled: false,
        loadingFlag: true,
        latestOrder: null,
        curBtn: 'bookBtn'
      };
    },
    created() {
      setTitle('样品详情');
      this.showDots = false;
      this.probeType = 3;
      this.listenScroll = true;
      Promise.all([
        this._getModel(),
        this._getLatestOrder()
      ]).then(() => {
        this.loadingFlag = false;
      }).catch(() => {
        this.loadingFlag = false;
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
        return this.currentModel && this.currentModel._advPic.length > 1;
      },
      ...mapGetters([
        'currentModel'
      ])
    },
    methods: {
      _getModel() {
        return getModel(this.$route.params.id).then((data) => {
          if (data.isSC === '1') {
            this.isSC = true;
          }
          initShare({
            title: '样品详情',
            desc: clearTag(data.description),
            link: location.href,
            imgUrl: getShareImg(data.advPic)
          });
          if (!this.currentModel) {
            data._advPic = data.advPic.split('||');
            this.setCurModel(data);
          }
        });
      },
      _getLatestOrder() {
        return getLatestOrder().then((data) => {
          this.latestOrder = data;
          if (data.order) {
            if (data.order.status === '1' || data.order.status === '2') {
              this.curBtn = 'cancelBtn';
            } else if (data.order.status !== '11') {
              this.curBtn = 'reBtn';
            }
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
        this.$refs.modelBook.show(this.latestOrder);
      },
      _cancel() {
        this.$refs.modelBook.show(this.latestOrder);
      },
      _reBook() {
        this.$refs.modelBook.show(this.latestOrder);
      },
      handleBook(code) {
        this.curBtn = 'cancelBtn';
      },
      handleCancelBook(order, curBtn) {
        this.latestOrder = order;
        this.curBtn = curBtn;
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
      GoHome,
      ModelBook
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

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
      }
    }

    .bg-layer {
      position: relative;
      height: 100%;
      background: #fff;
    }

    .split {
      height: 10px;
      background: #f2f2f2;
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

      .in-slider {
        min-height: 62px;
      }

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
          background: $second-color;
        }

        &.btn-cancel {
          background: $color-cancel-background;
        }

        &[disabled] {
          background: $color-disable-background;
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
